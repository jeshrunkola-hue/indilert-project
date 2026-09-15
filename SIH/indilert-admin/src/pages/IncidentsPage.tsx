import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Incident, AuditLog } from '../types';
import { useApp } from '../context/AppContext';
import {
  Mountain,
  CheckCircle2,
  Clock,
  History,
  AlertCircle,
  MapPin,
  Shield,
  Search,
  Filter,
  UserCheck
} from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const { refreshKey, triggerRefresh, role } = useApp();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [newStatus, setNewStatus] = useState<string>('VERIFIED');
  const [notes, setNotes] = useState<string>('');
  const [assignedTeam, setAssignedTeam] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [iData, aData] = await Promise.all([
          api.getIncidents(),
          api.getAuditLogs()
        ]);
        setIncidents(iData);
        setAuditLogs(aData);
      } catch (err) {
        console.error('Failed to load incidents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    try {
      await api.updateIncidentStatus(selectedIncident.id, newStatus, notes, assignedTeam);
      setSelectedIncident(null);
      setNotes('');
      triggerRefresh();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'RESPONSE_STARTED': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold';
      case 'UNDER_INVESTIGATION': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'VERIFIED': return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
      case 'REPORTED': default: return 'bg-slate-700 text-slate-300 border border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Mountain className="w-5 h-5 text-rose-500" />
            <h1 className="text-base font-bold text-white">Landslide Incident Lifecycle Management</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              AUDIT TRAIL LOGGED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking verified slope failures, quick response force deployments, and SDRF clearance
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <span>Lifecycle:</span>
          <span className="font-mono text-amber-400 font-bold">
            Reported → Verified → Under Investigation → Response Started → Resolved
          </span>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Active Incident Log</h2>
          <span className="text-xs text-slate-400">{incidents.length} recorded events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">District / Zone</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-300">#{inc.id}</td>
                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-bold text-white text-xs">{inc.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{inc.description}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{inc.district_name}</div>
                    <div className="text-[10px] text-slate-400">{inc.zone_name || 'Corridor'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadge(inc.status)}`}>
                      {inc.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {inc.assigned_team || <span className="text-slate-500 italic">Unassigned</span>}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        setSelectedIncident(inc);
                        setNewStatus(inc.status);
                        setAssignedTeam(inc.assigned_team || '');
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-white font-bold transition border border-slate-700"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Immutable Decision & Status Audit Trail</h3>
          </div>
          <span className="text-xs text-slate-400">Section 22 Compliance</span>
        </div>

        <div className="space-y-2.5 max-h-64 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-start justify-between text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-200">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({log.entity_type} #{log.entity_id})</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Changed from <strong className="text-amber-400">{log.old_state}</strong> → <strong className="text-emerald-400">{log.new_state}</strong>
                </p>
                {log.notes && <p className="text-[10px] text-slate-400 italic">"{log.notes}"</p>}
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <span className="block font-semibold text-slate-300">{log.changed_by} ({log.user_role})</span>
                <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Status Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Update Incident Lifecycle #{selectedIncident.id}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{selectedIncident.title}</p>

            <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Status Workflow Stage:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="REPORTED">Reported</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="UNDER_INVESTIGATION">Under Investigation</option>
                  <option value="RESPONSE_STARTED">Response Started</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Disaster Response Unit:</label>
                <input
                  type="text"
                  placeholder="e.g. BRO Project Swastik / NDRF 1st Bn"
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Operational Field Notes / Log:</label>
                <textarea
                  rows={3}
                  placeholder="Details of machinery deployed, route clearance ETA, or evacuation status..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-950"
                >
                  Record State Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
