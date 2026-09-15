import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Road, RoadStatus } from '../types';
import { useApp } from '../context/AppContext';
import {
  Route,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Users,
  Hospital,
  Compass,
  RefreshCw,
  Edit2
} from 'lucide-react';

export const RoadConnectivityPage: React.FC = () => {
  const { refreshKey, triggerRefresh } = useApp();
  const [roads, setRoads] = useState<Road[]>([]);
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);
  const [editStatus, setEditStatus] = useState<RoadStatus>('RESTRICTED');
  const [blockageReason, setBlockageReason] = useState<string>('');
  const [altRoute, setAltRoute] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoads = async () => {
      try {
        const data = await api.getRoads();
        setRoads(data);
      } catch (err) {
        console.error('Failed to load roads:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoads();
  }, [refreshKey]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoad) return;
    try {
      await api.updateRoadStatus(selectedRoad.id, editStatus, blockageReason, altRoute);
      setSelectedRoad(null);
      triggerRefresh();
    } catch (err) {
      console.error('Failed to update road:', err);
    }
  };

  const getStatusBadge = (status: RoadStatus) => {
    switch (status) {
      case 'BLOCKED': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'PARTIALLY_BLOCKED': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'RESTRICTED': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'OPEN': default: return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    }
  };

  const blockedCount = roads.filter(r => r.status === 'BLOCKED' || r.status === 'PARTIALLY_BLOCKED').length;
  const totalIsolated = roads.reduce((sum, r) => sum + (r.isolated_population || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Route className="w-5 h-5 text-amber-400" />
            <h1 className="text-base font-bold text-white">Lifeline Mountain Highway & Road Connectivity</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              NATIONAL HIGHWAY (NH) SURVEILLANCE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitoring strategic arterial links: NH-27 (Silchar), NH-10 (Sikkim), NH-6 (Shillong), NH-29 (Nagaland)
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Blocked Corridors: </span>
            <strong className="text-rose-400">{blockedCount}</strong>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Potentially Isolated: </span>
            <strong className="text-amber-400">{totalIsolated.toLocaleString()} citizens</strong>
          </div>
        </div>
      </div>

      {/* Roads List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roads.map((road) => (
          <div
            key={road.id}
            className={`bg-slate-900 rounded-xl border p-4 space-y-3 transition ${
              road.status === 'BLOCKED' ? 'border-rose-600/50 bg-rose-950/10' :
              road.status === 'PARTIALLY_BLOCKED' ? 'border-orange-500/40 bg-orange-950/10' :
              road.status === 'RESTRICTED' ? 'border-amber-500/30' : 'border-slate-800'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-slate-800 font-mono font-bold text-white text-xs border border-slate-700">
                  {road.route_number}
                </span>
                <span className="text-xs font-semibold text-slate-300">{road.district_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadge(road.status)}`}>
                  {road.status.replace('_', ' ')}
                </span>
                <button
                  onClick={() => {
                    setSelectedRoad(road);
                    setEditStatus(road.status);
                    setBlockageReason(road.blockage_reason || '');
                    setAltRoute(road.alternative_route || '');
                  }}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                  title="Update Road Status"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="text-sm font-bold text-white leading-tight">{road.name}</h3>

            {/* Blockage Reason */}
            {road.blockage_reason && (
              <div className="bg-rose-950/40 border border-rose-800/40 rounded-lg p-2.5 text-xs text-rose-200">
                <strong className="text-rose-400 block mb-0.5">Blockage Incident:</strong>
                {road.blockage_reason}
              </div>
            )}

            {/* Alternative Detour */}
            {road.alternative_route && (
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-400 font-bold flex items-center mb-0.5">
                  <Navigation className="w-3.5 h-3.5 text-amber-400 mr-1" />
                  Recommended Alternate Detour:
                </span>
                <p className="text-slate-200 font-medium">{road.alternative_route}</p>
              </div>
            )}

            {/* Isolated Settlements & Facilities */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800 text-slate-400">
              <div>
                <span className="block text-[10px]">Affected Settlements:</span>
                <span className="font-semibold text-slate-200">
                  {road.affected_villages?.join(', ') || 'Corridor transit'}
                </span>
              </div>
              <div>
                <span className="block text-[10px]">Isolated Population:</span>
                <span className={`font-bold ${road.isolated_population > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {road.isolated_population > 0 ? `${road.isolated_population.toLocaleString()} citizens` : 'None'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {selectedRoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Update Highway Status: {selectedRoad.route_number}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{selectedRoad.name}</p>

            <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Passability Status:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as RoadStatus)}
                  className="w-full bg-slate-800 text-white rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="OPEN">Open (Full Transit)</option>
                  <option value="RESTRICTED">Restricted (Single Lane / Light Vehicles)</option>
                  <option value="PARTIALLY_BLOCKED">Partially Blocked</option>
                  <option value="BLOCKED">Blocked (Complete Suspension)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Blockage Reason / Geotechnical Hazard:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Major rockfall debris flow at km 84 approach..."
                  value={blockageReason}
                  onChange={(e) => setBlockageReason(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Alternative Detour Route:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Traffic diverted via rural bypass route..."
                  value={altRoute}
                  onChange={(e) => setAltRoute(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedRoad(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Update Highway Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
