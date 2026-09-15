"""
NER-SAFE: AI-Powered Landslide Early Warning & Monitoring Platform for North Eastern Region of India.
Main FastAPI application entrypoint.
"""
import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse, RedirectResponse

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.seed_data import seed_all_ner_data
from app.api import (
    auth, districts, weather, sensors, satellite,
    predictions, risk, reports, incidents, roads,
    alerts, prioritization, analytics, simulation, websocket,
    emergency_alerts
)
from app.api.websocket import ws_manager

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Initialize database tables and seed data immediately
Base.metadata.create_all(bind=engine)
_db_init = SessionLocal()
try:
    seed_all_ner_data(_db_init)
finally:
    _db_init.close()

async def periodic_sensor_simulator():
    """Background task to simulate live IoT sensor micro-fluctuations and emit via WebSocket."""
    while True:
        await asyncio.sleep(8)
        try:
            db = SessionLocal()
            from app.models.telemetry import Sensor
            import random
            sensors_list = db.query(Sensor).all()
            if sensors_list:
                s = random.choice(sensors_list)
                jitter = random.uniform(-0.4, 0.4)
                s.soil_moisture = round(min(99.0, max(10.0, s.soil_moisture + jitter)), 1)
                db.commit()
                # Broadcast micro-update
                await ws_manager.broadcast({
                    "type": "SENSOR_TELEMETRY_UPDATE",
                    "sensor_code": s.sensor_code,
                    "district": s.district_name,
                    "soil_moisture": s.soil_moisture,
                    "status": s.status.value
                })
            db.close()
        except Exception as e:
            # ignore background loop hiccups
            pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background live IoT telemetry simulator
    sim_task = asyncio.create_task(periodic_sensor_simulator())
    yield
    sim_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## NER-SAFE: AI-Powered Landslide Early Warning & Monitoring Platform
    Comprehensive decision-support and emergency monitoring system for the 
    North Eastern Region of India (Assam, Arunachal Pradesh, Meghalaya, Nagaland, 
    Manipur, Mizoram, Tripura, Sikkim).

    Features:
    * Machine Learning Landslide Prediction Pipeline
    * Transparent & Explainable Weighted Risk Calculation
    * Real-Time GIS Geotechnical Mapping
    * IoT Soil Moisture & Pore Water Pressure Monitoring
    * Citizen and Field Officer Multi-modal Reporting
    * Lifeline Highway Connectivity & Blockage Detours
    * Common Alerting Protocol (CAP) & Cell Broadcast Integration Architecture
    * Disaster Management Response Prioritization Engine
    """,
    lifespan=lifespan
)

# CORS configuration supporting NER-SAFE & Indilert Netlify
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static media uploads mount
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include all API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(districts.router, prefix=settings.API_V1_STR)
app.include_router(weather.router, prefix=settings.API_V1_STR)
app.include_router(sensors.router, prefix=settings.API_V1_STR)
app.include_router(satellite.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(risk.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(roads.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(emergency_alerts.router, prefix=settings.API_V1_STR)
app.include_router(prioritization.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)
app.include_router(websocket.router)

# Health / Status endpoints
@app.get("/api/health")
@app.get("/api/status")
def health_check():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "docs_url": "/docs",
        "region_coverage": "Assam, Arunachal Pradesh, Meghalaya, Nagaland, Manipur, Mizoram, Tripura, Sikkim",
        "mode": "DEMO & EARLY WARNING DECISION SUPPORT"
    }

# Single-link serving: Mount compiled frontend from frontend/dist
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../frontend/dist"))
if not os.path.exists(FRONTEND_DIST):
    # Try alternative relative path
    FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))

# Indilert Integration endpoints & Service Worker
INDILERT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../indilert-integration"))
if not os.path.exists(INDILERT_DIR):
    INDILERT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../indilert-integration"))

@app.get("/sw.js")
def get_service_worker():
    sw_file = os.path.join(INDILERT_DIR, "public", "sw.js")
    if os.path.exists(sw_file):
        return FileResponse(sw_file, media_type="application/javascript")
    return FileResponse(os.path.join(FRONTEND_DIST, "sw.js"))

@app.get("/indilert")
@app.get("/indilert/")
def get_indilert_client():
    target = settings.INDILERT_PRODUCTION_URL if (settings.INDILERT_PRODUCTION_URL and "http" in settings.INDILERT_PRODUCTION_URL) else "http://localhost:3000/"
    return RedirectResponse(url=target)

if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend-assets")

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    async def serve_spa_frontend(full_path: str):
        target_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(target_path):
            return FileResponse(target_path)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        return {"platform": settings.PROJECT_NAME, "status": "OPERATIONAL", "docs_url": "/docs"}
else:
    @app.get("/")
    def root():
        return {
            "platform": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "OPERATIONAL",
            "docs_url": "/docs"
        }
