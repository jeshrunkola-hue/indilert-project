"""Telemetry models: Sensors, SensorReadings, WeatherData, SatelliteObservations."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from app.core.database import Base

class SensorStatus(str, enum.Enum):
    ONLINE = "ONLINE"
    WARNING = "WARNING"
    OFFLINE = "OFFLINE"

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    sensor_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. SM-AS-DH-001
    name = Column(String(100), nullable=False)
    district_id = Column(Integer, index=True, nullable=False)
    district_name = Column(String(100), nullable=False)
    zone_id = Column(Integer, index=True, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(Enum(SensorStatus), default=SensorStatus.ONLINE)
    soil_moisture = Column(Float, default=45.0) # percentage
    battery_level = Column(Float, default=95.0) # percentage
    pore_water_pressure_kpa = Column(Float, default=12.5) # kPa geotechnical sensor
    tilt_degrees = Column(Float, default=0.2) # inclinometer
    signal_strength_dbm = Column(Float, default=-72.0)
    last_reading_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id"), index=True, nullable=False)
    soil_moisture = Column(Float, nullable=False)
    battery_level = Column(Float, nullable=False)
    pore_water_pressure_kpa = Column(Float, default=12.0)
    tilt_degrees = Column(Float, default=0.1)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, index=True, nullable=False)
    district_name = Column(String(100), nullable=False)
    current_rainfall = Column(Float, default=0.0) # mm/hr
    rainfall_intensity = Column(String(50), default="Light") # Light, Moderate, Heavy, Very Heavy
    rainfall_1h = Column(Float, default=1.5)
    rainfall_3h = Column(Float, default=4.2)
    rainfall_6h = Column(Float, default=9.8)
    rainfall_24h = Column(Float, default=24.5)
    forecast_rainfall_24h = Column(Float, default=32.0)
    temperature = Column(Float, default=24.0)
    humidity = Column(Float, default=85.0)
    wind_speed = Column(Float, default=12.0)
    weather_warning = Column(String(100), default="GREEN: Normal monsoon conditions")
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SatelliteObservation(Base):
    __tablename__ = "satellite_observations"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, index=True, nullable=False)
    zone_name = Column(String(150), nullable=False)
    observation_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    ndvi = Column(Float, default=0.68) # -1.0 to 1.0
    surface_change_index = Column(Float, default=0.12) # 0.0 to 1.0
    ground_displacement_mm = Column(Float, default=2.4) # mm/month InSAR
    land_cover_change = Column(String(100), default="Minimal change detected")
    confidence_score = Column(Float, default=0.92)
    data_source = Column(String(100), default="ISRO Bhuvan / Sentinel-1 SAR Mock")
