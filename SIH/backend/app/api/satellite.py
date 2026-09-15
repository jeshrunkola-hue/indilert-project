"""Satellite observations endpoints."""
from typing import List
from fastapi import APIRouter
from app.integrations.satellite_provider import MockBhuvanSatelliteProvider

router = APIRouter(prefix="/satellite", tags=["Satellite Earth Observation"])
sat_provider = MockBhuvanSatelliteProvider()

@router.get("/observations")
def get_all_satellite_observations():
    return sat_provider.get_all_observations()

@router.get("/{zone_id}")
def get_satellite_observation_for_zone(zone_id: int):
    return sat_provider.get_latest_observation(zone_id)
