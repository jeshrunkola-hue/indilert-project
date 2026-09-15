import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PriorityItem } from '../types';
import { useApp } from '../context/AppContext';
import {
  ListOrdered,
  AlertOctagon,
  Users,
  Route,
  Clock,
  Hospital,
  ShieldCheck,
  Send,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export const ResponsePrioritizationPage: React.FC = () => {
  const { refreshKey, triggerRefresh, setActiveTab } = useApp();
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriorities = async () => {
      try {
        const data = await api.getPriorities();
        setPriorities(data);
      } catch (err) {
        console.error('Failed to load priorities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPriorities();
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <ListOrdered className="w-5 h-5 text-amber-400" />
            <h1 className="text-base font-bold text-white">Risk Prioritization</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              ALGORITHMIC RISK RANKING
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic tactical scoring factoring risk probability, vulnerable population density, lifeline highway cutoffs, and critical health assets
          </p>
        </div>

        <button
          onClick={triggerRefresh}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Recompute Priority Ranks</span>
        </button>
      </div>

      {/* Ranked Queue Cards */}
      <div className="space-y-4">
        {priorities.map((item) => (
          <div
            key={item.zone_id}
            className={`bg-slate-900 rounded-xl border p-5 space-y-4 transition ${
              item.rank === 1 ? 'border-rose-600/70 bg-gradient-to-r from-rose-950/20 to-slate-900 shadow-lg shadow-rose-950/40' :
              item.rank <= 3 ? 'border-orange-500/40' : 'border-slate-800'
            }`}
          >
            {/* Top Rank Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                  item.rank === 1 ? 'bg-rose-600 text-white shadow-md shadow-rose-950' :
                  item.rank <= 3 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  #{item.rank}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{item.zone_name}</h3>
                    <span className="text-xs text-slate-400 font-semibold">• {item.district_name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Composite Priority Index: <strong className="text-amber-400">{item.priority_score} / 100</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                  item.risk_level === 'CRITICAL' ? 'bg-rose-600 text-white' :
                  item.risk_level === 'HIGH' ? 'bg-orange-500 text-white' :
                  item.risk_level === 'MODERATE' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'
                }`}>
                  Risk: {item.risk_level} ({item.risk_score}%)
                </span>
              </div>
            </div>

            {/* Assessment Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] flex items-center mb-0.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400 mr-1" />
                  Population at Risk:
                </span>
                <strong className="text-white text-sm">{item.population_affected.toLocaleString()}</strong>
                <span className="text-[10px] text-slate-500 block">Villages in perimeter</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] flex items-center mb-0.5">
                  <Route className="w-3.5 h-3.5 text-amber-400 mr-1" />
                  Key Highway Corridor:
                </span>
                <strong className={`text-sm ${item.has_blocked_road ? 'text-rose-400' : 'text-slate-200'}`}>
                  {item.key_corridor}
                </strong>
                <span className="text-[10px] text-slate-500 block">{item.has_blocked_road ? 'Severed route' : 'Transit monitored'}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] flex items-center mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-rose-400 mr-1" />
                  Expected Window:
                </span>
                <strong className="text-amber-300 text-sm">{item.expected_window}</strong>
                <span className="text-[10px] text-slate-500 block">Immediacy factor</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] flex items-center mb-0.5">
                  <Hospital className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                  Critical Facilities:
                </span>
                <strong className="text-white text-sm">{item.nearby_critical_facilities.length} Assets</strong>
                <span className="text-[10px] text-slate-500 block">Hospitals / Sub-stations</span>
              </div>
            </div>

            {/* Recommended Action Checklist */}
            <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-lg text-xs">
              <span className="font-bold text-amber-300 block mb-1">
                AI Recommended Operational Directive:
              </span>
              <p className="text-amber-100 font-medium">
                {item.recommended_action}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-1">
              <button
                onClick={() => setActiveTab('alerts')}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md shadow-rose-950 flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Issue Alert for #{item.rank}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
