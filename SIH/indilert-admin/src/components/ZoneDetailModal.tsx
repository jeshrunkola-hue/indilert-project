import React from 'react';
import { useApp } from '../context/AppContext';
import { Zone, Road, Village, Infrastructure } from '../types';
import {
  X,
  MapPin,
  TrendingUp,
  BrainCircuit,
  Droplets,
  Mountain,
  Compass,
  AlertTriangle,
  Route,
  Hospital,
  Home,
  CheckCircle2,
  Send
} from 'lucide-react';

interface ZoneDetailModalProps {
  zone: Zone | null;
  onClose: () => void;
  roads: Road[];
  villages: Village[];
  infrastructure: Infrastructure[];
}

export const ZoneDetailModal: React.FC<ZoneDetailModalProps> = ({
  zone,
  onClose,
  roads,
  villages,
  infrastructure
}) => {
  const { setActiveTab } = useApp();

  if (!zone) return null;

  const districtRoads = roads.filter(r => r.district_id === zone.district_id);
  const districtVillages = villages.filter(v => v.district_id === zone.district_id);
  const districtInfra = infrastructure.filter(i => i.district_id === zone.district_id);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-600 text-white shadow-lg shadow-rose-950';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MODERATE': return 'bg-amber-500 text-slate-900';
      case 'LOW': default: return 'bg-emerald-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${getRiskBadge(zone.current_risk_level)}`}>
              {zone.current_risk_level} ({zone.current_risk_score}%)
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">{zone.name}</h2>
              <p className="text-xs text-slate-400 flex items-center mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 mr-1" />
                {zone.district_name}, North Eastern Region
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* AI Early Warning Banner */}
          <div className="bg-gradient-to-r from-rose-950/40 to-slate-900 p-3.5 rounded-xl border border-rose-800/40">
            <div className="flex items-center space-x-2 text-rose-400 font-bold mb-1">
              <BrainCircuit className="w-4 h-4" />
              <span>AI Prediction Engine Assessment</span>
            </div>
            <p className="text-slate-200 text-xs font-medium">
              {zone.ai_prediction_summary || "Continuous high pore-water saturation indicates elevated potential for debris flow along steep hill cuts."}
            </p>
          </div>

          {/* Transparent Contributing Factors Progress Bars */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-800">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Transparent Risk Factor Breakdown
              </span>
              <span className="text-[10px] text-slate-400">Configurable SDMA Weights</span>
            </div>

            {zone.contributing_factors ? (
              <div className="space-y-2.5">
                {Object.entries(zone.contributing_factors).map(([key, val]: [string, any]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="capitalize text-slate-300 font-medium">
                        {key.replace('_', ' ')} ({val.weight_percent}%)
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">{val.raw_value}</span>
                        <span className={`font-bold ${
                          val.rating === 'Very High' ? 'text-rose-400' :
                          val.rating === 'High' ? 'text-orange-400' :
                          val.rating === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {val.rating}
                        </span>
                      </div>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          val.score >= 80 ? 'bg-rose-500' :
                          val.score >= 60 ? 'bg-orange-500' :
                          val.score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, val.score))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">Loading risk breakdown...</p>
            )}
          </div>

          {/* Geological & Hydrological Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">24h Rainfall</span>
              <span className="font-bold text-white text-sm mt-0.5 block">{zone.rainfall_24h} mm</span>
              <span className="text-[10px] text-slate-400">Forecast: {zone.forecast_rainfall_24h} mm</span>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Soil Saturation</span>
              <span className="font-bold text-white text-sm mt-0.5 block">{zone.soil_moisture}%</span>
              <span className="text-[10px] text-slate-400">TDR Sensor Probe</span>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Slope Angle</span>
              <span className="font-bold text-white text-sm mt-0.5 block">{zone.slope_angle}°</span>
              <span className="text-[10px] text-slate-400">Elev: {zone.elevation} m</span>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Past Slides</span>
              <span className="font-bold text-white text-sm mt-0.5 block">{zone.historical_incidents_count}</span>
              <span className="text-[10px] text-slate-400">{zone.recent_field_reports_count} new field alerts</span>
            </div>
          </div>

          {/* Geomorphology details */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400">
              <strong className="text-slate-200">Lithological Bedrock:</strong> {zone.terrain_type}
            </div>
            <div className="text-slate-400">
              <strong className="text-slate-200">Vegetation Canopy / Land Cover:</strong> {zone.land_cover}
            </div>
          </div>

          {/* Nearby Critical Infrastructure & Villages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5 font-bold text-slate-200 mb-2">
                <Route className="w-3.5 h-3.5 text-amber-400" />
                <span>Nearby Highway Corridors</span>
              </div>
              <div className="space-y-1.5">
                {districtRoads.slice(0, 3).map(r => (
                  <div key={r.id} className="flex items-center justify-between text-[11px] bg-slate-900 p-1.5 rounded">
                    <span className="font-semibold text-slate-300">{r.route_number}</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold ${
                      r.status === 'BLOCKED' ? 'bg-rose-500/20 text-rose-400' :
                      r.status === 'RESTRICTED' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5 font-bold text-slate-200 mb-2">
                <Home className="w-3.5 h-3.5 text-indigo-400" />
                <span>At-Risk Villages & Population</span>
              </div>
              <div className="space-y-1.5">
                {districtVillages.slice(0, 3).map(v => (
                  <div key={v.id} className="flex items-center justify-between text-[11px] bg-slate-900 p-1.5 rounded">
                    <span className="text-slate-300">{v.name}</span>
                    <span className="text-slate-400">{v.population} residents</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Authority Action */}
          <div className="bg-amber-950/30 border border-amber-500/40 p-3 rounded-xl">
            <span className="font-bold text-amber-300 block mb-1">Recommended Response Protocol:</span>
            <p className="text-amber-100 text-xs">
              {zone.current_risk_level === 'CRITICAL'
                ? "Immediate traffic diversion from vulnerable slope cuts, deployment of SDRF earthmovers to strategic staging areas, and alert issuance to village heads."
                : "Continuous hourly monitoring of geotechnical sensor telemetry and active patrol on mountain pass curves."}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => {
              onClose();
              setActiveTab('alerts');
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-950"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Issue Emergency Warning</span>
          </button>
          <button
            onClick={() => {
              onClose();
              setActiveTab('priorities');
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>View in Prioritization Queue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
