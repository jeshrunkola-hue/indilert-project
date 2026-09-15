"""Pydantic schemas for AI predictions and risk factor configuration."""
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from app.models.spatial import RiskLevel

class PredictionInput(BaseModel):
    rainfall_1h: float
    rainfall_3h: float
    rainfall_6h: float
    rainfall_24h: float
    rainfall_intensity: Optional[float] = None
    soil_moisture: float
    slope_angle: float
    elevation: float
    terrain_type: Optional[str] = "Shale / Phyllite"
    land_cover: Optional[str] = "Scrub / Forest"
    historical_landslide_frequency: Optional[int] = 3
    distance_from_road_m: Optional[float] = 120.0
    previous_instability_reports: Optional[int] = 1

class PredictionResponse(BaseModel):
    risk_score: float # 0 - 100
    risk_level: RiskLevel
    probability: float # 0 - 1
    prediction_window: str # e.g. "High probability of slope failure within 6 hours"
    window_1h_prob: float
    window_3h_prob: float
    window_6h_prob: float
    window_12h_prob: float
    window_24h_prob: float
    contributing_factors: Dict[str, Any]
    model_version: str
    is_demo_data: bool = True

class RiskFactorWeight(BaseModel):
    factor_name: str
    weight: float
    display_name: str
    description: Optional[str] = None

class RiskConfigUpdate(BaseModel):
    weights: Dict[str, float]
