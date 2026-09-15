import React, { useState } from 'react';
import { api } from '../services/api';
import {
  BrainCircuit,
  Sliders,
  Play,
  TrendingUp,
  AlertOctagon,
  Clock,
  Sparkles,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export const PredictionsPage: React.FC = () => {
  const [params, setParams] = useState({
    rainfall_1h: 24.0,
    rainfall_3h: 52.0,
    rainfall_6h: 88.0,
    rainfall_24h: 140.0,
    rainfall_intensity: 24.0,
    soil_moisture: 76.0,
    slope_angle: 36.0,
    elevation: 950.0,
    historical_landslide_frequency: 4,
    distance_from_road_m: 40.0,
    previous_instability_reports: 2
  });

  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRunPredict = async () => {
    setLoading(true);
    try {
      const res = await api.predictLandslide(params);
      setPrediction(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-600 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MODERATE': return 'bg-amber-500 text-slate-900';
      case 'LOW': default: return 'bg-emerald-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h1 className="text-base font-bold text-white">AI Landslide Prediction Engine (NER-ML)</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              LIVE DATA MODEL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ensemble Random Forest & Gradient Boosting regressor trained on North Eastern Region geomorphology
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <span>Model: <strong>RandomForest-v1.2-NER</strong></span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">Accuracy: 93.2%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Feature Controls (What-If Simulator) */}
        <div className="lg:col-span-6 bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              <span>What-If Geotechnical Parameter Simulator</span>
            </h2>
            <span className="text-[11px] text-slate-400">Adjust sliders below</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* 24h Rainfall */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Cumulative 24h Rainfall:</span>
                <span className="font-bold text-white">{params.rainfall_24h} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                step="5"
                value={params.rainfall_24h}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setParams(p => ({
                    ...p,
                    rainfall_24h: val,
                    rainfall_6h: Math.round(val * 0.5),
                    rainfall_3h: Math.round(val * 0.3),
                    rainfall_1h: Math.round(val * 0.12)
                  }));
                }}
                className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* 1h Rainfall Intensity */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">1-Hour Cloudburst Intensity:</span>
                <span className="font-bold text-white">{params.rainfall_1h} mm/hr</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="2"
                value={params.rainfall_1h}
                onChange={(e) => setParams(p => ({ ...p, rainfall_1h: parseFloat(e.target.value) }))}
                className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Soil Moisture */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Soil Volumetric Moisture Content:</span>
                <span className="font-bold text-white">{params.soil_moisture}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="99"
                step="1"
                value={params.soil_moisture}
                onChange={(e) => setParams(p => ({ ...p, soil_moisture: parseFloat(e.target.value) }))}
                className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Slope Angle */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Topographical Slope Angle:</span>
                <span className="font-bold text-white">{params.slope_angle}°</span>
              </div>
              <input
                type="range"
                min="10"
                max="65"
                step="1"
                value={params.slope_angle}
                onChange={(e) => setParams(p => ({ ...p, slope_angle: parseFloat(e.target.value) }))}
                className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Elevation */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Elevation:</span>
                <span className="font-bold text-white">{params.elevation} meters</span>
              </div>
              <input
                type="range"
                min="200"
                max="3500"
                step="50"
                value={params.elevation}
                onChange={(e) => setParams(p => ({ ...p, elevation: parseFloat(e.target.value) }))}
                className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Past Landslides */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Historical Slide Recurrence:</span>
                <span className="font-bold text-white">{params.historical_landslide_frequency} events</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={params.historical_landslide_frequency}
                onChange={(e) => setParams(p => ({ ...p, historical_landslide_frequency: parseInt(e.target.value) }))}
                className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Distance from Road */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Distance from Mountain Highway Cut:</span>
                <span className="font-bold text-white">{params.distance_from_road_m} meters</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={params.distance_from_road_m}
                onChange={(e) => setParams(p => ({ ...p, distance_from_road_m: parseFloat(e.target.value) }))}
                className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Tension Cracks / Field Reports */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Reported Slope Tension Cracks:</span>
                <span className="font-bold text-white">{params.previous_instability_reports} reports</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={params.previous_instability_reports}
                onChange={(e) => setParams(p => ({ ...p, previous_instability_reports: parseInt(e.target.value) }))}
                className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleRunPredict}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-rose-950"
          >
            <Play className="w-4 h-4" />
            <span>{loading ? 'Computing AI Inference...' : 'Run Real-time AI Prediction'}</span>
          </button>
        </div>

        {/* Prediction Results Display */}
        <div className="lg:col-span-6 space-y-4">
          {prediction ? (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                    AI Inference Output
                  </span>
                  <h3 className="text-lg font-black text-white">
                    Risk Score: {prediction.risk_score} / 100
                  </h3>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${getBadgeColor(prediction.risk_level)}`}>
                  {prediction.risk_level}
                </div>
              </div>

              {/* Prediction Window (Section 8) */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Prediction Window:</span>
                </div>
                <p className="text-sm font-semibold text-white">
                  "{prediction.prediction_window}"
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Failure Probability: <strong>{(prediction.probability * 100).toFixed(0)}%</strong>
                </p>
              </div>

              {/* Time Horizon Probabilities */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                  Progression Horizon Probabilities
                </span>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">+1 Hour</span>
                    <span className="font-bold text-white">{(prediction.window_1h_prob * 100).toFixed(0)}%</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">+3 Hours</span>
                    <span className="font-bold text-amber-400">{(prediction.window_3h_prob * 100).toFixed(0)}%</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">+6 Hours</span>
                    <span className="font-bold text-orange-400">{(prediction.window_6h_prob * 100).toFixed(0)}%</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">+12 Hours</span>
                    <span className="font-bold text-rose-400">{(prediction.window_12h_prob * 100).toFixed(0)}%</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">+24 Hours</span>
                    <span className="font-bold text-rose-500">{(prediction.window_24h_prob * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Factor Contribution Bars */}
              {prediction.contributing_factors && (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <span className="font-bold text-slate-300 block mb-1 uppercase tracking-wider text-[11px]">
                    Key Influencing Geological Drivers
                  </span>
                  {Object.entries(prediction.contributing_factors).map(([k, v]: [string, any]) => (
                    <div key={k}>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="capitalize text-slate-300">{k.replace('_', ' ')}</span>
                        <span className="font-bold text-slate-200">{v.score}% ({v.rating})</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${v.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">Ready for AI Landslide Inference</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Adjust the topographical and rainfall parameters on the left and click "Run Real-time AI Prediction" to simulate slope instability probabilities.
              </p>
              <button
                onClick={handleRunPredict}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
              >
                Run Baseline Prediction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
