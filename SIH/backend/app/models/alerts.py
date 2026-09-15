"""Emergency alerts and cell broadcast logging models."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, Boolean, JSON
from app.core.database import Base

class AlertLevel(str, enum.Enum):
    LEVEL_1_INFO = "LEVEL_1_INFO"
    LEVEL_2_WATCH = "LEVEL_2_WATCH"
    LEVEL_3_WARNING = "LEVEL_3_WARNING"
    LEVEL_4_EMERGENCY = "LEVEL_4_EMERGENCY"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. ALT-2026-DH-001
    level = Column(Enum(AlertLevel), nullable=False)
    title = Column(String(200), nullable=False)
    
    # Multilingual messages
    message_en = Column(Text, nullable=False)
    message_hi = Column(Text, nullable=False)
    message_regional = Column(Text, nullable=False)
    regional_language = Column(String(20), default="as") # as, hi, kha, lus, mni, etc.
    
    district_name = Column(String(100), nullable=False)
    zone_name = Column(String(150), nullable=True)
    cause = Column(String(255), default="Excessive continuous rainfall exceeding threshold")
    recommended_action = Column(Text, nullable=False)
    
    issued_by = Column(String(100), default="State Disaster Management Authority (SDMA)")
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Channels dispatched
    channels = Column(JSON, default=lambda: ["WEB_DASHBOARD", "CELL_BROADCAST_SIM", "SMS_GATEWAY"])
    acknowledged_count = Column(Integer, default=0)

class EmergencyBroadcastLog(Base):
    __tablename__ = "emergency_broadcast_logs"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, index=True, nullable=False)
    area_name = Column(String(100), nullable=False)
    provider_name = Column(String(100), default="NDMA/DoT CAP Gateway Mock")
    cap_identifier = Column(String(100), nullable=False)
    status = Column(String(50), default="DISPATCHED_TO_TELCO_CELL_TOWERS")
    payload_cap_xml = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
