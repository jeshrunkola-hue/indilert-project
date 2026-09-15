"""
Response Prioritization Engine for Disaster Management Authorities.
Calculates multidimensional vulnerability and priority scores to order
disaster response deployments across the North Eastern Region.
"""
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.spatial import Zone, Road, Village, Infrastructure, RiskLevel, RoadStatus

class ResponsePrioritizationEngine:
    def evaluate_priorities(self, db: Session) -> List[Dict[str, Any]]:
        zones = db.query(Zone).all()
        roads = db.query(Road).all()
        villages = db.query(Village).all()
        infra = db.query(Infrastructure).all()

        priorities = []

        for z in zones:
            # 1. Base Risk Factor
            risk_score = z.current_risk_score
            risk_weight = 0.35

            # 2. Population Factor (villages linked to this zone or district)
            zone_villages = [v for v in villages if v.zone_id == z.id or v.district_id == z.district_id]
            total_pop = sum(v.population for v in zone_villages) or 1500
            pop_score = min(100.0, (total_pop / 5000.0) * 100.0)
            pop_weight = 0.25

            # 3. Road Network Factor
            district_roads = [r for r in roads if r.district_id == z.district_id]
            road_score = 20.0
            critical_road_names = []
            has_blocked_road = False
            for r in district_roads:
                if r.status in [RoadStatus.BLOCKED, RoadStatus.PARTIALLY_BLOCKED]:
                    road_score = max(road_score, 90.0)
                    critical_road_names.append(f"{r.route_number} ({r.status.value})")
                    has_blocked_road = True
                elif r.status == RoadStatus.RESTRICTED:
                    road_score = max(road_score, 60.0)
                    critical_road_names.append(f"{r.route_number} (RESTRICTED)")
                else:
                    critical_road_names.append(r.route_number)

            road_weight = 0.20

            # 4. Critical Infrastructure Factor
            district_infra = [i for i in infra if i.district_id == z.district_id]
            infra_score = min(100.0, len(district_infra) * 25.0)
            infra_weight = 0.10

            # 5. Immediacy Factor (Time to expected failure)
            if z.current_risk_level == RiskLevel.CRITICAL:
                urgency_score = 95.0
                time_window = "Next 1–3 hours"
            elif z.current_risk_level == RiskLevel.HIGH:
                urgency_score = 75.0
                time_window = "Next 3–6 hours"
            elif z.current_risk_level == RiskLevel.MODERATE:
                urgency_score = 40.0
                time_window = "Next 12–24 hours"
            else:
                urgency_score = 15.0
                time_window = "> 24 hours"
            urgency_weight = 0.10

            # Composite Priority Index (0 - 100)
            composite_priority = (
                risk_score * risk_weight +
                pop_score * pop_weight +
                road_score * road_weight +
                infra_score * infra_weight +
                urgency_score * urgency_weight
            )
            composite_priority = round(min(100.0, composite_priority), 1)

            # Generate actionable recommended intervention
            if z.current_risk_level == RiskLevel.CRITICAL:
                action = "Deploy SDRF/NDRF search-and-rescue team, initiate immediate village evacuation to designated shelters, and impose preventive traffic suspension on vulnerable highway cuts."
            elif z.current_risk_level == RiskLevel.HIGH:
                action = "Deploy quick-response engineering team, activate heavy earthmovers (JCB/excavators) near highway passes, and issue Cell Broadcast warning to transit passengers."
            elif z.current_risk_level == RiskLevel.MODERATE:
                action = "Place local PWD and police checkpoints on active vigil, monitor real-time inclinometer feeds, and clear road-side stormwater drainage channels."
            else:
                action = "Routine automated IoT sensor polling and drone/satellite observation."

            road_desc = ", ".join(critical_road_names[:2]) if critical_road_names else "State Highway Corridor"

            priorities.append({
                "zone_id": z.id,
                "zone_name": z.name,
                "district_name": z.district_name,
                "priority_score": composite_priority,
                "risk_level": z.current_risk_level.value,
                "risk_score": z.current_risk_score,
                "population_affected": total_pop,
                "key_corridor": road_desc,
                "has_blocked_road": has_blocked_road,
                "expected_window": time_window,
                "nearby_critical_facilities": [f"{i.name} ({i.type.value})" for i in district_infra[:3]],
                "recommended_action": action
            })

        # Rank descending by priority_score
        priorities.sort(key=lambda x: x["priority_score"], reverse=True)
        
        for idx, item in enumerate(priorities, 1):
            item["rank"] = idx

        return priorities

prioritization_engine = ResponsePrioritizationEngine()
