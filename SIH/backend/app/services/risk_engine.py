"""
Transparent and explainable risk calculation engine with dynamic configurable factor weights.
"""
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.spatial import RiskLevel
from app.models.predictions import RiskConfig
from app.core.config import settings

class RiskCalculationEngine:
    def __init__(self):
        self.default_weights = settings.DEFAULT_RISK_WEIGHTS

    def get_active_weights(self, db: Session = None) -> Dict[str, float]:
        """Fetch weights from database if configured, or fall back to defaults."""
        weights = dict(self.default_weights)
        if db:
            try:
                configs = db.query(RiskConfig).all()
                if configs:
                    for cfg in configs:
                        if cfg.factor_name in weights:
                            weights[cfg.factor_name] = cfg.weight
            except Exception:
                pass
        # Ensure normalization to 1.0
        total = sum(weights.values())
        if total > 0:
            return {k: v / total for k, v in weights.items()}
        return weights

    def calculate_risk(
        self,
        rainfall_24h: float,
        soil_moisture: float,
        slope_angle: float,
        elevation: float,
        historical_freq: int,
        field_reports_count: int,
        db: Session = None
    ) -> Tuple[float, RiskLevel, Dict[str, Any]]:
        """
        Calculates composite landslide risk score (0-100) and produces
        an explainable contributing factor breakdown.
        """
        weights = self.get_active_weights(db)

        # 1. Normalize Rainfall (0 - 200 mm threshold)
        # > 150mm is extreme critical rainfall in NER
        rainfall_norm = min(100.0, (rainfall_24h / 150.0) * 100.0)

        # 2. Normalize Soil Moisture (0 - 100 %)
        # > 80% indicates pore saturation
        moisture_norm = min(100.0, max(0.0, ((soil_moisture - 20.0) / 75.0) * 100.0))

        # 3. Normalize Slope Angle (0 - 60 degrees)
        # Slopes between 25° and 50° are prime failure zones in NER shale/schist
        if slope_angle < 15.0:
            slope_norm = slope_angle * 1.5
        elif slope_angle <= 45.0:
            slope_norm = 30.0 + ((slope_angle - 15.0) / 30.0) * 70.0
        else:
            slope_norm = max(50.0, 100.0 - (slope_angle - 45.0) * 2.0)
        slope_norm = min(100.0, max(0.0, slope_norm))

        # 4. Normalize Terrain/Elevation (200 - 3500 meters)
        elevation_norm = min(100.0, max(10.0, (elevation / 3000.0) * 100.0))

        # 5. Normalize Historical Landslide Frequency (0 - 10 events)
        history_norm = min(100.0, (historical_freq / 6.0) * 100.0)

        # 6. Normalize Recent Field Reports (0 - 5 reports of cracks/movement)
        reports_norm = min(100.0, (field_reports_count / 3.0) * 100.0)

        # Compute weighted sum
        risk_score = (
            weights.get("rainfall", 0.30) * rainfall_norm +
            weights.get("soil_moisture", 0.20) * moisture_norm +
            weights.get("slope", 0.15) * slope_norm +
            weights.get("terrain", 0.10) * elevation_norm +
            weights.get("history", 0.15) * history_norm +
            weights.get("field_reports", 0.10) * reports_norm
        )
        risk_score = round(min(100.0, max(0.0, risk_score)), 1)

        # Categorize level
        if risk_score >= 80.0:
            risk_level = RiskLevel.CRITICAL
        elif risk_score >= 60.0:
            risk_level = RiskLevel.HIGH
        elif risk_score >= 35.0:
            risk_level = RiskLevel.MODERATE
        else:
            risk_level = RiskLevel.LOW

        def get_factor_label(val: float) -> str:
            if val >= 80.0:
                return "Very High"
            if val >= 60.0:
                return "High"
            if val >= 40.0:
                return "Moderate"
            if val >= 20.0:
                return "Low"
            return "Very Low"

        def get_progress_bar(val: float) -> str:
            blocks = int(round(val / 10.0))
            blocks = min(10, max(0, blocks))
            return "█" * blocks + "░" * (10 - blocks)

        factors = {
            "rainfall": {
                "weight_percent": round(weights.get("rainfall", 0.30) * 100, 1),
                "raw_value": f"{rainfall_24h:.1f} mm/24h",
                "score": round(rainfall_norm, 1),
                "rating": get_factor_label(rainfall_norm),
                "bar": get_progress_bar(rainfall_norm)
            },
            "soil_moisture": {
                "weight_percent": round(weights.get("soil_moisture", 0.20) * 100, 1),
                "raw_value": f"{soil_moisture:.1f}%",
                "score": round(moisture_norm, 1),
                "rating": get_factor_label(moisture_norm),
                "bar": get_progress_bar(moisture_norm)
            },
            "slope": {
                "weight_percent": round(weights.get("slope", 0.15) * 100, 1),
                "raw_value": f"{slope_angle:.1f}°",
                "score": round(slope_norm, 1),
                "rating": get_factor_label(slope_norm),
                "bar": get_progress_bar(slope_norm)
            },
            "terrain_elevation": {
                "weight_percent": round(weights.get("terrain", 0.10) * 100, 1),
                "raw_value": f"{elevation:.0f} m",
                "score": round(elevation_norm, 1),
                "rating": get_factor_label(elevation_norm),
                "bar": get_progress_bar(elevation_norm)
            },
            "history": {
                "weight_percent": round(weights.get("history", 0.15) * 100, 1),
                "raw_value": f"{historical_freq} past events",
                "score": round(history_norm, 1),
                "rating": get_factor_label(history_norm),
                "bar": get_progress_bar(history_norm)
            },
            "field_reports": {
                "weight_percent": round(weights.get("field_reports", 0.10) * 100, 1),
                "raw_value": f"{field_reports_count} verified alerts",
                "score": round(reports_norm, 1),
                "rating": get_factor_label(reports_norm),
                "bar": get_progress_bar(reports_norm)
            }
        }

        return risk_score, risk_level, factors

risk_engine = RiskCalculationEngine()
