import sys
sys.path.append('.')
from app.services.ml_service import ml_service

features = {
    "rainfall_1h": None,
    "rainfall_intensity": None,
    "soil_moisture": None,
    "slope_angle": None,
    "elevation": None,
    "historical_landslide_freq": None,
    "distance_from_road": None,
    "field_reports": None
}

try:
    res = ml_service.predict(features)
    print("Success")
except Exception as e:
    print(f"Error: {e}")
