"""Road connectivity and blockage monitoring endpoints."""
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.spatial import Road, RoadStatus, District
from app.models.incidents import AuditLog
from app.schemas.spatial import RoadResponse, RoadStatusUpdate

router = APIRouter(prefix="/roads", tags=["Road Connectivity & Blockages"])

@router.get("", response_model=List[RoadResponse])
def get_all_roads(db: Session = Depends(get_db)):
    return db.query(Road).all()

@router.get("/{road_id}", response_model=RoadResponse)
def get_road(road_id: int, db: Session = Depends(get_db)):
    road = db.query(Road).filter(Road.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")
    return road

@router.patch("/{road_id}/status", response_model=RoadResponse)
def update_road_status(
    road_id: int,
    payload: RoadStatusUpdate,
    db: Session = Depends(get_db)
):
    road = db.query(Road).filter(Road.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")

    old_status = road.status.value
    road.status = payload.status
    if payload.blockage_reason is not None:
        road.blockage_reason = payload.blockage_reason
    if payload.alternative_route is not None:
        road.alternative_route = payload.alternative_route
    road.updated_at = datetime.now(timezone.utc)

    # Update district blocked roads count
    dist = db.query(District).filter(District.id == road.district_id).first()
    if dist:
        blocked_count = db.query(Road).filter(
            Road.district_id == road.district_id,
            Road.status.in_([RoadStatus.BLOCKED, RoadStatus.PARTIALLY_BLOCKED])
        ).count()
        dist.blocked_roads_count = blocked_count

    audit = AuditLog(
        entity_type="ROAD",
        entity_id=road.id,
        action="UPDATE_ROAD_STATUS",
        changed_by="Highway Engineer / Patrol",
        user_role="FIELD_OFFICER",
        old_state=old_status,
        new_state=payload.status.value,
        notes=payload.blockage_reason or f"Status updated to {payload.status.value}"
    )
    db.add(audit)
    db.commit()
    db.refresh(road)
    return road
