"""Demo Mode simulation endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.simulation import simulation_engine

router = APIRouter(prefix="/simulation", tags=["Demo Mode Simulator"])

@router.get("/status")
def get_simulation_status():
    return simulation_engine.get_status()

@router.post("/advance")
def advance_simulation(db: Session = Depends(get_db)):
    """Advances cloudburst simulation step: increases rainfall, soil moisture, triggers alert, blocks road."""
    return simulation_engine.advance_simulation_step(db)

@router.post("/reset")
def reset_simulation(db: Session = Depends(get_db)):
    """Resets simulated scenario back to baseline conditions."""
    return simulation_engine.reset_simulation(db)
