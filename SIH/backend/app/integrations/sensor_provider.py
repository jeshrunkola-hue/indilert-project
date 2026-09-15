"""IoT Soil Moisture & Geotechnical Sensor Provider interface and mock simulator."""
from abc import ABC, abstractmethod
from typing import Dict, Any, List
import random
from datetime import datetime, timezone

class SensorProvider(ABC):
    @abstractmethod
    def read_sensor(self, sensor_code: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def simulate_telemetry_stream(self) -> List[Dict[str, Any]]:
        pass

class MockIoTSensorProvider(SensorProvider):
    """
    Simulates LoRaWAN/NB-IoT deployed geotechnical slope sensors
    (TDR soil moisture probes, piezometers, and biaxial MEMS inclinometers).
    """
    def __init__(self):
        self.sensor_specs = [
            {"code": "SM-AS-DH-001", "name": "Jatinga Highway Cut Sensor-A", "lat": 25.1215, "lng": 93.0312, "base_sm": 52.0, "status": "ONLINE"},
            {"code": "SM-AS-DH-002", "name": "Jatinga Railway Toe Sensor-B", "lat": 25.1180, "lng": 93.0360, "base_sm": 58.0, "status": "ONLINE"},
            {"code": "SM-ML-EKH-001", "name": "Cherrapunjee Escarpment Sensor-1", "lat": 25.2750, "lng": 91.7280, "base_sm": 84.0, "status": "WARNING"},
            {"code": "SM-ML-EKH-002", "name": "Mawkdok Dympep Valley Probe", "lat": 25.3340, "lng": 91.7580, "base_sm": 78.0, "status": "ONLINE"},
            {"code": "SM-SK-MNG-001", "name": "Mangan Chungthang Road Sensor", "lat": 27.5110, "lng": 88.5320, "base_sm": 82.0, "status": "WARNING"},
            {"code": "SM-SK-MNG-002", "name": "Dikchu River Slope Inclinometer", "lat": 27.4210, "lng": 88.5440, "base_sm": 64.0, "status": "ONLINE"},
            {"code": "SM-NL-KHM-001", "name": "Zubza Bypass Geotechnical Node", "lat": 25.6820, "lng": 94.0720, "base_sm": 61.0, "status": "ONLINE"},
            {"code": "SM-MZ-AZL-001", "name": "Hunthar Sinking Zone Sensor", "lat": 23.7420, "lng": 92.7090, "base_sm": 74.0, "status": "ONLINE"},
            {"code": "SM-AR-TWG-001", "name": "Sela Ridge Frost-Thaw Probe", "lat": 27.5020, "lng": 92.1050, "base_sm": 48.0, "status": "ONLINE"},
            {"code": "SM-MN-TML-001", "name": "Tamenglong Hill Cut Probe-01", "lat": 24.9850, "lng": 93.4980, "base_sm": 55.0, "status": "ONLINE"}
        ]

    def read_sensor(self, sensor_code: str) -> Dict[str, Any]:
        for s in self.sensor_specs:
            if s["code"] == sensor_code:
                # Add micro-fluctuation
                noise = random.uniform(-0.5, 0.5)
                sm = min(100.0, max(10.0, s["base_sm"] + noise))
                return {
                    "sensor_code": sensor_code,
                    "name": s["name"],
                    "latitude": s["lat"],
                    "longitude": s["lng"],
                    "soil_moisture_percent": round(sm, 1),
                    "pore_water_pressure_kpa": round(sm * 0.28, 1),
                    "tilt_angle_degrees": round(0.1 + (sm / 100.0) * 0.8, 2),
                    "battery_level_percent": 94.0,
                    "signal_strength_rssi": -74,
                    "telemetry_protocol": "LoRaWAN Class-A Gateway",
                    "status": s["status"],
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
        return {}

    def simulate_telemetry_stream(self) -> List[Dict[str, Any]]:
        return [self.read_sensor(s["code"]) for s in self.sensor_specs]
