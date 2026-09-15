"""Pydantic schemas for reports, incidents, and audit trails."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.spatial import RiskLevel
from app.models.incidents import ReportType, IncidentStatus

class CitizenReportCreate(BaseModel):
    reporter_name: Optional[str] = "Anonymous Citizen"
    reporter_contact: Optional[str] = None
    reporter_role: Optional[str] = "CITIZEN"
    report_type: ReportType
    latitude: float
    longitude: float
    district_name: str
    description: str
    severity: Optional[RiskLevel] = RiskLevel.MODERATE

class CitizenReportResponse(BaseModel):
    id: int
    reporter_name: str
    reporter_contact: Optional[str] = None
    reporter_role: str
    report_type: ReportType
    latitude: float
    longitude: float
    district_name: str
    description: str
    media_urls: List[str] = []
    severity: RiskLevel
    ai_assessed_type: Optional[str] = None
    ai_assessed_severity: Optional[RiskLevel] = None
    ai_confidence: Optional[float] = None
    ai_recommended_action: Optional[str] = None
    is_verified: bool
    is_offline_synced: bool
    status: IncidentStatus
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class IncidentStatusUpdate(BaseModel):
    status: IncidentStatus
    assigned_team: Optional[str] = None
    evacuation_required: Optional[bool] = None
    notes: Optional[str] = None

class IncidentResponse(BaseModel):
    id: int
    title: str
    description: str
    district_name: str
    zone_name: Optional[str] = None
    latitude: float
    longitude: float
    severity: RiskLevel
    status: IncidentStatus
    report_source: str
    primary_report_id: Optional[int] = None
    assigned_team: Optional[str] = None
    evacuation_required: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    action: str
    changed_by: str
    user_role: str
    old_state: Optional[str] = None
    new_state: Optional[str] = None
    notes: Optional[str] = None
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True
