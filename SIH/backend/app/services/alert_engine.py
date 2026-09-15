"""
Emergency Alert Engine and rule-based triggering service.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.spatial import Zone, District, RiskLevel
from app.models.alerts import Alert, AlertLevel, EmergencyBroadcastLog
from app.integrations.broadcast_provider import MockCAPBroadcastProvider

class AlertEngine:
    def __init__(self):
        self.broadcast_provider = MockCAPBroadcastProvider()

    def evaluate_and_generate_alerts(self, db: Session) -> List[Alert]:
        """
        Scans all zones and automatically issues or updates alerts
        when risk levels cross warning or critical thresholds.
        """
        zones = db.query(Zone).all()
        new_alerts = []

        for z in zones:
            if z.current_risk_score >= 80.0:
                alert_level = AlertLevel.LEVEL_4_EMERGENCY
                level_title = "CRITICAL EMERGENCY LANDSLIDE ALERT"
            elif z.current_risk_score >= 60.0:
                alert_level = AlertLevel.LEVEL_3_WARNING
                level_title = "HIGH SEVERITY LANDSLIDE WARNING"
            elif z.current_risk_score >= 40.0:
                alert_level = AlertLevel.LEVEL_2_WATCH
                level_title = "LANDSLIDE WATCH ADVISORY"
            else:
                continue

            # Check if active alert already exists for this zone
            existing = db.query(Alert).filter(
                Alert.zone_name == z.name,
                Alert.is_active == True,
                Alert.level == alert_level
            ).first()

            if not existing:
                import uuid
                code = f"ALT-NER-{datetime.now().strftime('%Y%m%d')}-{z.id:03d}-{uuid.uuid4().hex[:6].upper()}"
                action_text = (
                    f"Immediate action in {z.district_name} ({z.name}): High probability of slope failure within 3–6 hours. "
                    "Evacuate vulnerable settlements near steep hill cuts. Restrict movement on adjacent mountain roads."
                )

                # Multilingual translation templates
                msg_en = f"🚨 {level_title}: Landslide risk score is {z.current_risk_score:.0f}% in {z.name}, {z.district_name}. Continuous heavy rainfall has saturated slope soil ({z.soil_moisture:.0f}%). Avoid mountain roads."
                msg_hi = f"🚨 {level_title}: {z.district_name} के {z.name} क्षेत्र में भूस्खलन का जोखिम {z.current_risk_score:.0f}% है। भारी बारिश के कारण ढलान अस्थिर हो गई है। पहाड़ी मार्गों पर यात्रा न करें।"
                msg_as = f"🚨 {level_title}: {z.district_name}ৰ {z.name} অঞ্চলত ভূমিস্খলনৰ আশংকা {z.current_risk_score:.0f}% বৃদ্ধি পাইছে। অতিবৃষ্টিৰ ফলত পাহাৰীয়া পথসমূহ বিপজ্জনক হৈ পৰিছে। সাৱধান হওক।"

                alert = Alert(
                    alert_code=code,
                    level=alert_level,
                    title=f"{level_title} — {z.district_name}",
                    message_en=msg_en,
                    message_hi=msg_hi,
                    message_regional=msg_as,
                    regional_language="as",
                    district_name=z.district_name,
                    zone_name=z.name,
                    cause=f"Continuous heavy rainfall ({z.rainfall_24h:.1f} mm) exceeding threshold, soil pore saturation {z.soil_moisture:.0f}%",
                    recommended_action=action_text,
                    issued_by="State Disaster Management Authority (SDMA)",
                    issued_at=datetime.now(timezone.utc),
                    expires_at=datetime.now(timezone.utc) + timedelta(hours=12),
                    is_active=True,
                    channels=["WEB_DASHBOARD", "CELL_BROADCAST_SIM", "SMS_GATEWAY"]
                )
                db.add(alert)
                db.commit()
                db.refresh(alert)

                # Simulate Cell Broadcast Gateway dispatch for Level 3 and Level 4
                if alert_level in [AlertLevel.LEVEL_3_WARNING, AlertLevel.LEVEL_4_EMERGENCY]:
                    broadcast_result = self.broadcast_provider.send_emergency_broadcast(
                        area_name=f"{z.district_name} - {z.name}",
                        severity=alert_level.value,
                        message=msg_en,
                        channels=alert.channels
                    )
                    b_log = EmergencyBroadcastLog(
                        alert_id=alert.id,
                        area_name=z.district_name,
                        provider_name=broadcast_result["provider"],
                        cap_identifier=broadcast_result["cap_identifier"],
                        status=broadcast_result["status"],
                        payload_cap_xml=broadcast_result["cap_xml_preview"],
                        sent_at=datetime.now(timezone.utc)
                    )
                    db.add(b_log)
                    db.commit()

                new_alerts.append(alert)

        return new_alerts

alert_engine = AlertEngine()
