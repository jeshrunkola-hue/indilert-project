"""Emergency alerts and Web Push subscription database models."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, Boolean, JSON
from app.core.database import Base

class AlertSeverity(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class AlertStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SENDING = "SENDING"
    SENT = "SENT"
    FAILED = "FAILED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"

class AlertMode(str, enum.Enum):
    LIVE = "LIVE"
    DEMO = "DEMO"

class EmergencyAlert(Base):
    __tablename__ = "emergency_alerts"

    id = Column(String(64), primary_key=True, index=True) # e.g. ALT-EMG-2026-XXXX
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(Enum(AlertSeverity), nullable=False, default=AlertSeverity.CRITICAL)
    type = Column(String(50), default="LANDSLIDE", nullable=False)
    
    state = Column(String(100), default="Assam", nullable=False)
    district = Column(String(100), nullable=False, index=True)
    area = Column(String(200), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    risk_score = Column(Float, default=85.0, nullable=False)
    expected_window = Column(String(100), default="Next 3-6 hours", nullable=False)
    recommended_action = Column(Text, nullable=False)
    
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    expires_at = Column(DateTime, nullable=True)
    created_by = Column(String(100), default="Disaster Authority Controller")
    sender_role = Column(String(50), default="DISASTER_AUTHORITY")
    source = Column(String(50), default="NER-SAFE")
    
    status = Column(Enum(AlertStatus), default=AlertStatus.SENT, nullable=False)
    mode = Column(Enum(AlertMode), default=AlertMode.LIVE, nullable=False, index=True)
    
    # Delivery tracking metrics
    recipients_count = Column(Integer, default=0)
    push_sent_count = Column(Integer, default=0)
    opened_count = Column(Integer, default=0)
    acknowledged_count = Column(Integer, default=0)
    
    # Multilingual translation dictionary
    translations = Column(JSON, nullable=True, default=dict)

class PushSubscription(Base):
    __tablename__ = "push_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=True)
    endpoint = Column(Text, unique=True, index=True, nullable=False)
    p256dh = Column(Text, nullable=False)
    auth = Column(Text, nullable=False)
    
    district = Column(String(100), default="All", index=True)
    state = Column(String(100), default="Meghalaya")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    active = Column(Boolean, default=True, index=True)
