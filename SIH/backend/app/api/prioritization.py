"""Response prioritization endpoints."""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.prioritization import prioritization_engine

router = APIRouter(prefix="/prioritization", tags=["Response Prioritization Engine"])

@router.get("", response_model=List[Dict[str, Any]])
def get_response_priorities(db: Session = Depends(get_db)):
    return prioritization_engine.evaluate_priorities(db)
