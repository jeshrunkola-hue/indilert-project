"""Pydantic schemas for telemetry, weather, and satellite observations."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.telemetry import SensorStatus

class SensorCreate(BaseModel):
    sensor_code: str
    name: str
    district_id: int
    district_name: str
    zone_id: Optional[int] = None
    latitude: float
    longitude: float
    status: SensorStatus = SensorStatus.ONLINE
    soil_moisture: float = 45.0
    battery_level: float = 95.0
    pore_water_pressure_kpa: float = 12.0
    tilt_degrees: float = 0.1

class SensorReadingCreate(BaseModel):
    sensor_id: int
    soil_moisture: float
    battery_level: float
    pore_water_pressure_kpa: Optional[float] = 12.0
    tilt_degrees: Optional[float] = 0.1

class SensorResponse(BaseModel):
    id: int
    sensor_code: str
    name: str
    district_id: int
    district_name: str
    zone_id: Optional[int] = None
    latitude: float
    longitude: float
    status: SensorStatus
    soil_moisture: float
    battery_level: float
    pore_water_pressure_kpa: float
    tilt_degrees: float
    signal_strength_dbm: float
    last_reading_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WeatherResponse(BaseModel):
    id: int
    district_id: int
    district_name: str
    current_rainfall: float
    rainfall_intensity: str
    rainfall_1h: float
    rainfall_3h: float
    rainfall_6h: float
    rainfall_24h: float
    forecast_rainfall_24h: float
    temperature: float
    humidity: float
    wind_speed: float
    weather_warning: str
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SatelliteResponse(BaseModel):
    id: int
    zone_id: int
    zone_name: str
    observation_date: Optional[datetime] = None
    ndvi: float
    surface_change_index: float
    ground_displacement_mm: float
    land_cover_change: str
    confidence_score: float
    data_source: str

    class Config:
        from_attributes = True
