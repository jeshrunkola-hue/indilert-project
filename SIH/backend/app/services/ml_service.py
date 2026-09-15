"""
Machine Learning Inference Service for Landslide Risk Prediction.
Loads the Scikit-learn Random Forest model bundle and provides
probability breakdowns for 1h, 3h, 6h, 12h, and 24h horizons.
"""
import os
import joblib
import numpy as np
from typing import Dict, Any
from app.models.spatial import RiskLevel
from app.services.risk_engine import risk_engine

class LandslideMLService:
    def __init__(self, model_path: str = "backend/app/ml/landslide_model.joblib"):
        self.model_path = model_path
        self.model_bundle = None
        self._load_model()

    def _load_model(self):
        # Check alternative locations
        paths_to_try = [
            self.model_path,
            "app/ml/landslide_model.joblib",
            os.path.join(os.path.dirname(__file__), "../ml/landslide_model.joblib")
        ]
        for p in paths_to_try:
            if os.path.exists(p):
                try:
                    self.model_bundle = joblib.load(p)
                    return
                except Exception as e:
                    print(f"Warning: Failed to load model from {p}: {e}")
        self.model_bundle = None

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run inference on feature dictionary:
        rainfall_1h, rainfall_3h, rainfall_6h, rainfall_24h, rainfall_intensity,
        soil_moisture, slope_angle, elevation, historical_landslide_freq,
        distance_from_road, field_reports.
        """
        def get_val(key, default):
            val = features.get(key)
            return default if val is None else val

        r1 = float(get_val("rainfall_1h", 2.0))
        r3 = float(get_val("rainfall_3h", 6.0))
        r6 = float(get_val("rainfall_6h", 15.0))
        r24 = float(get_val("rainfall_24h", 45.0))
        rint = float(get_val("rainfall_intensity", r1))
        sm = float(get_val("soil_moisture", 45.0))
        slope = float(get_val("slope_angle", 28.0))
        elev = float(get_val("elevation", 850.0))
        h_freq = int(get_val("historical_landslide_freq", 2))
        dist_road = float(get_val("distance_from_road", 120.0))
        reports = int(get_val("field_reports", 0))

        # First calculate explainable baseline risk score and factors
        calc_score, calc_level, factors = risk_engine.calculate_risk(
            rainfall_24h=r24,
            soil_moisture=sm,
            slope_angle=slope,
            elevation=elev,
            historical_freq=h_freq,
            field_reports_count=reports
        )

        model_version = "RandomForest-v1.2-NER"
        probability = min(0.99, max(0.01, calc_score / 100.0))
        
        # If trained ML model bundle is loaded, perform ensemble prediction
        if self.model_bundle is not None:
            try:
                feature_names = self.model_bundle.get("feature_names", [])
                row = np.array([[
                    r1, r3, r6, r24, rint, sm, slope, elev, h_freq, dist_road, reports
                ]])
                classifier = self.model_bundle["classifier"]
                regressor = self.model_bundle["regressor"]
                
                pred_reg = float(regressor.predict(row)[0])
                probs = classifier.predict_proba(row)[0]
                
                # Combine weighted physics-based score with ML ensemble
                combined_score = round(0.5 * calc_score + 0.5 * min(100.0, max(0.0, pred_reg)), 1)
                
                # Probability of high or critical
                if len(probs) >= 4:
                    probability = round(float(probs[2] + probs[3]), 2)
                    if probability < 0.05:
                        probability = round(combined_score / 100.0, 2)
                
                calc_score = combined_score
                if calc_score >= 80.0:
                    calc_level = RiskLevel.CRITICAL
                elif calc_score >= 60.0:
                    calc_level = RiskLevel.HIGH
                elif calc_score >= 35.0:
                    calc_level = RiskLevel.MODERATE
                else:
                    calc_level = RiskLevel.LOW
                    
                model_version = self.model_bundle.get("metadata", {}).get("version", model_version)
            except Exception as ex:
                print(f"Inference exception, using physics engine: {ex}")

        # Horizon probabilities estimation
        w1 = min(0.98, max(0.02, round(probability * 0.35 + (r1 / 40.0) * 0.3, 2)))
        w3 = min(0.98, max(0.04, round(probability * 0.55 + (r3 / 60.0) * 0.3, 2)))
        w6 = min(0.98, max(0.08, round(probability * 0.80 + (r6 / 80.0) * 0.2, 2)))
        w12 = min(0.99, max(0.12, round(probability * 0.92, 2)))
        w24 = min(0.99, max(0.15, round(probability * 0.98, 2)))

        if calc_level == RiskLevel.CRITICAL:
            window_text = "High probability of slope failure within 3–6 hours"
        elif calc_level == RiskLevel.HIGH:
            window_text = "Elevated risk of localized mudslides within 6–12 hours"
        elif calc_level == RiskLevel.MODERATE:
            window_text = "Watch condition: Possible slope destabilization if precipitation persists beyond 12 hours"
        else:
            window_text = "Low probability of significant slope movement within 24 hours"

        return {
            "risk_score": calc_score,
            "risk_level": calc_level,
            "probability": probability,
            "prediction_window": window_text,
            "window_1h_prob": w1,
            "window_3h_prob": w3,
            "window_6h_prob": w6,
            "window_12h_prob": w12,
            "window_24h_prob": w24,
            "contributing_factors": factors,
            "model_version": model_version,
            "is_demo_data": True
        }

ml_service = LandslideMLService()
