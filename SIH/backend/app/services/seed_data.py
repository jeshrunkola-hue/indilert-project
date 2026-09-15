"""
Comprehensive Seed Data Generator for NER-SAFE.
Populates realistic geological, topographical, road, sensor, and village data
for all 8 North Eastern Region (NER) States:
Assam, Arunachal Pradesh, Meghalaya, Nagaland, Manipur, Mizoram, Tripura, Sikkim.
"""
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.models.user import User, UserRole
from app.models.spatial import District, Zone, Road, Village, Infrastructure, RiskLevel, RoadStatus, InfrastructureType
from app.models.telemetry import Sensor, WeatherData, SatelliteObservation, SensorStatus
from app.models.incidents import CitizenReport, Incident, AuditLog, ReportType, IncidentStatus
from app.models.alerts import Alert, AlertLevel
from app.models.emergency_alerts import EmergencyAlert, PushSubscription, AlertSeverity, AlertStatus, AlertMode
from app.models.predictions import RiskConfig
from app.core.security import get_password_hash
from app.services.risk_engine import risk_engine

def seed_all_ner_data(db: Session):
    # 1. Seed Users if not present
    if db.query(User).count() == 0:
        users = [
            User(
                email="admin@nersafe.gov.in",
                full_name="Dr. Hemanta Barua (State GIS Coordinator)",
                hashed_password=get_password_hash("Password@123"),
                role=UserRole.ADMIN,
                phone_number="+91-98640-11223"
            ),
            User(
                email="dma@nersafe.gov.in",
                full_name="Smt. Larisa Nongrum (SDMA Incident Commander)",
                hashed_password=get_password_hash("Password@123"),
                role=UserRole.DISASTER_MANAGEMENT_AUTHORITY,
                phone_number="+91-94361-44556"
            ),
            User(
                email="field@nersafe.gov.in",
                full_name="Ins. Tenzing Lepcha (Field Patrol Leader)",
                hashed_password=get_password_hash("Password@123"),
                role=UserRole.FIELD_OFFICER,
                phone_number="+91-97330-88990"
            ),
            User(
                email="citizen@nersafe.gov.in",
                full_name="Rohlupuii Sailo (Local Resident)",
                hashed_password=get_password_hash("Password@123"),
                role=UserRole.CITIZEN,
                phone_number="+91-94363-22110"
            )
        ]
        db.add_all(users)
        db.commit()

    # 2. Seed Risk Config Weights
    if db.query(RiskConfig).count() == 0:
        weights = [
            RiskConfig(factor_name="rainfall", weight=0.30, display_name="24h / Cumulative Rainfall Intensity", description="Precipitation threshold trigger"),
            RiskConfig(factor_name="soil_moisture", weight=0.20, display_name="Soil Volumetric Moisture Content", description="In-situ TDR and satellite soil saturation"),
            RiskConfig(factor_name="slope", weight=0.15, display_name="Topographical Slope Gradient", description="Slope angle derived from SRTM/Cartosat DEM"),
            RiskConfig(factor_name="terrain", weight=0.10, display_name="Geological Substrate & Elevation", description="Shale, schist, and weathered sandstone formation"),
            RiskConfig(factor_name="history", weight=0.15, display_name="Historical Landslide Recurrence", description="GSI landslide inventory historical density"),
            RiskConfig(factor_name="field_reports", weight=0.10, display_name="Recent Field Patrol & Citizen Reports", description="Ground truth observations of tension cracks & toe seepage")
        ]
        db.add_all(weights)
        db.commit()

    # 3. Seed NER Districts across all 8 States
    if db.query(District).count() == 0:
        districts_data = [
            {"name": "Dima Hasao", "state": "Assam", "lat": 25.1837, "lng": 93.0200, "pop": 214102, "risk": 78.0, "level": RiskLevel.HIGH},
            {"name": "East Khasi Hills", "state": "Meghalaya", "lat": 25.5788, "lng": 91.8933, "pop": 825922, "risk": 82.0, "level": RiskLevel.CRITICAL},
            {"name": "Tawang", "state": "Arunachal Pradesh", "lat": 27.5861, "lng": 91.8653, "pop": 49977, "risk": 48.0, "level": RiskLevel.MODERATE},
            {"name": "Kohima", "state": "Nagaland", "lat": 25.6751, "lng": 94.1086, "pop": 267988, "risk": 64.0, "level": RiskLevel.HIGH},
            {"name": "Mangan", "state": "Sikkim", "lat": 27.5110, "lng": 88.5320, "pop": 43709, "risk": 86.0, "level": RiskLevel.CRITICAL},
            {"name": "Aizawl", "state": "Mizoram", "lat": 23.7271, "lng": 92.7176, "pop": 400309, "risk": 68.0, "level": RiskLevel.HIGH},
            {"name": "Tamenglong", "state": "Manipur", "lat": 24.9850, "lng": 93.4980, "pop": 140651, "risk": 52.0, "level": RiskLevel.MODERATE},
            {"name": "North Tripura", "state": "Tripura", "lat": 24.2300, "lng": 92.1700, "pop": 417441, "risk": 32.0, "level": RiskLevel.LOW},
        ]

        district_objs = []
        for d in districts_data:
            dist = District(
                name=d["name"],
                state=d["state"],
                center_lat=d["lat"],
                center_lng=d["lng"],
                population=d["pop"],
                current_risk_score=d["risk"],
                current_risk_level=d["level"],
                active_incidents_count=2 if d["risk"] > 70 else 1,
                blocked_roads_count=1 if d["level"] == RiskLevel.CRITICAL else 0
            )
            district_objs.append(dist)
        db.add_all(district_objs)
        db.commit()

        # 4. Seed Zones
        zones_data = [
            {
                "name": "Jatinga Escarpment Slope",
                "district_name": "Dima Hasao",
                "lat": 25.1215, "lng": 93.0312,
                "slope": 34.0, "elev": 780.0, "soil_m": 72.0, "r24": 115.0, "history": 7, "reports": 2,
                "terrain": "Barail Formation shale-sandstone alternation with road-cut destabilization",
                "land_cover": "Degraded mixed deciduous scrub", "risk": 78.0, "level": RiskLevel.HIGH
            },
            {
                "name": "Nohkalikai Valley Ridge",
                "district_name": "East Khasi Hills",
                "lat": 25.2750, "lng": 91.7280,
                "slope": 48.0, "elev": 1420.0, "soil_m": 88.0, "r24": 195.0, "history": 9, "reports": 3,
                "terrain": "Cretaceous-Tertiary sandstone cliff with high vertical tension cracks",
                "land_cover": "Wet montane grassland and plateau gorges", "risk": 84.0, "level": RiskLevel.CRITICAL
            },
            {
                "name": "Sela Pass Corridor",
                "district_name": "Tawang",
                "lat": 27.5020, "lng": 92.1050,
                "slope": 38.0, "elev": 3150.0, "soil_m": 48.0, "r24": 38.0, "history": 4, "reports": 1,
                "terrain": "Gneissic bedrock with freeze-thaw shattered morainic debris",
                "land_cover": "Subalpine dwarf rhododendron scree", "risk": 48.0, "level": RiskLevel.MODERATE
            },
            {
                "name": "Zubza Railway Cut Slope",
                "district_name": "Kohima",
                "lat": 25.6820, "lng": 94.0720,
                "slope": 32.0, "elev": 1340.0, "soil_m": 66.0, "r24": 62.0, "history": 5, "reports": 1,
                "terrain": "Disang Formation weathered phyllites prone to deep seated rotational slips",
                "land_cover": "Subtropical secondary pine forest", "risk": 64.0, "level": RiskLevel.HIGH
            },
            {
                "name": "Mangan-Chungthang Highway Stretch",
                "district_name": "Mangan",
                "lat": 27.5110, "lng": 88.5320,
                "slope": 45.0, "elev": 1580.0, "soil_m": 92.0, "r24": 180.0, "history": 11, "reports": 4,
                "terrain": "Central Crystalline gneiss-schist over Teesta river toe scouring",
                "land_cover": "Steep riverine gorge with active toe erosion", "risk": 88.0, "level": RiskLevel.CRITICAL
            },
            {
                "name": "Hunthar Ridge Sinking Zone",
                "district_name": "Aizawl",
                "lat": 23.7420, "lng": 92.7090,
                "slope": 36.0, "elev": 920.0, "soil_m": 71.0, "r24": 82.0, "history": 6, "reports": 2,
                "terrain": "Bhuban Formation siltstone/mudstone with urban surcharge load",
                "land_cover": "High-density hillside human settlement", "risk": 68.0, "level": RiskLevel.HIGH
            },
            {
                "name": "Awangkhurl Slope Corridor",
                "district_name": "Tamenglong",
                "lat": 24.9850, "lng": 93.4980,
                "slope": 29.0, "elev": 1120.0, "soil_m": 54.0, "r24": 42.0, "history": 3, "reports": 0,
                "terrain": "Surma Group compact sandstones with moderate fracturing",
                "land_cover": "Dense bamboo and tropical evergreen forests", "risk": 52.0, "level": RiskLevel.MODERATE
            },
            {
                "name": "Longtharai Valley Escarpment",
                "district_name": "North Tripura",
                "lat": 24.2300, "lng": 92.1700,
                "slope": 22.0, "elev": 460.0, "soil_m": 42.0, "r24": 28.0, "history": 1, "reports": 0,
                "terrain": "Tipam sandstone with low structural dip",
                "land_cover": "Mixed moist deciduous canopy", "risk": 32.0, "level": RiskLevel.LOW
            }
        ]

        for z in zones_data:
            d = db.query(District).filter(District.name == z["district_name"]).first()
            did = d.id if d else 1
            # Calculate factors
            score, level, factors = risk_engine.calculate_risk(
                rainfall_24h=z["r24"],
                soil_moisture=z["soil_m"],
                slope_angle=z["slope"],
                elevation=z["elev"],
                historical_freq=z["history"],
                field_reports_count=z["reports"],
                db=db
            )
            zone_obj = Zone(
                name=z["name"],
                district_id=did,
                district_name=z["district_name"],
                center_lat=z["lat"],
                center_lng=z["lng"],
                radius_km=6.0,
                slope_angle=z["slope"],
                elevation=z["elev"],
                terrain_type=z["terrain"],
                land_cover=z["land_cover"],
                current_risk_score=score,
                current_risk_level=level,
                soil_moisture=z["soil_m"],
                rainfall_1h=round(z["r24"] * 0.08, 1),
                rainfall_3h=round(z["r24"] * 0.22, 1),
                rainfall_6h=round(z["r24"] * 0.45, 1),
                rainfall_24h=z["r24"],
                forecast_rainfall_24h=round(z["r24"] * 1.3, 1),
                historical_incidents_count=z["history"],
                recent_field_reports_count=z["reports"],
                contributing_factors=factors,
                ai_prediction_summary=f"Evaluated risk {score:.1f}% ({level.value}) based on continuous precipitation",
                last_evaluated_at=datetime.now(timezone.utc)
            )
            db.add(zone_obj)
        db.commit()

        # 5. Seed Roads
        roads_data = [
            {
                "name": "Lumding-Silchar National Highway Corridor",
                "route": "NH-27",
                "district": "Dima Hasao",
                "status": RoadStatus.RESTRICTED,
                "reason": "Debris clearance underway near Jatinga km 82; single lane alternating traffic",
                "alt": "Via Haflong-Mahur-Maibang detour (Rural PWD Route 04, adds 42 km)",
                "villages": ["Jatinga", "Haflong Bazar", "Lower Bagetar"],
                "isolated_pop": 4200,
                "coords": [[25.18, 93.01], [25.15, 93.02], [25.12, 93.03], [25.08, 93.05]]
            },
            {
                "name": "Guwahati-Shillong-Silchar Highway",
                "route": "NH-6",
                "district": "East Khasi Hills",
                "status": RoadStatus.OPEN,
                "reason": None,
                "alt": "Direct corridor via Sonapur Tunnel",
                "villages": ["Umiam", "Mawlai", "Cherrapunjee Outpost"],
                "isolated_pop": 0,
                "coords": [[25.65, 91.91], [25.58, 91.89], [25.50, 91.85]]
            },
            {
                "name": "Teesta Highway Lifeline to North Sikkim",
                "route": "NH-10",
                "district": "Mangan",
                "status": RoadStatus.BLOCKED,
                "reason": "Severe road subsidence and boulder blockade at Toong bridge approach",
                "alt": "Border Roads Taskforce emergency foot track only; vehicular detour via Dzongu route",
                "villages": ["Chungthang", "Lachen Base", "Lachung Crossing"],
                "isolated_pop": 8600,
                "coords": [[27.42, 88.52], [27.48, 88.53], [27.54, 88.55]]
            },
            {
                "name": "Dimapur-Kohima-Imphal Highway",
                "route": "NH-29",
                "district": "Kohima",
                "status": RoadStatus.PARTIALLY_BLOCKED,
                "reason": "Active mudflow and retaining wall bulging near Old Phesama checkpost",
                "alt": "Via Jotsoma bypass road (light passenger vehicles only)",
                "villages": ["Zubza", "Phesama", "Medziphema Link"],
                "isolated_pop": 3100,
                "coords": [[25.75, 94.01], [25.68, 94.07], [25.62, 94.12]]
            },
            {
                "name": "Balipara-Charduar-Tawang Corridor",
                "route": "NH-13",
                "district": "Tawang",
                "status": RoadStatus.OPEN,
                "reason": None,
                "alt": "Via Sela Tunnel Route-1",
                "villages": ["Jaswant Garh", "Jang", "Tawang Upper Town"],
                "isolated_pop": 0,
                "coords": [[27.50, 92.10], [27.54, 91.98], [27.58, 91.86]]
            }
        ]

        for r in roads_data:
            d = db.query(District).filter(District.name == r["district"]).first()
            did = d.id if d else 1
            rd_obj = Road(
                name=r["name"],
                route_number=r["route"],
                district_id=did,
                district_name=r["district"],
                status=r["status"],
                blockage_reason=r["reason"],
                alternative_route=r["alt"],
                affected_villages=r["villages"],
                isolated_population=r["isolated_pop"],
                coordinates_geojson={"type": "LineString", "coordinates": r["coords"]},
                nearest_emergency_resources=[
                    {"name": "Haflong Civil Hospital", "distance_km": 14.2, "type": "HOSPITAL"},
                    {"name": "BRO Task Force 42 Depot", "distance_km": 6.5, "type": "EQUIPMENT"}
                ]
            )
            db.add(rd_obj)
        db.commit()

        # 6. Seed Villages & Infrastructure
        vils = [
            Village(name="Jatinga Settlement", district_id=1, latitude=25.1215, longitude=93.0312, population=2400, is_isolated=0, evacuation_shelter="Jatinga Higher Secondary School"),
            Village(name="Haflong Hill Enclave", district_id=1, latitude=25.1780, longitude=93.0180, population=4100, is_isolated=0, evacuation_shelter="District Indoor Stadium"),
            Village(name="Sohra Upper Gorge Village", district_id=2, latitude=25.2850, longitude=91.7310, population=1850, is_isolated=0, evacuation_shelter="Cherra Presbyterian Mission Hall"),
            Village(name="Mangan Riverside Colony", district_id=5, latitude=27.5080, longitude=88.5300, population=1900, is_isolated=1, evacuation_shelter="Mangan District Community Center"),
            Village(name="Chungthang Hub", district_id=5, latitude=27.6040, longitude=88.6480, population=2800, is_isolated=1, evacuation_shelter="Army Cantonment Multipurpose Hall"),
            Village(name="Phesama Terraces", district_id=4, latitude=25.6320, longitude=94.1150, population=1650, is_isolated=0, evacuation_shelter="Phesama Baptist School")
        ]
        db.add_all(vils)

        infra_items = [
            Infrastructure(name="Haflong Civil Hospital & Trauma Unit", type=InfrastructureType.HOSPITAL, district_id=1, latitude=25.1750, longitude=93.0220, capacity="150 Beds / ICU Ready"),
            Infrastructure(name="Jatinga Rail Viaduct & Road Overbridge", type=InfrastructureType.BRIDGE, district_id=1, latitude=25.1240, longitude=93.0350, capacity="Strategic Lifeline"),
            Infrastructure(name="Cherrapunjee Community Health Centre", type=InfrastructureType.HOSPITAL, district_id=2, latitude=25.2780, longitude=91.7340, capacity="60 Beds"),
            Infrastructure(name="Mangan District Hospital", type=InfrastructureType.HOSPITAL, district_id=5, latitude=27.5140, longitude=88.5360, capacity="80 Beds"),
            Infrastructure(name="Chungthang Hydro Power Substation", type=InfrastructureType.POWER_SUBSTATION, district_id=5, latitude=27.6010, longitude=88.6420, capacity="300 MW Critical Grid"),
            Infrastructure(name="Kohima South Police Station & SDRF Base", type=InfrastructureType.POLICE_STATION, district_id=4, latitude=25.6680, longitude=94.1020, capacity="Quick Response Team")
        ]
        db.add_all(infra_items)
        db.commit()

        # 7. Seed Sensors
        sensors_list = [
            Sensor(sensor_code="SM-AS-DH-001", name="Jatinga Highway Cut Sensor-A", district_id=1, district_name="Dima Hasao", latitude=25.1215, longitude=93.0312, status=SensorStatus.ONLINE, soil_moisture=72.0, battery_level=94.0, pore_water_pressure_kpa=22.4, tilt_degrees=0.45),
            Sensor(sensor_code="SM-AS-DH-002", name="Jatinga Railway Toe Sensor-B", district_id=1, district_name="Dima Hasao", latitude=25.1180, longitude=93.0360, status=SensorStatus.ONLINE, soil_moisture=68.0, battery_level=89.0, pore_water_pressure_kpa=19.8, tilt_degrees=0.38),
            Sensor(sensor_code="SM-ML-EKH-001", name="Cherrapunjee Escarpment Probe", district_id=2, district_name="East Khasi Hills", latitude=25.2750, longitude=91.7280, status=SensorStatus.WARNING, soil_moisture=88.0, battery_level=91.0, pore_water_pressure_kpa=34.2, tilt_degrees=1.20),
            Sensor(sensor_code="SM-SK-MNG-001", name="Mangan Highway Toe Sensor", district_id=5, district_name="Mangan", latitude=27.5110, longitude=88.5320, status=SensorStatus.WARNING, soil_moisture=92.0, battery_level=82.0, pore_water_pressure_kpa=38.6, tilt_degrees=1.65),
            Sensor(sensor_code="SM-NL-KHM-001", name="Zubza Bypass Geotech Node", district_id=4, district_name="Kohima", latitude=25.6820, longitude=94.0720, status=SensorStatus.ONLINE, soil_moisture=66.0, battery_level=96.0, pore_water_pressure_kpa=18.4, tilt_degrees=0.25),
            Sensor(sensor_code="SM-AR-TWG-001", name="Sela Moraine Inclinometer", district_id=3, district_name="Tawang", latitude=27.5020, longitude=92.1050, status=SensorStatus.ONLINE, soil_moisture=48.0, battery_level=78.0, pore_water_pressure_kpa=11.2, tilt_degrees=0.10)
        ]
        db.add_all(sensors_list)

        # 8. Seed Weather Data
        weathers = [
            WeatherData(district_id=1, district_name="Dima Hasao", current_rainfall=14.5, rainfall_intensity="Heavy", rainfall_1h=14.5, rainfall_3h=32.0, rainfall_6h=58.0, rainfall_24h=115.0, forecast_rainfall_24h=130.0, temperature=23.0, humidity=94.0, wind_speed=18.0, weather_warning="ORANGE: Continuous heavy precipitation alert"),
            WeatherData(district_id=2, district_name="East Khasi Hills", current_rainfall=26.0, rainfall_intensity="Very Heavy", rainfall_1h=26.0, rainfall_3h=64.0, rainfall_6h=112.0, rainfall_24h=195.0, forecast_rainfall_24h=210.0, temperature=18.0, humidity=98.0, wind_speed=24.0, weather_warning="RED: Flash flood and landslide warning"),
            WeatherData(district_id=5, district_name="Mangan", current_rainfall=22.0, rainfall_intensity="Heavy", rainfall_1h=22.0, rainfall_3h=52.0, rainfall_6h=95.0, rainfall_24h=180.0, forecast_rainfall_24h=190.0, temperature=16.0, humidity=96.0, wind_speed=20.0, weather_warning="RED: Teesta basin geotechnical advisory"),
            WeatherData(district_id=4, district_name="Kohima", current_rainfall=8.0, rainfall_intensity="Moderate", rainfall_1h=8.0, rainfall_3h=18.0, rainfall_6h=34.0, rainfall_24h=62.0, forecast_rainfall_24h=75.0, temperature=20.0, humidity=89.0, wind_speed=12.0, weather_warning="YELLOW: Isolated heavy rainfall alert")
        ]
        db.add_all(weathers)

        # 9. Seed Satellite Observations
        sat_obs = [
            SatelliteObservation(zone_id=1, zone_name="Jatinga Escarpment Slope", ndvi=0.44, surface_change_index=0.72, ground_displacement_mm=18.2, land_cover_change="Road-cut toe slope excavation detected", confidence_score=0.91),
            SatelliteObservation(zone_id=2, zone_name="Nohkalikai Valley Ridge", ndvi=0.56, surface_change_index=0.68, ground_displacement_mm=14.5, land_cover_change="High pore saturation surface runoff scars", confidence_score=0.94),
            SatelliteObservation(zone_id=5, zone_name="Mangan-Chungthang Highway Stretch", ndvi=0.34, surface_change_index=0.88, ground_displacement_mm=31.4, land_cover_change="Severe riverine toe scour & crown tension cracking", confidence_score=0.96)
        ]
        db.add_all(sat_obs)

        # 10. Seed Initial Citizen / Field Reports
        reps = [
            CitizenReport(
                reporter_name="Bikash Debbarma",
                reporter_contact="+91-94361-99881",
                reporter_role="CITIZEN",
                report_type=ReportType.CRACK,
                latitude=25.1220,
                longitude=93.0318,
                district_name="Dima Hasao",
                description="Observed continuous 4-inch wide ground cracks developing parallel to NH-27 hillside retaining wall.",
                media_urls=["https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800"],
                severity=RiskLevel.HIGH,
                ai_assessed_type="Tension Fracture in Slope Crown",
                ai_assessed_severity=RiskLevel.HIGH,
                ai_confidence=0.92,
                ai_recommended_action="Dispatch field geotech inspector within 2 hours. Restrict heavy multi-axle freight vehicles.",
                is_verified=True,
                status=IncidentStatus.VERIFIED
            ),
            CitizenReport(
                reporter_name="Ins. Tenzing Lepcha",
                reporter_contact="+91-97330-88990",
                reporter_role="FIELD_OFFICER",
                report_type=ReportType.ROAD_BLOCKAGE,
                latitude=27.5110,
                longitude=88.5320,
                district_name="Mangan",
                description="Active rockfall and debris covering 40 meters of highway near Toong bridge. Teesta river scouring the lower toe.",
                media_urls=["https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800"],
                severity=RiskLevel.CRITICAL,
                ai_assessed_type="Rotational Debris Avalanche",
                ai_assessed_severity=RiskLevel.CRITICAL,
                ai_confidence=0.97,
                ai_recommended_action="Immediate traffic suspension. Mobilize BRO Task Force with heavy excavators.",
                is_verified=True,
                status=IncidentStatus.RESPONSE_STARTED
            )
        ]
        db.add_all(reps)

        # 11. Seed Incidents
        incs = [
            Incident(
                title="Toong Bridge Approach Road Subsidence",
                description="NH-10 blocked by rockslide and river toe erosion cutting off Chungthang sub-division.",
                district_name="Mangan",
                zone_name="Mangan-Chungthang Highway Stretch",
                latitude=27.5110,
                longitude=88.5320,
                severity=RiskLevel.CRITICAL,
                status=IncidentStatus.RESPONSE_STARTED,
                report_source="FIELD_PATROL",
                assigned_team="BRO Project Swastik & SDRF Sikkim",
                evacuation_required=True
            ),
            Incident(
                title="Jatinga Highway Retaining Wall Distress",
                description="Tension cracks spreading across NH-27 shoulder near Jatinga km 82.",
                district_name="Dima Hasao",
                zone_name="Jatinga Escarpment Slope",
                latitude=25.1220,
                longitude=93.0318,
                severity=RiskLevel.HIGH,
                status=IncidentStatus.UNDER_INVESTIGATION,
                report_source="CITIZEN_REPORT",
                assigned_team="NHAI Technical Inspection Unit Haflong",
                evacuation_required=False
            )
        ]
        db.add_all(incs)

        # 12. Seed Emergency Alert
        alerts = [
            Alert(
                alert_code="ALT-NER-2026-MNG-001",
                level=AlertLevel.LEVEL_4_EMERGENCY,
                title="CRITICAL LANDSLIDE RED ALERT — Mangan & Teesta Corridor",
                message_en="🚨 CRITICAL EMERGENCY LANDSLIDE ALERT: Extreme slope failure probability in Mangan-Chungthang corridor due to 180mm continuous rainfall. NH-10 blocked. Evacuate vulnerable river slopes.",
                message_hi="🚨 अत्यंत गंभीर भूस्खलन चेतावनी: मंगन-चुंगथांग मार्ग पर भारी भूस्खलन और एनएच-10 अवरुद्ध। तुरंत सुरक्षित स्थानों पर जाएं।",
                message_regional="🚨 অত্যন্ত জৰুৰী ভূমিস্খলন সতৰ্কবাৰ্তা: মংগন-চুংথাং কৰিডৰত অতিবৃষ্টিৰ ফলত এনএইচ-১০ পথ সম্পূৰ্ণ বন্ধ হৈ পৰিছে। পাহাৰীয়া অঞ্চলৰ লোকসকলক সুৰক্ষিত স্থানলৈ যাবলৈ কোৱা হৈছে।",
                regional_language="as",
                district_name="Mangan",
                zone_name="Mangan-Chungthang Highway Stretch",
                cause="Torrential rainfall (180mm/24h), extreme river toe scour, saturated soil pore pressure",
                recommended_action="Evacuate settlements near active slopes. Suspend all non-emergency transit on NH-10. Coordinate with District Control Room.",
                issued_by="Sikkim State Disaster Management Authority (SSDMA)",
                issued_at=datetime.now(timezone.utc) - timedelta(hours=2),
                expires_at=datetime.now(timezone.utc) + timedelta(hours=10),
                is_active=True,
                channels=["WEB_DASHBOARD", "CELL_BROADCAST_SIM", "SMS_GATEWAY"],
                acknowledged_count=14
            ),
            Alert(
                alert_code="ALT-NER-2026-DH-002",
                level=AlertLevel.LEVEL_3_WARNING,
                title="HIGH RISK LANDSLIDE WARNING — Dima Hasao Jatinga Belt",
                message_en="⚠️ HIGH RISK LANDSLIDE WARNING: Jatinga Escarpment slope saturation has crossed 72%. NH-27 restricted to emergency single-lane traffic.",
                message_hi="⚠️ उच्च जोखिम भूस्खलन चेतावनी: जतिंगा ढलान पर मिट्टी संतृप्ति 72% पार कर गई है। एनएच-27 पर केवल आपातकालीन वाहन जा सकते हैं।",
                message_regional="⚠️ উচ্চ আশংকা ভূমিস্খলন সতৰ্কবাৰ্তা: জাতিংগা পাহাৰৰ মাটিৰ আৰ্দ্ৰতা ৭২% অতিক্ৰম কৰিছে। এনএইচ-২৭ পথত যাতায়াত নিয়ন্ত্ৰিত কৰা হৈছে।",
                regional_language="as",
                district_name="Dima Hasao",
                zone_name="Jatinga Escarpment Slope",
                cause="115mm rainfall in 24 hours, active tension cracks reported",
                recommended_action="Restrict heavy vehicular traffic on NH-27. Field patrol teams on high alert.",
                issued_by="Assam State Disaster Management Authority (ASDMA)",
                issued_at=datetime.now(timezone.utc) - timedelta(hours=1),
                expires_at=datetime.now(timezone.utc) + timedelta(hours=11),
                is_active=True,
                channels=["WEB_DASHBOARD", "CELL_BROADCAST_SIM"],
                acknowledged_count=8
            )
        ]
        db.add_all(alerts)

        db.commit()

    # 13. Seed EmergencyAlerts for Indilert if none exist
    if db.query(EmergencyAlert).count() == 0:
        now = datetime.now(timezone.utc)
        emg_alerts = [
            EmergencyAlert(
                id="ALT-EMG-2026-EKH-001",
                title="Critical Landslide Warning: East Khasi Hills",
                message="High probability of slope failure detected on Shillong-Dawki Highway sector. Multiple ground cracks expanding rapidly.",
                severity=AlertSeverity.CRITICAL,
                type="LANDSLIDE",
                state="Meghalaya",
                district="East Khasi Hills",
                area="Shillong-Pynursla Ridge",
                latitude=25.5788,
                longitude=91.8933,
                risk_score=94.0,
                expected_window="Next 1-3 hours",
                recommended_action="Move away from steep slopes immediately. Avoid NH-40 travel. Proceed to designated community safe shelters in Pynursla.",
                issued_at=now - timedelta(minutes=45),
                expires_at=now + timedelta(hours=8),
                created_by="Dr. Hemanta Barua (State GIS Coordinator)",
                sender_role="DISASTER_AUTHORITY",
                status=AlertStatus.SENT,
                mode=AlertMode.LIVE,
                recipients_count=1240,
                push_sent_count=1240,
                opened_count=845,
                acknowledged_count=612,
                translations={
                    "en": {
                        "title": "Critical Landslide Warning: East Khasi Hills",
                        "message": "High probability of slope failure detected on Shillong-Dawki Highway sector. Multiple ground cracks expanding rapidly.",
                        "recommended_action": "Move away from steep slopes immediately. Avoid NH-40 travel."
                    },
                    "hi": {
                        "title": "गंभीर भूस्खलन चेतावनी: पूर्वी खासी हिल्स",
                        "message": "शिलांग-डावकी राजमार्ग खंड पर ढलान धंसने की अत्यधिक संभावना। तुरंत सुरक्षित स्थानों पर जाएं।",
                        "recommended_action": "पहाड़ी ढलानों से दूर रहें। राष्ट्रीय राजमार्ग 40 पर यात्रा से बचें।"
                    },
                    "kha": {
                        "title": "Ka jingma ba jur na ka jyntut khyndew: East Khasi Hills",
                        "message": "Ka jingma kaba jur na ka jyntut khyndew ha Shillong-Dawki. Kynriah noh sha ki jaka ba shngain.",
                        "recommended_action": "Kynriah mardor na ki jaka ba riat bad ki surok ba ma."
                    }
                }
            ),
            EmergencyAlert(
                id="ALT-EMG-2026-DH-002",
                title="Severe Landslide Advisory: Dima Hasao",
                message="Pore water pressure exceeds safety thresholds in Jatinga valley. Debris flow anticipated.",
                severity=AlertSeverity.HIGH,
                type="LANDSLIDE",
                state="Assam",
                district="Dima Hasao",
                area="Haflong-Jatinga Escarpment",
                latitude=25.1220,
                longitude=93.0318,
                risk_score=78.0,
                expected_window="Next 3-6 hours",
                recommended_action="Avoid non-essential transit along NH-27. Report tension cracks to emergency field teams.",
                issued_at=now - timedelta(hours=2),
                expires_at=now + timedelta(hours=10),
                created_by="Disaster Authority Controller",
                sender_role="DISASTER_AUTHORITY",
                status=AlertStatus.SENT,
                mode=AlertMode.LIVE,
                recipients_count=850,
                push_sent_count=850,
                opened_count=520,
                acknowledged_count=390,
                translations={
                    "en": {
                        "title": "Severe Landslide Advisory: Dima Hasao",
                        "message": "Pore water pressure exceeds safety thresholds in Jatinga valley.",
                        "recommended_action": "Avoid non-essential transit along NH-27."
                    }
                }
            )
        ]
        db.add_all(emg_alerts)
        db.commit()

    print("Successfully seeded comprehensive NER-SAFE dataset across all 8 states!")

