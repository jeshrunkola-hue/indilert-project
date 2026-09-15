"""Citizen reports, incidents, and audit logs."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, Boolean, JSON
from app.core.database import Base
from app.models.spatial import RiskLevel

class ReportType(str, enum.Enum):
    LANDSLIDE = "LANDSLIDE"
    CRACK = "CRACK"
    SLOPE_MOVEMENT = "SLOPE_MOVEMENT"
    ROAD_BLOCKAGE = "ROAD_BLOCKAGE"
    FALLEN_TREES = "FALLEN_TREES"
    FLASH_FLOOD = "FLASH_FLOOD"
    OTHER = "OTHER"

class IncidentStatus(str, enum.Enum):
    REPORTED = "REPORTED"
    VERIFIED = "VERIFIED"
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"
    RESPONSE_STARTED = "RESPONSE_STARTED"
    RESOLVED = "RESOLVED"

class CitizenReport(Base):
    __tablename__ = "citizen_reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_name = Column(String(100), default="Anonymous Citizen")
    reporter_contact = Column(String(50), nullable=True)
    reporter_role = Column(String(50), default="CITIZEN") # CITIZEN or FIELD_OFFICER
    report_type = Column(Enum(ReportType), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    media_urls = Column(JSON, default=list) # List of image/video paths
    severity = Column(Enum(RiskLevel), default=RiskLevel.MODERATE)
    
    # AI Analysis
    ai_assessed_type = Column(String(100), nullable=True)
    ai_assessed_severity = Column(Enum(RiskLevel), nullable=True)
    ai_confidence = Column(Float, default=0.88)
    ai_recommended_action = Column(Text, nullable=True)
    
    is_verified = Column(Boolean, default=False)
    is_offline_synced = Column(Boolean, default=False)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.REPORTED)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    district_name = Column(String(100), nullable=False)
    zone_name = Column(String(150), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    severity = Column(Enum(RiskLevel), default=RiskLevel.HIGH)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.REPORTED)
    report_source = Column(String(50), default="CITIZEN_REPORT") # CITIZEN_REPORT, SENSOR, FIELD_PATROL, SATELLITE
    primary_report_id = Column(Integer, nullable=True)
    assigned_team = Column(String(150), nullable=True)
    evacuation_required = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False) # INCIDENT, ALERT, ROAD, RISK_CONFIG
    entity_id = Column(Integer, nullable=False)
    action = Column(String(100), nullable=False) # STATUS_CHANGE, DISPATCH_TEAM, REWEIGHT
    changed_by = Column(String(100), default="System")
    user_role = Column(String(50), default="DMA")
    old_state = Column(String(255), nullable=True)
    new_state = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
