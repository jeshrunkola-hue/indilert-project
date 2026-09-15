"""
Interactive Real-Time Simulation Engine for Demo Mode.
Simulates a rapid cloudburst and slope saturation scenario in a high-risk NER district
(e.g., Dima Hasao, Assam or East Khasi Hills, Meghalaya).
"""
from typing import Dict, Any
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.spatial import Zone, Road, District, RiskLevel, RoadStatus
from app.models.telemetry import Sensor, SensorReading, WeatherData
from app.models.incidents import CitizenReport, Incident, IncidentStatus, ReportType
from app.models.emergency_alerts import EmergencyAlert, AlertMode, AlertSeverity
from app.services.ml_service import ml_service
from app.services.alert_engine import alert_engine

class SimulationEngine:
    def __init__(self):
        self.state = {
            "is_simulating": False,
            "current_step": 0,
            "total_steps": 4,
            "scenario_name": "Cloudburst & Slope Failure in Dima Hasao Escarpment",
            "target_zone_name": "Jatinga Escarpment Slope",
            "logs": []
        }

    def get_status(self) -> Dict[str, Any]:
        return self.state

    def reset_simulation(self, db: Session) -> Dict[str, Any]:
        """Reset the simulated district to initial calm baseline."""
        zone = db.query(Zone).filter(Zone.name.like("%Jatinga%")).first()
        if zone:
            zone.current_risk_score = 42.0
            zone.current_risk_level = RiskLevel.MODERATE
            zone.soil_moisture = 48.0
            zone.rainfall_1h = 4.0
            zone.rainfall_3h = 10.0
            zone.rainfall_6h = 22.0
            zone.rainfall_24h = 48.0
            db.commit()

        road = db.query(Road).filter(Road.route_number.like("%NH-27%")).first()
        if road:
            road.status = RoadStatus.OPEN
            road.blockage_reason = None
            db.commit()

        sensors = db.query(Sensor).filter(Sensor.district_name.like("%Dima Hasao%")).all()
        for s in sensors:
            s.soil_moisture = 48.0
            s.status = "ONLINE"
        db.commit()

        # Clean up only DEMO mode alerts; strictly preserve real LIVE alerts
        db.query(EmergencyAlert).filter(EmergencyAlert.mode == AlertMode.DEMO).delete()
        db.commit()

        self.state["is_simulating"] = False
        self.state["current_step"] = 0
        self.state["demo_alert_ready"] = False
        self.state["staged_alert"] = None
        self.state["logs"] = ["Simulation reset to normal monsoon baseline. Live emergency alerts preserved."]
        return self.state

    def advance_simulation_step(self, db: Session, target_step: int = None) -> Dict[str, Any]:
        """
        Advances the storm scenario by one step or to specified step:
        Step 1: Intense Rainfall Spikes (42 -> 58 risk)
        Step 2: Soil Moisture Saturation (58 -> 72 risk, HIGH, Warning alert)
        Step 3: Tension Cracks & Landslide Onset (72 -> 88 risk, CRITICAL, Emergency alert, Road NH-27 Blocked)
        Step 4: Full Multi-agency Emergency Response Activated
        """
        if target_step is None:
            next_step = self.state["current_step"] + 1
            if next_step > self.state["total_steps"]:
                next_step = self.state["total_steps"]
        else:
            next_step = target_step

        self.state["current_step"] = next_step
        self.state["is_simulating"] = True

        zone = db.query(Zone).filter(Zone.name.like("%Jatinga%")).first()
        if not zone:
            zone = db.query(Zone).first()

        road = db.query(Road).filter(Road.route_number.like("%NH-27%")).first()
        sensors = db.query(Sensor).filter(Sensor.district_name == zone.district_name).all()
        weather = db.query(WeatherData).filter(WeatherData.district_name == zone.district_name).first()

        if next_step == 1:
            # Step 1: Cloudburst starts
            zone.rainfall_1h = 28.0
            zone.rainfall_3h = 55.0
            zone.rainfall_6h = 82.0
            zone.rainfall_24h = 110.0
            zone.soil_moisture = 62.0
            if weather:
                weather.current_rainfall = 32.0
                weather.rainfall_intensity = "Heavy"
                weather.rainfall_24h = 110.0
                weather.weather_warning = "ORANGE: Severe precipitation advisory"
            for s in sensors:
                s.soil_moisture = 62.0
            msg = f"Step 1: Cloudburst begins over {zone.district_name}. Rainfall surged to 28mm/hr (110mm/24h)."

        elif next_step == 2:
            # Step 2: Soil Moisture rises to critical thresholds
            zone.rainfall_1h = 42.0
            zone.rainfall_3h = 88.0
            zone.rainfall_6h = 135.0
            zone.rainfall_24h = 175.0
            zone.soil_moisture = 78.0
            if weather:
                weather.current_rainfall = 45.0
                weather.rainfall_intensity = "Very Heavy"
                weather.rainfall_24h = 175.0
                weather.weather_warning = "RED: Flash flood and slope failure alert"
            for s in sensors:
                s.soil_moisture = 78.0
                s.status = "WARNING"
            if road:
                road.status = RoadStatus.RESTRICTED
                road.blockage_reason = "Runoff slurry and minor scree deposit on outer lane"
            msg = f"Step 2: Soil moisture reached 78% pore saturation. Road {road.route_number if road else 'NH-27'} placed on RESTRICTED status."

        elif next_step >= 3:
            # Step 3: Slope movement occurs, Critical Landslide Trigger
            zone.rainfall_1h = 56.0
            zone.rainfall_3h = 115.0
            zone.rainfall_6h = 180.0
            zone.rainfall_24h = 230.0
            zone.soil_moisture = 91.0
            if weather:
                weather.current_rainfall = 55.0
                weather.rainfall_intensity = "Extremely Heavy"
                weather.rainfall_24h = 230.0
                weather.weather_warning = "RED: CRITICAL CLOUDBURST EVENT"
            for s in sensors:
                s.soil_moisture = 91.0
                s.status = "WARNING"
            if road:
                road.status = RoadStatus.BLOCKED
                road.blockage_reason = "Massive rockfall and mudslide debris covering both carriageways (approx 1,500 cu.m)"
                road.isolated_population = 14500

            # Inject a simulated urgent citizen report
            rep = CitizenReport(
                reporter_name="Field Patrol Team Alpha",
                reporter_role="FIELD_OFFICER",
                report_type=ReportType.LANDSLIDE,
                latitude=zone.center_lat + 0.003,
                longitude=zone.center_lng - 0.002,
                district_name=zone.district_name,
                description="Massive slope failure just triggered above Jatinga tunnel cut. NH-27 completely blocked with boulders and mud slurry. Urgent SDRF clearance needed.",
                media_urls=["https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800"],
                severity=RiskLevel.CRITICAL,
                ai_assessed_type="Rotational Debris Slide",
                ai_assessed_severity=RiskLevel.CRITICAL,
                ai_confidence=0.96,
                ai_recommended_action="Suspend all traffic immediately. Mobilize 3 heavy excavators and alert Haflong Civil Hospital.",
                is_verified=True,
                status=IncidentStatus.RESPONSE_STARTED
            )
            db.add(rep)

            # Create incident
            inc = Incident(
                title=f"Major Landslide on NH-27 Corridor ({zone.name})",
                description="Debris flow blocking NH-27 lifeline highway connecting Silchar to Guwahati. Power lines damaged.",
                district_name=zone.district_name,
                zone_name=zone.name,
                latitude=zone.center_lat,
                longitude=zone.center_lng,
                severity=RiskLevel.CRITICAL,
                status=IncidentStatus.RESPONSE_STARTED,
                report_source="FIELD_PATROL",
                assigned_team="SDRF 3rd Battalion & BRO Task Force 42",
                evacuation_required=True
            )
            db.add(inc)

            msg = f"Step 3: CRITICAL SLOPE COLLAPSE! AI risk jumped to 88%. Emergency broadcast triggered. {road.route_number if road else 'NH-27'} is BLOCKED."

        # Run AI inference to compute new risk
        prediction = ml_service.predict({
            "rainfall_1h": zone.rainfall_1h,
            "rainfall_3h": zone.rainfall_3h,
            "rainfall_6h": zone.rainfall_6h,
            "rainfall_24h": zone.rainfall_24h,
            "rainfall_intensity": zone.rainfall_1h,
            "soil_moisture": zone.soil_moisture,
            "slope_angle": zone.slope_angle,
            "elevation": zone.elevation,
            "historical_landslide_freq": zone.historical_incidents_count,
            "distance_from_road": 40.0,
            "field_reports": 2
        })

        zone.current_risk_score = prediction["risk_score"]
        zone.current_risk_level = prediction["risk_level"]
        zone.contributing_factors = prediction["contributing_factors"]
        zone.ai_prediction_summary = prediction["prediction_window"]

        # Update parent district risk
        district = db.query(District).filter(District.name == zone.district_name).first()
        if district:
            district.current_risk_score = zone.current_risk_score
            district.current_risk_level = zone.current_risk_level
            district.blocked_roads_count = 1 if road and road.status == RoadStatus.BLOCKED else 0
            district.active_incidents_count = district.active_incidents_count + 1

        db.commit()

        if next_step >= 3:
            self.state["demo_alert_ready"] = True
            self.state["staged_alert"] = {
                "title": f"Critical Landslide Warning: {zone.name}",
                "message": f"High probability of rotational slope failure detected in {zone.district_name}. NH-27 lifeline corridor severely obstructed.",
                "severity": "CRITICAL",
                "district": zone.district_name,
                "risk_score": 88.0,
                "expected_window": "Next 1-3 hours",
                "recommended_action": "Evacuate vulnerable downhill habitations immediately. Avoid NH-27 transit.",
                "mode": "DEMO"
            }

        # Trigger alert engine evaluation
        alert_engine.evaluate_and_generate_alerts(db)

        self.state["logs"].append(msg)
        return {
            **self.state,
            "latest_message": msg,
            "zone_risk_score": zone.current_risk_score,
            "zone_risk_level": zone.current_risk_level.value,
            "soil_moisture": zone.soil_moisture,
            "rainfall_24h": zone.rainfall_24h,
            "road_status": road.status.value if road else "UNKNOWN"
        }

simulation_engine = SimulationEngine()
