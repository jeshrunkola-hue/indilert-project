"""
Emergency Alerts and Indilert Web Push Integration API.
Provides role-protected alert dispatch for NER-SAFE and public push feeds for Indilert.
"""
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.user import UserRole
from app.models.emergency_alerts import EmergencyAlert, PushSubscription, AlertSeverity, AlertStatus, AlertMode
from app.schemas.emergency_alerts import (
    EmergencyAlertSendRequest,
    EmergencyAlertResponse,
    PushSubscribeRequest,
    PushSubscribeResponse,
    AlertActionTrackingResponse
)
from app.api.auth import require_role
from app.services.webpush_service import webpush_service

router = APIRouter(prefix="/emergency-alerts", tags=["Emergency Alerts & Indilert Integration"])

@router.get("/vapid-public-key")
def get_vapid_public_key():
    """Returns VAPID public key for browser push notification registration."""
    return {
        "publicKey": settings.VAPID_PUBLIC_KEY,
        "application": "NER-SAFE & Indilert Push Service",
        "email": settings.VAPID_CLAIMS_EMAIL
    }

@router.post("/push-subscribe", response_model=PushSubscribeResponse)
def subscribe_push(req: PushSubscribeRequest, db: Session = Depends(get_db)):
    """Registers citizen browser push subscription with target district geofence."""
    sub = db.query(PushSubscription).filter(PushSubscription.endpoint == req.endpoint).first()
    if sub:
        sub.p256dh = req.keys.p256dh
        sub.auth = req.keys.auth
        sub.district = req.district or "East Khasi Hills"
        sub.state = req.state or "Meghalaya"
        sub.user_id = req.user_id
        sub.active = True
        sub.updated_at = datetime.now(timezone.utc)
    else:
        sub = PushSubscription(
            endpoint=req.endpoint,
            p256dh=req.keys.p256dh,
            auth=req.keys.auth,
            district=req.district or "East Khasi Hills",
            state=req.state or "Meghalaya",
            user_id=req.user_id,
            active=True
        )
        db.add(sub)
    db.commit()
    db.refresh(sub)
    return {
        "success": True,
        "subscription_id": sub.id,
        "district": sub.district,
        "message": f"Successfully registered for emergency warnings in {sub.district}"
    }

@router.post("/push-unsubscribe")
def unsubscribe_push(endpoint: str = Query(...), db: Session = Depends(get_db)):
    """Deactivates a citizen push subscription."""
    sub = db.query(PushSubscription).filter(PushSubscription.endpoint == endpoint).first()
    if sub:
        sub.active = False
        db.commit()
    return {"success": True, "message": "Push subscription deactivated"}

@router.post("/send", response_model=EmergencyAlertResponse)
async def send_emergency_alert(
    req: EmergencyAlertSendRequest,
    current_user = Depends(require_role([UserRole.ADMIN, UserRole.DISASTER_MANAGEMENT_AUTHORITY])),
    db: Session = Depends(get_db)
):
    """
    Role-protected endpoint: Sends live or demo emergency alerts to Indilert citizens.
    Only authorized disaster authorities and administrators can dispatch.
    """
    alert_id = f"ALT-EMG-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=req.expires_hours)

    # Auto-generate multi-lingual translations if not explicitly passed
    translations = req.translations or {
        "en": {
            "title": req.title,
            "message": req.message,
            "recommended_action": req.recommended_action
        },
        "hi": {
            "title": f"भूस्खलन आपातकालीन चेतावनी: {req.district}",
            "message": req.message,
            "recommended_action": f"सुरक्षित स्थानों पर शरण लें। {req.recommended_action}"
        },
        "as": {
            "title": f"ভূমিস্খলন জৰুৰীকালীন সতৰ্কবাৰ্তা: {req.district}",
            "message": req.message,
            "recommended_action": f"নিৰাপদ আশ্ৰয়স্থললৈ স্থানান্তৰিত হওক। {req.recommended_action}"
        }
    }

    alert = EmergencyAlert(
        id=alert_id,
        title=req.title,
        message=req.message,
        severity=req.severity,
        type=req.type,
        state=req.state,
        district=req.district,
        area=req.area or f"{req.district} District",
        latitude=req.latitude,
        longitude=req.longitude,
        risk_score=req.risk_score,
        expected_window=req.expected_window,
        recommended_action=req.recommended_action,
        issued_at=now,
        expires_at=expires,
        created_by=current_user.full_name,
        sender_role=current_user.role.value,
        source="NER-SAFE",
        status=AlertStatus.SENDING,
        mode=req.mode,
        translations=translations
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Dispatch via Web Push and WebSocket
    total_subs, push_sent = await webpush_service.broadcast_emergency_alert(alert, db)
    
    alert.recipients_count = total_subs
    alert.push_sent_count = push_sent
    alert.status = AlertStatus.SENT
    db.commit()
    db.refresh(alert)

    return alert

@router.get("/active", response_model=List[EmergencyAlertResponse])
def get_active_emergency_alerts(
    district: Optional[str] = None,
    mode: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Returns currently active alerts for citizen apps (Indilert)."""
    now = datetime.now(timezone.utc)
    query = db.query(EmergencyAlert).filter(
        EmergencyAlert.status != AlertStatus.CANCELLED,
        (EmergencyAlert.expires_at == None) | (EmergencyAlert.expires_at > now)
    )
    if district and district != "All":
        query = query.filter(EmergencyAlert.district == district)
    if mode:
        query = query.filter(EmergencyAlert.mode == mode)
        
    return query.order_by(EmergencyAlert.issued_at.desc()).all()

@router.get("/history", response_model=List[EmergencyAlertResponse])
def get_alert_history(
    mode: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Returns alert history for government inspection with LIVE/DEMO filtering."""
    query = db.query(EmergencyAlert)
    if mode:
        query = query.filter(EmergencyAlert.mode == mode)
    return query.order_by(EmergencyAlert.issued_at.desc()).limit(limit).all()

@router.get("/{alert_id}", response_model=EmergencyAlertResponse)
def get_emergency_alert(alert_id: str, db: Session = Depends(get_db)):
    """Fetches details for a single emergency alert."""
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Emergency alert not found")
    return alert

@router.post("/{alert_id}/open", response_model=AlertActionTrackingResponse)
def track_alert_open(alert_id: str, db: Session = Depends(get_db)):
    """Called when citizen opens or taps the notification."""
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.opened_count += 1
    db.commit()
    return {
        "success": True,
        "alert_id": alert.id,
        "opened_count": alert.opened_count,
        "acknowledged_count": alert.acknowledged_count,
        "message": "Open action recorded"
    }

@router.post("/{alert_id}/acknowledge", response_model=AlertActionTrackingResponse)
def track_alert_acknowledge(alert_id: str, db: Session = Depends(get_db)):
    """Called when citizen confirms they have read the safety action."""
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.acknowledged_count += 1
    db.commit()
    return {
        "success": True,
        "alert_id": alert.id,
        "opened_count": alert.opened_count,
        "acknowledged_count": alert.acknowledged_count,
        "message": "Acknowledgement recorded"
    }
