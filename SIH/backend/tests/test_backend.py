"""
Unit & Integration Test Suite for NER-SAFE Backend.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
    assert "NER-SAFE" in data["platform"]

def test_auth_login():
    # Test valid login
    res = client.post("/api/auth/login", json={
        "email": "admin@nersafe.gov.in",
        "password": "Password@123"
    })
    assert res.status_code == 200
    token_data = res.json()
    assert "access_token" in token_data
    assert token_data["user"]["role"] == "ADMIN"

def test_auth_invalid():
    res = client.post("/api/auth/login", json={
        "email": "admin@nersafe.gov.in",
        "password": "WrongPassword"
    })
    assert res.status_code == 401

def test_get_districts():
    res = client.get("/api/districts")
    assert res.status_code == 200
    districts = res.json()
    assert len(districts) >= 8
    names = [d["name"] for d in districts]
    assert "Dima Hasao" in names
    assert "East Khasi Hills" in names

def test_get_zones():
    res = client.get("/api/zones")
    assert res.status_code == 200
    zones = res.json()
    assert len(zones) >= 5
    first_zone = zones[0]
    assert "slope_angle" in first_zone
    assert "soil_moisture" in first_zone
    assert "contributing_factors" in first_zone

def test_ai_prediction_predict():
    payload = {
        "rainfall_1h": 35.0,
        "rainfall_3h": 70.0,
        "rainfall_6h": 120.0,
        "rainfall_24h": 180.0,
        "rainfall_intensity": 35.0,
        "soil_moisture": 85.0,
        "slope_angle": 42.0,
        "elevation": 1200.0,
        "historical_landslide_frequency": 6,
        "distance_from_road_m": 45.0,
        "previous_instability_reports": 2
    }
    res = client.post("/api/predictions/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "risk_score" in data
    assert data["risk_score"] > 60.0
    assert data["risk_level"] in ["HIGH", "CRITICAL"]
    assert "contributing_factors" in data
    assert data["is_demo_data"] is True

def test_risk_weights():
    res = client.get("/api/risk/weights")
    assert res.status_code == 200
    weights = res.json()
    assert len(weights) >= 6
    factor_names = [w["factor_name"] for w in weights]
    assert "rainfall" in factor_names
    assert "soil_moisture" in factor_names

def test_prioritization():
    res = client.get("/api/prioritization")
    assert res.status_code == 200
    priorities = res.json()
    assert len(priorities) > 0
    assert "priority_score" in priorities[0]
    assert "recommended_action" in priorities[0]
    # Check ranked order
    scores = [p["priority_score"] for p in priorities]
    assert scores == sorted(scores, reverse=True)

def test_roads_connectivity():
    res = client.get("/api/roads")
    assert res.status_code == 200
    roads = res.json()
    assert len(roads) > 0
    nh27 = next((r for r in roads if "NH-27" in r["route_number"]), None)
    assert nh27 is not None
    assert "alternative_route" in nh27

def test_sensors():
    res = client.get("/api/sensors")
    assert res.status_code == 200
    sensors = res.json()
    assert len(sensors) >= 4
    first = sensors[0]
    assert "soil_moisture" in first
    assert "battery_level" in first

def test_weather():
    res = client.get("/api/weather/current?district=East Khasi Hills")
    assert res.status_code == 200
    w = res.json()
    assert "rainfall_24h_mm" in w
    assert "weather_warning" in w

def test_emergency_alerts():
    res = client.get("/api/alerts")
    assert res.status_code == 200
    alerts = res.json()
    assert len(alerts) > 0
    first = alerts[0]
    assert "message_en" in first
    assert "message_hi" in first
    assert "message_regional" in first

def test_citizen_report_submission():
    data = {
        "reporter_name": "Test Citizen",
        "reporter_role": "CITIZEN",
        "report_type": "LANDSLIDE",
        "latitude": 25.12,
        "longitude": 93.03,
        "district_name": "Dima Hasao",
        "description": "Massive slope collapse blocked the lower bypass road near railway line.",
        "severity": "CRITICAL"
    }
    res = client.post("/api/reports", data=data)
    assert res.status_code == 200
    rep = res.json()
    assert rep["reporter_name"] == "Test Citizen"
    assert rep["ai_assessed_severity"] in ["HIGH", "CRITICAL"]
    assert rep["ai_recommended_action"] is not None

def test_simulation_endpoints():
    res_status = client.get("/api/simulation/status")
    assert res_status.status_code == 200
    
    res_advance = client.post("/api/simulation/advance")
    assert res_advance.status_code == 200
    adv_data = res_advance.json()
    assert adv_data["is_simulating"] is True
    assert adv_data["current_step"] >= 1
