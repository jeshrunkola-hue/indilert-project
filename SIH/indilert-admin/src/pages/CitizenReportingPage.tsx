import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { CitizenReport } from '../types';
import {
  MessageSquareWarning,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Clock,
  User,
  Sparkles,
  ExternalLink,
  ChevronDown,
  X,
  Radio,
  Image as ImageIcon
} from 'lucide-react';

type RiskFilter = 'ALL' | 'HIGH' | 'MODERATE' | 'LOW';
type SortOption = 'RISK_DESC' | 'RISK_ASC' | 'NEWEST' | 'OLDEST';

export const CitizenReportingPage: React.FC = () => {
  const { setActiveTab, refreshKey, triggerRefresh } = useApp();

  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('RISK_DESC');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports();
      setReports(data || []);
    } catch (err) {
      console.error('Failed to load citizen reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [refreshKey]);

  const handleVerify = async (reportId: number) => {
    setVerifyingId(reportId);
    try {
      await api.verifyReport(reportId);
      // Update local state
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, is_verified: true, status: 'VERIFIED' } : r))
      );
    } catch (err) {
      console.error('Failed to verify report:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  // Severity scoring for sorting
  const severityScore = (sev?: string) => {
    const s = sev?.toUpperCase();
    if (s === 'CRITICAL') return 4;
    if (s === 'HIGH') return 3;
    if (s === 'MODERATE') return 2;
    if (s === 'LOW') return 1;
    return 0;
  };

  // Counts for top cards
  const totalCount = reports.length;
  const highCount = reports.filter((r) => {
    const s = r.severity?.toUpperCase();
    return s === 'CRITICAL' || s === 'HIGH';
  }).length;
  const modCount = reports.filter((r) => r.severity?.toUpperCase() === 'MODERATE').length;
  const lowCount = reports.filter((r) => r.severity?.toUpperCase() === 'LOW').length;

  // Filter & Search
  const filteredReports = reports
    .filter((r) => {
      const sev = r.severity?.toUpperCase();
      if (riskFilter === 'HIGH') {
        if (sev !== 'CRITICAL' && sev !== 'HIGH') return false;
      } else if (riskFilter === 'MODERATE') {
        if (sev !== 'MODERATE') return false;
      } else if (riskFilter === 'LOW') {
        if (sev !== 'LOW') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = r.description?.toLowerCase().includes(q);
        const matchesDistrict = r.district_name?.toLowerCase().includes(q);
        const matchesReporter = r.reporter_name?.toLowerCase().includes(q);
        const matchesType = r.report_type?.toLowerCase().includes(q);
        return matchesDesc || matchesDistrict || matchesReporter || matchesType;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'RISK_DESC') {
        return severityScore(b.severity) - severityScore(a.severity);
      }
      if (sortOption === 'RISK_ASC') {
        return severityScore(a.severity) - severityScore(b.severity);
      }
      if (sortOption === 'NEWEST') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortOption === 'OLDEST') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return 0;
    });

  const formatTimeAgo = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <MessageSquareWarning className="w-4 h-4 text-emerald-400" />
            </div>
            <h1 className="text-base font-bold text-white">Citizen Hazard Reports</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider uppercase">
              Indilert Feed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Incoming crowdsourced geohazard photos, damage reports, and observations uploaded by citizens from the Indilert app.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              triggerRefresh();
              fetchReports();
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setRiskFilter('ALL')}
          className={`p-3 rounded-xl border transition cursor-pointer ${
            riskFilter === 'ALL'
              ? 'bg-slate-800 border-slate-600 shadow-md'
              : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/50'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Reports</div>
          <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
          <span className="text-[10px] text-slate-500">From Indilert Citizens</span>
        </div>

        <div
          onClick={() => setRiskFilter('HIGH')}
          className={`p-3 rounded-xl border transition cursor-pointer ${
            riskFilter === 'HIGH'
              ? 'bg-rose-950/40 border-rose-500 shadow-md'
              : 'bg-rose-950/20 border-rose-900/50 hover:bg-rose-950/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-rose-400 uppercase tracking-wider">High Risk</span>
            {highCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
          </div>
          <div className="text-2xl font-black text-rose-200 mt-1">{highCount}</div>
          <span className="text-[10px] text-rose-400/80">Critical Attention Required</span>
        </div>

        <div
          onClick={() => setRiskFilter('MODERATE')}
          className={`p-3 rounded-xl border transition cursor-pointer ${
            riskFilter === 'MODERATE'
              ? 'bg-amber-950/40 border-amber-500 shadow-md'
              : 'bg-amber-950/20 border-amber-900/50 hover:bg-amber-950/30'
          }`}
        >
          <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider">Moderate Risk</div>
          <div className="text-2xl font-black text-amber-200 mt-1">{modCount}</div>
          <span className="text-[10px] text-amber-400/80">Active Patrol & Monitor</span>
        </div>

        <div
          onClick={() => setRiskFilter('LOW')}
          className={`p-3 rounded-xl border transition cursor-pointer ${
            riskFilter === 'LOW'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
              : 'bg-emerald-950/20 border-emerald-900/50 hover:bg-emerald-950/30'
          }`}
        >
          <div className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">Low Risk</div>
          <div className="text-2xl font-black text-emerald-200 mt-1">{lowCount}</div>
          <span className="text-[10px] text-emerald-400/80">Informational Logs</span>
        </div>
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Risk Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" />
            Filter Risk:
          </span>
          <button
            onClick={() => setRiskFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              riskFilter === 'ALL'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setRiskFilter('HIGH')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
              riskFilter === 'HIGH'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-950/30 text-rose-400 hover:bg-rose-900/40 border border-rose-800/40'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>High Risk ({highCount})</span>
          </button>
          <button
            onClick={() => setRiskFilter('MODERATE')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
              riskFilter === 'MODERATE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-950/30 text-amber-400 hover:bg-amber-900/40 border border-amber-800/40'
            }`}
          >
            <span>Moderate Risk ({modCount})</span>
          </button>
          <button
            onClick={() => setRiskFilter('LOW')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
              riskFilter === 'LOW'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-800/40'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Low Risk ({lowCount})</span>
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
            >
              <option value="RISK_DESC">Sort: High Risk First</option>
              <option value="RISK_ASC">Sort: Low Risk First</option>
              <option value="NEWEST">Sort: Newest First</option>
              <option value="OLDEST">Sort: Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Feed */}
      {loading ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-2" />
          <p className="text-slate-400 text-sm font-medium">Loading citizen reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <MessageSquareWarning className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Citizen Reports Found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            {riskFilter !== 'ALL'
              ? `No reports match the "${riskFilter} RISK" filter. Try switching to "All Reports".`
              : 'Citizen reports submitted via Indilert will appear here automatically in real time.'}
          </p>
          {riskFilter !== 'ALL' && (
            <button
              onClick={() => setRiskFilter('ALL')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition border border-slate-700"
            >
              Show All Reports
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const sev = report.severity?.toUpperCase();
            const isCritical = sev === 'CRITICAL';
            const isHigh = sev === 'HIGH';
            const isModerate = sev === 'MODERATE';
            const isLow = sev === 'LOW';

            return (
              <div
                key={report.id}
                className={`bg-slate-900 rounded-xl border p-4 flex flex-col justify-between space-y-3 shadow-md transition ${
                  isCritical
                    ? 'border-rose-600/60 bg-gradient-to-b from-rose-950/20 to-slate-900'
                    : isHigh
                    ? 'border-orange-600/40 bg-gradient-to-b from-orange-950/15 to-slate-900'
                    : isModerate
                    ? 'border-amber-600/40 bg-gradient-to-b from-amber-950/15 to-slate-900'
                    : 'border-emerald-600/30'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Hazard Type */}
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-slate-800 text-slate-200 border border-slate-700">
                      {report.report_type?.replace(/_/g, ' ') || 'HAZARD'}
                    </span>

                    {/* Risk Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 ${
                        isCritical
                          ? 'bg-rose-600 text-white shadow-xs'
                          : isHigh
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isModerate
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isCritical || isHigh ? (
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                      ) : isLow ? (
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      ) : null}
                      <span>{sev || 'MODERATE'} RISK</span>
                    </span>

                    {/* Verification Status */}
                    {report.is_verified ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        Pending Verification
                      </span>
                    )}
                  </div>

                  {/* Time ago */}
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1 whitespace-nowrap">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{formatTimeAgo(report.created_at)}</span>
                  </span>
                </div>

                {/* Location & Reporter Info */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 bg-slate-950/60 rounded-lg p-2 border border-slate-800/80 gap-2">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="font-bold text-white">{report.district_name}</span>
                    <span className="text-slate-500 text-[11px] font-mono">
                      ({report.latitude.toFixed(3)}, {report.longitude.toFixed(3)})
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                    <User className="w-3 h-3 text-slate-500" />
                    <span className="font-medium text-slate-300">{report.reporter_name}</span>
                    <span className="text-[10px] text-emerald-400/80">(Indilert)</span>
                  </div>
                </div>

                {/* Observation / Description */}
                <div>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                    "{report.description}"
                  </p>
                </div>

                {/* Media Gallery (Photos / Videos) */}
                {report.media_urls && report.media_urls.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                      <ImageIcon className="w-3 h-3 text-slate-500" />
                      <span>Citizen Uploaded Media ({report.media_urls.length})</span>
                    </span>
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {report.media_urls.map((url, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedPhoto(url)}
                          className="relative w-24 h-20 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0 cursor-pointer group hover:border-emerald-500 transition"
                        >
                          <img
                            src={url}
                            alt={`Hazard evidence ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <span className="text-[10px] text-white font-bold bg-black/60 px-1.5 py-0.5 rounded">
                              Enlarge
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Geological Assessment */}
                {report.ai_assessed_type && (
                  <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-400 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>AI Geotechnical Assessment:</span>
                      </span>
                      {report.ai_confidence && (
                        <span className="text-[10px] font-mono text-slate-400">
                          Confidence: {Math.round(report.ai_confidence * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">{report.ai_assessed_type}</p>
                    {report.ai_recommended_action && (
                      <p className="text-[11px] text-amber-300/90 font-medium">
                        👉 Action: {report.ai_recommended_action}
                      </p>
                    )}
                  </div>
                )}

                {/* Admin Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center space-x-2">
                    {!report.is_verified && (
                      <button
                        onClick={() => handleVerify(report.id)}
                        disabled={verifyingId === report.id}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition flex items-center space-x-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{verifyingId === report.id ? 'Verifying...' : 'Verify Report'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('map')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition flex items-center space-x-1 border border-slate-700"
                    >
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>Locate on Map</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-bold transition flex items-center space-x-1"
                  >
                    <span>Issue Public Alert</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Enlarge Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-slate-900 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-700 flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Hazard Evidence Inspection</span>
              </span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={selectedPhoto}
                alt="Enlarged hazard photo"
                className="max-h-[68vh] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
