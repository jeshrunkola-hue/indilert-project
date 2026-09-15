"""Emergency alerts and cell broadcast simulation endpoints."""
from typing import List
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.alerts import Alert, AlertLevel, EmergencyBroadcastLog
from app.schemas.alerts import AlertCreate, AlertResponse, EmergencyBroadcastRequest, EmergencyBroadcastResponse
from app.integrations.broadcast_provider import MockCAPBroadcastProvider

router = APIRouter(prefix="/alerts", tags=["Emergency Alerts & Cell Broadcast"])
broadcast_provider = MockCAPBroadcastProvider()

@router.get("", response_model=List[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.issued_at.desc()).all()

@router.post("", response_model=AlertResponse)
def create_emergency_alert(payload: AlertCreate, db: Session = Depends(get_db)):
    code = f"ALT-MANUAL-{datetime.now().strftime('%Y%m%d%H%M')}"
    
    # Fill in translations if missing
    msg_hi = payload.message_hi or f"भूस्खलन चेतावनी: {payload.title}। {payload.recommended_action}"
    msg_reg = payload.message_regional or f"ভূমিস্খলন সতৰ্কবাৰ্তা: {payload.title}। {payload.recommended_action}"

    alert = Alert(
        alert_code=code,
        level=payload.level,
        title=payload.title,
        message_en=payload.message_en,
        message_hi=msg_hi,
        message_regional=msg_reg,
        regional_language=payload.regional_language or "as",
        district_name=payload.district_name,
        zone_name=payload.zone_name,
        cause=payload.cause,
        recommended_action=payload.recommended_action,
        issued_by="Disaster Authority Controller",
        issued_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(hours=payload.expires_hours),
        is_active=True,
        channels=payload.channels or ["WEB_DASHBOARD", "CELL_BROADCAST_SIM", "SMS_GATEWAY"]
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Dispatch to Mock Cell Broadcast Gateway
    broadcast_res = broadcast_provider.send_emergency_broadcast(
        area_name=f"{payload.district_name} {payload.zone_name or ''}",
        severity=payload.level.value,
        message=payload.message_en,
        channels=alert.channels
    )

    b_log = EmergencyBroadcastLog(
        alert_id=alert.id,
        area_name=payload.district_name,
        provider_name=broadcast_res["provider"],
        cap_identifier=broadcast_res["cap_identifier"],
        status=broadcast_res["status"],
        payload_cap_xml=broadcast_res["cap_xml_preview"],
        sent_at=datetime.now(timezone.utc)
    )
    db.add(b_log)
    db.commit()

    return alert

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.acknowledged_count += 1
    db.commit()
    return {"status": "success", "acknowledged_count": alert.acknowledged_count}

@router.post("/broadcast", response_model=EmergencyBroadcastResponse)
def trigger_direct_cell_broadcast(req: EmergencyBroadcastRequest, db: Session = Depends(get_db)):
    res = broadcast_provider.send_emergency_broadcast(
        area_name=req.target_area,
        severity=req.severity,
        message=req.message
    )
    return {
        "success": True,
        "cap_identifier": res["cap_identifier"],
        "provider": res["provider"],
        "cell_towers_targeted": res["cell_towers_targeted"],
        "timestamp": datetime.now(timezone.utc),
        "cap_xml_preview": res["cap_xml_preview"]
    }
