"""IoT Soil moisture sensor endpoints."""
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.telemetry import Sensor, SensorReading, SensorStatus
from app.schemas.telemetry import SensorResponse, SensorCreate, SensorReadingCreate

router = APIRouter(prefix="/sensors", tags=["Sensors & Geotechnical IoT"])

@router.get("", response_model=List[SensorResponse])
def get_sensors(db: Session = Depends(get_db)):
    return db.query(Sensor).all()

@router.get("/{sensor_id}", response_model=SensorResponse)
def get_sensor(sensor_id: int, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor

@router.post("", response_model=SensorResponse)
def create_sensor(sensor_in: SensorCreate, db: Session = Depends(get_db)):
    existing = db.query(Sensor).filter(Sensor.sensor_code == sensor_in.sensor_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Sensor with this code already exists")
    sensor = Sensor(
        sensor_code=sensor_in.sensor_code,
        name=sensor_in.name,
        district_id=sensor_in.district_id,
        district_name=sensor_in.district_name,
        zone_id=sensor_in.zone_id,
        latitude=sensor_in.latitude,
        longitude=sensor_in.longitude,
        status=sensor_in.status,
        soil_moisture=sensor_in.soil_moisture,
        battery_level=sensor_in.battery_level,
        pore_water_pressure_kpa=sensor_in.pore_water_pressure_kpa,
        tilt_degrees=sensor_in.tilt_degrees
    )
    db.add(sensor)
    db.commit()
    db.refresh(sensor)
    return sensor

@router.post("/data")
def ingest_telemetry_reading(reading: SensorReadingCreate, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == reading.sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    sensor.soil_moisture = reading.soil_moisture
    sensor.battery_level = reading.battery_level
    if reading.pore_water_pressure_kpa is not None:
        sensor.pore_water_pressure_kpa = reading.pore_water_pressure_kpa
    if reading.tilt_degrees is not None:
        sensor.tilt_degrees = reading.tilt_degrees
    sensor.last_reading_at = datetime.now(timezone.utc)

    # Auto status adjustment based on reading
    if reading.soil_moisture > 80.0 or reading.battery_level < 20.0:
        sensor.status = SensorStatus.WARNING
    else:
        sensor.status = SensorStatus.ONLINE

    hist = SensorReading(
        sensor_id=reading.sensor_id,
        soil_moisture=reading.soil_moisture,
        battery_level=reading.battery_level,
        pore_water_pressure_kpa=reading.pore_water_pressure_kpa or 12.0,
        tilt_degrees=reading.tilt_degrees or 0.1,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(hist)
    db.commit()
    return {"status": "success", "message": "Telemetry reading recorded"}
