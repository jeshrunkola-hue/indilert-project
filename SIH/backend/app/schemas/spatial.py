"""Pydantic schemas for spatial models."""
from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel
from app.models.spatial import RiskLevel, RoadStatus, InfrastructureType

class DistrictResponse(BaseModel):
    id: int
    name: str
    state: str
    center_lat: float
    center_lng: float
    polygon_geojson: Optional[Any] = None
    current_risk_score: float
    current_risk_level: RiskLevel
    population: int
    active_incidents_count: int
    blocked_roads_count: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ZoneResponse(BaseModel):
    id: int
    name: str
    district_id: int
    district_name: str
    center_lat: float
    center_lng: float
    radius_km: float
    slope_angle: float
    elevation: float
    terrain_type: str
    land_cover: str
    current_risk_score: float
    current_risk_level: RiskLevel
    soil_moisture: float
    rainfall_1h: float
    rainfall_3h: float
    rainfall_6h: float
    rainfall_24h: float
    forecast_rainfall_24h: float
    historical_incidents_count: int
    recent_field_reports_count: int
    contributing_factors: Optional[Dict[str, Any]] = None
    ai_prediction_summary: Optional[str] = None
    last_evaluated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RoadResponse(BaseModel):
    id: int
    name: str
    route_number: str
    district_id: int
    district_name: str
    status: RoadStatus
    blockage_reason: Optional[str] = None
    coordinates_geojson: Optional[Any] = None
    alternative_route: Optional[str] = None
    affected_villages: Optional[List[str]] = []
    isolated_population: int
    nearest_emergency_resources: Optional[List[Dict[str, Any]]] = []
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RoadStatusUpdate(BaseModel):
    status: RoadStatus
    blockage_reason: Optional[str] = None
    alternative_route: Optional[str] = None

class VillageResponse(BaseModel):
    id: int
    name: str
    district_id: int
    zone_id: Optional[int] = None
    latitude: float
    longitude: float
    population: int
    is_isolated: int
    evacuation_shelter: str

    class Config:
        from_attributes = True

class InfrastructureResponse(BaseModel):
    id: int
    name: str
    type: InfrastructureType
    district_id: int
    latitude: float
    longitude: float
    status: str
    capacity: Optional[str] = None

    class Config:
        from_attributes = True
