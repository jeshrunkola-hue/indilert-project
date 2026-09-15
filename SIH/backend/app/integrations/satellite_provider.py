"""Satellite Observation Provider interface and ISRO Bhuvan / Sentinel Mock."""
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from datetime import datetime, timezone

class SatelliteProvider(ABC):
    @abstractmethod
    def get_latest_observation(self, zone_id: int) -> Dict[str, Any]:
        """Fetch latest satellite observation for a slope zone."""
        pass

    @abstractmethod
    def get_all_observations(self) -> List[Dict[str, Any]]:
        """Fetch all satellite observations."""
        pass

class MockBhuvanSatelliteProvider(SatelliteProvider):
    """
    Simulates satellite observations derived from ISRO Bhuvan Geoportal
    and Sentinel-1 InSAR ground displacement analysis for the North East.
    """
    def __init__(self):
        self.observations = {
            1: {"zone": "Jatinga Escarpment Slope", "ndvi": 0.42, "displacement_mm": 18.5, "surface_change": 0.74, "land_cover": "Severe deforestation & road-cut toe erosion"},
            2: {"zone": "Nohkalikai Valley Ridge", "ndvi": 0.58, "displacement_mm": 9.2, "surface_change": 0.45, "land_cover": "High-altitude wet plateau scrub"},
            3: {"zone": "Sela Pass Corridor", "ndvi": 0.28, "displacement_mm": 24.1, "surface_change": 0.82, "land_cover": "Morainic scree & frost-wedged rock face"},
            4: {"zone": "Zubza Railway Cut Slope", "ndvi": 0.51, "displacement_mm": 14.8, "surface_change": 0.61, "land_cover": "Engineered slope with active tension cracks"},
            5: {"zone": "Mangan-Chungthang Highway Stretch", "ndvi": 0.35, "displacement_mm": 32.0, "surface_change": 0.89, "land_cover": "Deep-seated bedrock creep in Teesta gorge"},
            6: {"zone": "Hunthar Ridge Vulnerability Zone", "ndvi": 0.62, "displacement_mm": 12.3, "surface_change": 0.53, "land_cover": "Urbanised hill slope with drainage saturation"},
            7: {"zone": "Awangkhurl Slope Corridor", "ndvi": 0.65, "displacement_mm": 6.4, "surface_change": 0.31, "land_cover": "Subtropical evergreen forest canopy"},
            8: {"zone": "Longtharai Valley Escarpment", "ndvi": 0.70, "displacement_mm": 4.1, "surface_change": 0.22, "land_cover": "Bamboo brake with low creep"}
        }

    def get_latest_observation(self, zone_id: int) -> Dict[str, Any]:
        obs = self.observations.get(zone_id, {
            "zone": f"Zone {zone_id}",
            "ndvi": 0.55,
            "displacement_mm": 5.0,
            "surface_change": 0.25,
            "land_cover": "Moderate vegetation canopy"
        })
        return {
            "zone_id": zone_id,
            "zone_name": obs["zone"],
            "data_source": "ISRO Bhuvan / ESA Sentinel-1 InSAR Pipeline Mock",
            "observation_timestamp": datetime.now(timezone.utc).isoformat(),
            "vegetation_health_ndvi": obs["ndvi"],
            "ground_displacement_rate_mm_month": obs["displacement_mm"],
            "surface_disturbance_index": obs["surface_change"],
            "land_cover_description": obs["land_cover"],
            "interferometric_coherence": 0.84,
            "spatial_resolution_meters": 10.0,
            "satellite_pass": "Descending Track 121 (C-Band SAR)"
        }

    def get_all_observations(self) -> List[Dict[str, Any]]:
        return [self.get_latest_observation(zid) for zid in self.observations.keys()]
