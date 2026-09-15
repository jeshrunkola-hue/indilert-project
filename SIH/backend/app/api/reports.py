"""Citizen and Field Officer reporting with AI description & severity assessment."""
from typing import List, Optional
import os
import re
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.spatial import RiskLevel
from app.models.incidents import CitizenReport, ReportType, IncidentStatus, AuditLog
from app.schemas.incidents import CitizenReportResponse
from app.integrations.storage_provider import LocalStorageProvider

router = APIRouter(prefix="/reports", tags=["Citizen & Field Officer Reporting"])
storage = LocalStorageProvider()

def analyze_report_with_ai(description: str, report_type: str) -> tuple:
    """
    Simulates AI text & geological natural language assessment of the field report.
    Returns: (assessed_type, severity, confidence, recommended_action)
    """
    desc_lower = description.lower()
    
    # Critical keywords
    if any(k in desc_lower for k in ["collapsed", "boulder", "blocked road", "burying", "massive", "avalanche", "mudflow", "highway blocked"]):
        severity = RiskLevel.CRITICAL
        confidence = 0.94
        action = "Urgent: Deploy SDRF/PWD clearance unit within 1 hour. Restrict transit on route."
        assessed_type = "Rapid Debris Flow / Rock Avalanche"
    elif any(k in desc_lower for k in ["large crack", "creeping", "tilting trees", "bulging", "seepage", "retaining wall"]):
        severity = RiskLevel.HIGH
        confidence = 0.89
        action = "Field inspection recommended within 2 hours. Monitor pore water pressure sensors."
        assessed_type = "Slope Instability with Active Tension Cracking"
    elif any(k in desc_lower for k in ["small rocks", "minor slide", "water pooling", "slurry", "drainage"]):
        severity = RiskLevel.MODERATE
        confidence = 0.85
        action = "Include in routine 12-hour patrol route. Clear drainage culverts."
        assessed_type = "Localized Surface Scour / Scree Spill"
    else:
        severity = RiskLevel.LOW
        confidence = 0.78
        action = "Log in spatial database for seasonal trend monitoring."
        assessed_type = "Minor Topographical Disturbance"

    return assessed_type, severity, confidence, action

@router.post("", response_model=CitizenReportResponse)
async def submit_report(
    reporter_name: str = Form("Anonymous Citizen"),
    reporter_contact: Optional[str] = Form(None),
    reporter_role: str = Form("CITIZEN"),
    report_type: str = Form("LANDSLIDE"),
    latitude: float = Form(...),
    longitude: float = Form(...),
    district_name: str = Form(...),
    description: str = Form(...),
    severity: Optional[str] = Form("MODERATE"),
    is_offline_synced: bool = Form(False),
    photos: List[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    media_urls = []
    if photos:
        for p in photos:
            if p.filename:
                content = await p.read()
                if len(content) > 0:
                    url = await storage.save_file(content, p.filename)
                    media_urls.append(url)

    # If no media uploaded in demo, provide realistic fallback imagery based on report type
    if not media_urls:
        if "crack" in report_type.lower():
            media_urls.append("https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800")
        elif "block" in report_type.lower():
            media_urls.append("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800")
        else:
            media_urls.append("https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800")

    # Run AI NLP & Severity Analysis
    assessed_type, ai_severity, confidence, rec_action = analyze_report_with_ai(description, report_type)

    # Cast report type enum
    try:
        rtype = ReportType[report_type.upper()]
    except Exception:
        rtype = ReportType.OTHER

    # Cast user severity
    try:
        usev = RiskLevel[severity.upper()]
    except Exception:
        usev = RiskLevel.MODERATE

    report = CitizenReport(
        reporter_name=reporter_name,
        reporter_contact=reporter_contact,
        reporter_role=reporter_role,
        report_type=rtype,
        latitude=latitude,
        longitude=longitude,
        district_name=district_name,
        description=description,
        media_urls=media_urls,
        severity=usev,
        ai_assessed_type=assessed_type,
        ai_assessed_severity=ai_severity,
        ai_confidence=confidence,
        ai_recommended_action=rec_action,
        is_verified=(reporter_role == "FIELD_OFFICER"),
        is_offline_synced=is_offline_synced,
        status=IncidentStatus.REPORTED,
        created_at=datetime.now(timezone.utc)
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Audit log
    audit = AuditLog(
        entity_type="CITIZEN_REPORT",
        entity_id=report.id,
        action="REPORT_SUBMITTED",
        changed_by=reporter_name,
        user_role=reporter_role,
        old_state="NONE",
        new_state="REPORTED",
        notes=f"AI assessed severity: {ai_severity.value}"
    )
    db.add(audit)
    db.commit()

    return report

@router.get("", response_model=List[CitizenReportResponse])
def get_all_reports(db: Session = Depends(get_db)):
    return db.query(CitizenReport).order_by(CitizenReport.created_at.desc()).all()

@router.get("/{report_id}", response_model=CitizenReportResponse)
def get_report(report_id: int, db: Session = Depends(get_db)):
    rep = db.query(CitizenReport).filter(CitizenReport.id == report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")
    return rep

@router.post("/{report_id}/verify", response_model=CitizenReportResponse)
def verify_report(report_id: int, db: Session = Depends(get_db)):
    rep = db.query(CitizenReport).filter(CitizenReport.id == report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")
    rep.is_verified = True
    rep.status = IncidentStatus.VERIFIED
    db.commit()
    db.refresh(rep)
    return rep
