"""Pydantic schemas for Emergency Alerts and Push Subscriptions."""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.emergency_alerts import AlertSeverity, AlertStatus, AlertMode

class EmergencyAlertSendRequest(BaseModel):
    title: str = Field(..., example="Critical Landslide Warning")
    message: str = Field(..., example="High probability of rotational slope failure detected.")
    severity: AlertSeverity = AlertSeverity.CRITICAL
    type: str = "LANDSLIDE"
    state: str = "Meghalaya"
    district: str = "East Khasi Hills"
    area: Optional[str] = None
    latitude: Optional[float] = 25.5788
    longitude: Optional[float] = 91.8933
    risk_score: float = 92.0
    expected_window: str = "Next 3-6 hours"
    recommended_action: str = "Avoid vulnerable slope sections and NH routes. Follow official evacuation guidance."
    expires_hours: int = 12
    mode: AlertMode = AlertMode.LIVE
    translations: Optional[Dict[str, Any]] = None

class EmergencyAlertResponse(BaseModel):
    id: str
    title: str
    message: str
    severity: str
    type: str
    state: str
    district: str
    area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    risk_score: float
    expected_window: str
    recommended_action: str
    issued_at: datetime
    expires_at: Optional[datetime] = None
    source: str = "NER-SAFE"
    sender_role: str = "DISASTER_AUTHORITY"
    status: str
    mode: str
    recipients_count: int = 0
    push_sent_count: int = 0
    opened_count: int = 0
    acknowledged_count: int = 0
    translations: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class PushSubscriptionKeys(BaseModel):
    p256dh: str
    auth: str

class PushSubscribeRequest(BaseModel):
    endpoint: str
    keys: PushSubscriptionKeys
    district: Optional[str] = "East Khasi Hills"
    state: Optional[str] = "Meghalaya"
    user_id: Optional[str] = None

class PushSubscribeResponse(BaseModel):
    success: bool
    subscription_id: Optional[int] = None
    district: str
    message: str

class AlertActionTrackingResponse(BaseModel):
    success: bool
    alert_id: str
    opened_count: int
    acknowledged_count: int
    message: str
