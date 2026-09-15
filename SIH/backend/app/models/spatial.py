"""Geospatial models: District, Zone, Road, Village, Infrastructure."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, JSON
from app.core.database import Base

class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class RoadStatus(str, enum.Enum):
    OPEN = "OPEN"
    RESTRICTED = "RESTRICTED"
    PARTIALLY_BLOCKED = "PARTIALLY_BLOCKED"
    BLOCKED = "BLOCKED"

class InfrastructureType(str, enum.Enum):
    HOSPITAL = "HOSPITAL"
    BRIDGE = "BRIDGE"
    POWER_SUBSTATION = "POWER_SUBSTATION"
    SCHOOL_SHELTER = "SCHOOL_SHELTER"
    RELIEF_CAMP = "RELIEF_CAMP"
    POLICE_STATION = "POLICE_STATION"
    COMMUNICATION_TOWER = "COMMUNICATION_TOWER"

class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    state = Column(String(50), index=True, nullable=False)  # Assam, Meghalaya, etc.
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    polygon_geojson = Column(JSON, nullable=True)
    current_risk_score = Column(Float, default=20.0)
    current_risk_level = Column(Enum(RiskLevel), default=RiskLevel.LOW)
    population = Column(Integer, default=150000)
    active_incidents_count = Column(Integer, default=0)
    blocked_roads_count = Column(Integer, default=0)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), index=True, nullable=False)
    district_id = Column(Integer, index=True, nullable=False)
    district_name = Column(String(100), nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    radius_km = Column(Float, default=5.0)
    polygon_geojson = Column(JSON, nullable=True)
    
    # Terrain parameters
    slope_angle = Column(Float, default=25.0)  # degrees
    elevation = Column(Float, default=850.0)    # meters
    terrain_type = Column(String(100), default="Shale / Phyllite steep escarpment")
    land_cover = Column(String(100), default="Degraded Sub-tropical Forest / Scrub")
    
    # Live risk indicators
    current_risk_score = Column(Float, default=25.0)
    current_risk_level = Column(Enum(RiskLevel), default=RiskLevel.LOW)
    soil_moisture = Column(Float, default=45.0) # %
    rainfall_1h = Column(Float, default=2.0)
    rainfall_3h = Column(Float, default=6.0)
    rainfall_6h = Column(Float, default=12.0)
    rainfall_24h = Column(Float, default=25.0)
    forecast_rainfall_24h = Column(Float, default=30.0)
    historical_incidents_count = Column(Integer, default=3)
    recent_field_reports_count = Column(Integer, default=0)
    
    # Explainable factor breakdown stored as JSON
    contributing_factors = Column(JSON, nullable=True)
    ai_prediction_summary = Column(String(255), nullable=True)
    last_evaluated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Road(Base):
    __tablename__ = "roads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    route_number = Column(String(50), index=True, nullable=False) # e.g. NH-27, NH-6
    district_id = Column(Integer, index=True, nullable=False)
    district_name = Column(String(100), nullable=False)
    status = Column(Enum(RoadStatus), default=RoadStatus.OPEN)
    blockage_reason = Column(String(255), nullable=True)
    coordinates_geojson = Column(JSON, nullable=True)  # LineString coordinates
    alternative_route = Column(Text, nullable=True)
    affected_villages = Column(JSON, default=list)
    isolated_population = Column(Integer, default=0)
    nearest_emergency_resources = Column(JSON, default=list)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Village(Base):
    __tablename__ = "villages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    district_id = Column(Integer, index=True, nullable=False)
    zone_id = Column(Integer, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    population = Column(Integer, default=1200)
    is_isolated = Column(Integer, default=0) # 0 or 1
    evacuation_shelter = Column(String(150), default="Community Hall & School")

class Infrastructure(Base):
    __tablename__ = "infrastructure"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    type = Column(Enum(InfrastructureType), nullable=False)
    district_id = Column(Integer, index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(50), default="OPERATIONAL")
    capacity = Column(String(100), nullable=True)
