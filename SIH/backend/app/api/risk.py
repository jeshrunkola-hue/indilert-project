"""Risk calculation and dynamic weights configuration endpoints."""
from typing import Dict, List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.predictions import RiskConfig
from app.models.incidents import AuditLog
from app.schemas.predictions import RiskConfigUpdate, RiskFactorWeight
from app.services.risk_engine import risk_engine

router = APIRouter(prefix="/risk", tags=["Risk Scoring Engine"])

@router.get("/weights", response_model=List[RiskFactorWeight])
def get_risk_weights(db: Session = Depends(get_db)):
    configs = db.query(RiskConfig).all()
    if not configs:
        # Return defaults if db empty
        return [
            RiskFactorWeight(factor_name="rainfall", weight=0.30, display_name="24h / Cumulative Rainfall Intensity"),
            RiskFactorWeight(factor_name="soil_moisture", weight=0.20, display_name="Soil Volumetric Moisture Content"),
            RiskFactorWeight(factor_name="slope", weight=0.15, display_name="Topographical Slope Gradient"),
            RiskFactorWeight(factor_name="terrain", weight=0.10, display_name="Geological Substrate & Elevation"),
            RiskFactorWeight(factor_name="history", weight=0.15, display_name="Historical Landslide Recurrence"),
            RiskFactorWeight(factor_name="field_reports", weight=0.10, display_name="Recent Field Patrol & Citizen Reports")
        ]
    return [
        RiskFactorWeight(
            factor_name=c.factor_name,
            weight=c.weight,
            display_name=c.display_name,
            description=c.description
        ) for c in configs
    ]

@router.put("/weights")
def update_risk_weights(payload: RiskConfigUpdate, db: Session = Depends(get_db)):
    """Admin updates dynamic risk factor weights."""
    total = sum(payload.weights.values())
    if total <= 0:
        raise HTTPException(status_code=400, detail="Total weights sum must be greater than zero")

    normalized = {k: v / total for k, v in payload.weights.items()}

    for factor_name, weight in normalized.items():
        cfg = db.query(RiskConfig).filter(RiskConfig.factor_name == factor_name).first()
        if cfg:
            old_w = cfg.weight
            cfg.weight = weight
            # Audit log
            log = AuditLog(
                entity_type="RISK_CONFIG",
                entity_id=cfg.id,
                action="REWEIGHT_FACTOR",
                changed_by="Admin",
                user_role="ADMIN",
                old_state=f"{old_w:.2f}",
                new_state=f"{weight:.2f}",
                notes=f"Updated weight for {factor_name}"
            )
            db.add(log)
    db.commit()
    return {"status": "success", "message": "Weights updated successfully", "weights": normalized}

@router.post("/calculate")
def calculate_risk_preview(data: Dict[str, Any], db: Session = Depends(get_db)):
    score, level, factors = risk_engine.calculate_risk(
        rainfall_24h=float(data.get("rainfall_24h", 45.0)),
        soil_moisture=float(data.get("soil_moisture", 50.0)),
        slope_angle=float(data.get("slope_angle", 28.0)),
        elevation=float(data.get("elevation", 900.0)),
        historical_freq=int(data.get("historical_landslides", 3)),
        field_reports_count=int(data.get("field_reports", 1)),
        db=db
    )
    return {
        "risk_score": score,
        "risk_level": level.value,
        "contributing_factors": factors
    }
