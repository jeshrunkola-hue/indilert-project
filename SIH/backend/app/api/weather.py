"""Weather and precipitation endpoints."""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.telemetry import WeatherData
from app.schemas.telemetry import WeatherResponse
from app.integrations.weather_provider import MockIMDWeatherProvider

router = APIRouter(prefix="/weather", tags=["Weather & Rainfall"])
weather_provider = MockIMDWeatherProvider()

@router.get("/current")
def get_current_weather(district: str = Query("Dima Hasao", description="District name")):
    return weather_provider.get_current_weather(district)

@router.get("/forecast")
def get_forecast(district: str = Query("Dima Hasao", description="District name")):
    return weather_provider.get_forecast(district)

@router.get("/rainfall")
def get_rainfall_summary():
    return weather_provider.get_rainfall_summary()

@router.get("/records", response_model=List[WeatherResponse])
def get_all_weather_records(db: Session = Depends(get_db)):
    return db.query(WeatherData).all()
