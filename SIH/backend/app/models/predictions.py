"""Prediction records and risk configuration models."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, JSON
from app.core.database import Base
from app.models.spatial import RiskLevel

class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, index=True, nullable=False)
    zone_name = Column(String(150), nullable=False)
    district_name = Column(String(100), nullable=False)
    
    risk_score = Column(Float, nullable=False) # 0 to 100
    risk_level = Column(Enum(RiskLevel), nullable=False)
    probability = Column(Float, nullable=False) # 0.0 to 1.0
    
    # Time horizon probabilities
    window_1h_prob = Column(Float, default=0.25)
    window_3h_prob = Column(Float, default=0.45)
    window_6h_prob = Column(Float, default=0.72)
    window_12h_prob = Column(Float, default=0.88)
    window_24h_prob = Column(Float, default=0.94)
    
    contributing_factors = Column(JSON, nullable=False)
    recommendation = Column(String(255), nullable=False)
    model_version = Column(String(50), default="RandomForest-v1.2-NER")
    is_demo_data = Column(Integer, default=1) # 1 for demo, 0 for live sensor
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

class RiskConfig(Base):
    __tablename__ = "risk_configs"

    id = Column(Integer, primary_key=True, index=True)
    factor_name = Column(String(50), unique=True, nullable=False)
    weight = Column(Float, nullable=False) # 0.0 to 1.0
    display_name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
