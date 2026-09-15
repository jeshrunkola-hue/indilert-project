"""Weather Provider interface and Mock IMD implementation."""
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from datetime import datetime, timezone

class WeatherProvider(ABC):
    @abstractmethod
    def get_current_weather(self, district_name: str) -> Dict[str, Any]:
        """Fetch current weather observation for a district."""
        pass

    @abstractmethod
    def get_forecast(self, district_name: str) -> List[Dict[str, Any]]:
        """Fetch multi-day rainfall and weather forecast."""
        pass

    @abstractmethod
    def get_rainfall_summary(self) -> List[Dict[str, Any]]:
        """Fetch 1h, 3h, 6h, 24h rainfall across all monitored districts."""
        pass

class MockIMDWeatherProvider(WeatherProvider):
    """
    Simulates the India Meteorological Department (IMD) Automatic Weather Station (AWS)
    and Doppler Weather Radar feeds for the North Eastern Region.
    """
    def __init__(self):
        # District baseline climate profiles
        self.baselines = {
            "Dima Hasao": {"rainfall_24h": 45.0, "intensity": "Moderate", "temp": 22.5, "humidity": 92, "warning": "YELLOW: Heavy rainfall alert"},
            "East Khasi Hills": {"rainfall_24h": 120.0, "intensity": "Very Heavy", "temp": 18.0, "humidity": 98, "warning": "ORANGE: Continuous precipitation warning"},
            "Tawang": {"rainfall_24h": 35.0, "intensity": "Moderate", "temp": 11.0, "humidity": 88, "warning": "YELLOW: Cloudburst warning in high altitude"},
            "Kohima": {"rainfall_24h": 50.0, "intensity": "Moderate", "temp": 20.0, "humidity": 90, "warning": "YELLOW: Isolated intense showers"},
            "Mangan": {"rainfall_24h": 85.0, "intensity": "Heavy", "temp": 16.0, "humidity": 95, "warning": "ORANGE: Teesta basin landslide advisory"},
            "Aizawl": {"rainfall_24h": 60.0, "intensity": "Heavy", "temp": 21.0, "humidity": 91, "warning": "YELLOW: Steep slope runoff alert"},
            "Tamenglong": {"rainfall_24h": 40.0, "intensity": "Moderate", "temp": 23.0, "humidity": 89, "warning": "GREEN: Normal seasonal rain"},
            "North Tripura": {"rainfall_24h": 28.0, "intensity": "Light", "temp": 26.0, "humidity": 84, "warning": "GREEN: Moderate conditions"}
        }

    def get_current_weather(self, district_name: str) -> Dict[str, Any]:
        base = self.baselines.get(district_name, {"rainfall_24h": 30.0, "intensity": "Moderate", "temp": 22.0, "humidity": 88, "warning": "GREEN: Normal"})
        return {
            "provider": "India Meteorological Department (IMD) AWS Feed Mock",
            "district": district_name,
            "current_rainfall_rate_mm_h": round(base["rainfall_24h"] / 12, 1),
            "rainfall_intensity": base["intensity"],
            "rainfall_1h_mm": round(base["rainfall_24h"] * 0.08, 1),
            "rainfall_3h_mm": round(base["rainfall_24h"] * 0.22, 1),
            "rainfall_6h_mm": round(base["rainfall_24h"] * 0.45, 1),
            "rainfall_24h_mm": base["rainfall_24h"],
            "forecast_24h_mm": round(base["rainfall_24h"] * 1.3, 1),
            "temperature_c": base["temp"],
            "humidity_percent": base["humidity"],
            "wind_speed_kmh": 14.5,
            "wind_direction": "SSW",
            "atmospheric_pressure_hpa": 985.2,
            "weather_warning": base["warning"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def get_forecast(self, district_name: str) -> List[Dict[str, Any]]:
        base = self.baselines.get(district_name, {"rainfall_24h": 30.0})
        forecasts = []
        for i in range(1, 6):
            forecasts.append({
                "day_offset": i,
                "expected_rainfall_mm": round(base["rainfall_24h"] * (0.8 + 0.15 * i), 1),
                "probability_of_precipitation": min(95, 60 + i * 7),
                "alert_level": "WARNING" if base["rainfall_24h"] * (0.8 + 0.15 * i) > 65 else "WATCH"
            })
        return forecasts

    def get_rainfall_summary(self) -> List[Dict[str, Any]]:
        summary = []
        for district, base in self.baselines.items():
            summary.append({
                "district": district,
                "rainfall_1h": round(base["rainfall_24h"] * 0.08, 1),
                "rainfall_3h": round(base["rainfall_24h"] * 0.22, 1),
                "rainfall_6h": round(base["rainfall_24h"] * 0.45, 1),
                "rainfall_24h": base["rainfall_24h"],
                "warning": base["warning"]
            })
        return summary
