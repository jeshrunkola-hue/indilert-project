"""Pydantic schemas for emergency alerts and broadcasts."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.alerts import AlertLevel

class AlertCreate(BaseModel):
    level: AlertLevel
    title: str
    message_en: str
    message_hi: Optional[str] = None
    message_regional: Optional[str] = None
    regional_language: Optional[str] = "as"
    district_name: str
    zone_name: Optional[str] = None
    cause: str
    recommended_action: str
    expires_hours: int = 24
    channels: Optional[List[str]] = ["WEB_DASHBOARD", "CELL_BROADCAST_SIM", "SMS_GATEWAY"]

class AlertResponse(BaseModel):
    id: int
    alert_code: str
    level: AlertLevel
    title: str
    message_en: str
    message_hi: str
    message_regional: str
    regional_language: str
    district_name: str
    zone_name: Optional[str] = None
    cause: str
    recommended_action: str
    issued_by: str
    issued_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: bool
    channels: List[str] = []
    acknowledged_count: int

    class Config:
        from_attributes = True

class EmergencyBroadcastRequest(BaseModel):
    alert_id: int
    target_area: str
    severity: str
    message: str

class EmergencyBroadcastResponse(BaseModel):
    success: bool
    cap_identifier: str
    provider: str
    cell_towers_targeted: int
    timestamp: datetime
    cap_xml_preview: str
