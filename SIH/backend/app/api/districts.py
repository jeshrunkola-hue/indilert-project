"""District and Slope Zone management endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.spatial import District, Zone, Village, Infrastructure
from app.schemas.spatial import DistrictResponse, ZoneResponse, VillageResponse, InfrastructureResponse

router = APIRouter(tags=["Geospatial & Districts"])

@router.get("/districts", response_model=List[DistrictResponse])
def get_districts(db: Session = Depends(get_db)):
    return db.query(District).order_by(District.current_risk_score.desc()).all()

@router.get("/districts/{district_id}", response_model=DistrictResponse)
def get_district(district_id: int, db: Session = Depends(get_db)):
    dist = db.query(District).filter(District.id == district_id).first()
    if not dist:
        raise HTTPException(status_code=404, detail="District not found")
    return dist

@router.get("/zones", response_model=List[ZoneResponse])
def get_zones(db: Session = Depends(get_db)):
    return db.query(Zone).order_by(Zone.current_risk_score.desc()).all()

@router.get("/zones/{zone_id}", response_model=ZoneResponse)
def get_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone

@router.get("/villages", response_model=List[VillageResponse])
def get_villages(db: Session = Depends(get_db)):
    return db.query(Village).all()

@router.get("/infrastructure", response_model=List[InfrastructureResponse])
def get_infrastructure(db: Session = Depends(get_db)):
    return db.query(Infrastructure).all()
