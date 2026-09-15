"""Incident lifecycle management and audit logs endpoints."""
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.incidents import Incident, IncidentStatus, AuditLog
from app.schemas.incidents import IncidentResponse, IncidentStatusUpdate, AuditLogResponse

router = APIRouter(prefix="/incidents", tags=["Incident Management"])

@router.get("", response_model=List[IncidentResponse])
def get_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.created_at.desc()).all()

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.patch("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(
    incident_id: int,
    payload: IncidentStatusUpdate,
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    old_status = inc.status.value
    inc.status = payload.status
    if payload.assigned_team:
        inc.assigned_team = payload.assigned_team
    if payload.evacuation_required is not None:
        inc.evacuation_required = payload.evacuation_required
    inc.updated_at = datetime.now(timezone.utc)

    # Log audit entry
    audit = AuditLog(
        entity_type="INCIDENT",
        entity_id=inc.id,
        action="UPDATE_INCIDENT_STATUS",
        changed_by="Disaster Authority Officer",
        user_role="DISASTER_MANAGEMENT_AUTHORITY",
        old_state=old_status,
        new_state=payload.status.value,
        notes=payload.notes or f"Status changed from {old_status} to {payload.status.value}"
    )
    db.add(audit)
    db.commit()
    db.refresh(inc)
    return inc
