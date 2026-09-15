"""AI Landslide Prediction Engine endpoints."""
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.spatial import Zone
from app.models.predictions import PredictionRecord
from app.schemas.predictions import PredictionInput, PredictionResponse
from app.services.ml_service import ml_service

router = APIRouter(prefix="/predictions", tags=["AI Landslide Prediction Engine"])

@router.post("/predict", response_model=PredictionResponse)
def run_custom_prediction(payload: PredictionInput):
    """
    Runs the Scikit-learn AI Landslide model pipeline on custom features.
    Clearly marks output as DEMO DATA / Early Warning Advisory.
    """
    res = ml_service.predict(payload.dict())
    return res

@router.get("", response_model=List[PredictionResponse])
def get_recent_predictions(db: Session = Depends(get_db)):
    zones = db.query(Zone).all()
    results = []
    for z in zones:
        pred = ml_service.predict({
            "rainfall_1h": z.rainfall_1h,
            "rainfall_3h": z.rainfall_3h,
            "rainfall_6h": z.rainfall_6h,
            "rainfall_24h": z.rainfall_24h,
            "rainfall_intensity": z.rainfall_1h,
            "soil_moisture": z.soil_moisture,
            "slope_angle": z.slope_angle,
            "elevation": z.elevation,
            "historical_landslide_freq": z.historical_incidents_count,
            "distance_from_road": 60.0,
            "field_reports": z.recent_field_reports_count
        })
        results.append(pred)
    return results

@router.get("/{zone_id}", response_model=PredictionResponse)
def get_prediction_for_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    pred = ml_service.predict({
        "rainfall_1h": zone.rainfall_1h,
        "rainfall_3h": zone.rainfall_3h,
        "rainfall_6h": zone.rainfall_6h,
        "rainfall_24h": zone.rainfall_24h,
        "rainfall_intensity": zone.rainfall_1h,
        "soil_moisture": zone.soil_moisture,
        "slope_angle": zone.slope_angle,
        "elevation": zone.elevation,
        "historical_landslide_freq": zone.historical_incidents_count,
        "distance_from_road": 50.0,
        "field_reports": zone.recent_field_reports_count
    })
    return pred
