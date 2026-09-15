import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { District, Zone, Road, Sensor, Incident, Alert } from '../types';
import { NERMap } from '../maps/NERMap';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Radio,
  Route,
  ShieldAlert,
  TrendingUp,
  CloudRain,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const OverviewDashboard: React.FC = () => {
  const { t, setSelectedZone, setActiveTab, refreshKey } = useApp();

  const [districts, setDistricts] = useState<District[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [roads, setRoads] = useState<Road[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dList, zList, rList, sList, iList, aList, aData] = await Promise.all([
          api.getDistricts(),
          api.getZones(),
          api.getRoads(),
          api.getSensors(),
          api.getIncidents(),
          api.getAlerts(),
          api.getAnalytics()
        ]);
        setDistricts(dList);
        setZones(zList);
        setRoads(rList);
        setSensors(sList);
        setIncidents(iList);
        setAlerts(aList);
        setAnalytics(aData);
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  // KPI Calculations
  const criticalZones = zones.filter(z => z.current_risk_level === 'CRITICAL').length;
  const highZones = zones.filter(z => z.current_risk_level === 'HIGH').length;
  const modZones = zones.filter(z => z.current_risk_level === 'MODERATE').length;
  const lowZones = zones.filter(z => z.current_risk_level === 'LOW').length;
  const blockedRoads = roads.filter(r => r.status === 'BLOCKED' || r.status === 'PARTIALLY_BLOCKED').length;
  const activeSensors = sensors.filter(s => s.status !== 'OFFLINE').length;
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Emergency Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <span>NER Landslide Disaster Command & Early Warning System</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geohazard telemetry across Assam, Meghalaya, Sikkim, Nagaland, Arunachal, Mizoram, Manipur, and Tripura
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('map')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center space-x-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Full GIS Map</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (Section 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Critical */}
        <div className="bg-rose-950/30 border border-rose-600/40 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-400">Critical Zones</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-2xl font-black text-white mt-1">{criticalZones}</div>
          <span className="text-[10px] text-rose-300">Immediate Action</span>
        </div>

        {/* High */}
        <div className="bg-orange-950/30 border border-orange-600/40 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-orange-400">High Risk</span>
          <div className="text-2xl font-black text-white mt-1">{highZones}</div>
          <span className="text-[10px] text-orange-300">Warning Active</span>
        </div>

        {/* Moderate */}
        <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-amber-400">Moderate</span>
          <div className="text-2xl font-black text-white mt-1">{modZones}</div>
          <span className="text-[10px] text-amber-300">Active Vigil</span>
        </div>

        {/* Low */}
        <div className="bg-emerald-950/30 border border-emerald-600/40 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-emerald-400">Low Risk</span>
          <div className="text-2xl font-black text-white mt-1">{lowZones}</div>
          <span className="text-[10px] text-emerald-300">Normal Range</span>
        </div>

        {/* Active Incidents */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-300">Active Incidents</span>
          <div className="text-2xl font-black text-white mt-1">{activeIncidents}</div>
          <span className="text-[10px] text-rose-400">Response Deployed</span>
        </div>

        {/* Blocked Roads */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-300">Blocked Roads</span>
          <div className="text-2xl font-black text-white mt-1">{blockedRoads}</div>
          <span className="text-[10px] text-amber-400">Detours Active</span>
        </div>

        {/* Active Sensors */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-300">Active Sensors</span>
          <div className="text-2xl font-black text-white mt-1">{activeSensors}/{sensors.length}</div>
          <span className="text-[10px] text-emerald-400">96.5% Uptime</span>
        </div>

        {/* Alerts Sent */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-300">Alerts Sent</span>
          <div className="text-2xl font-black text-white mt-1">{alerts.length}</div>
          <span className="text-[10px] text-indigo-400">CAP Broadcast</span>
        </div>
      </div>

      {/* Main Interactive GIS Map Component */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              North Eastern Regional Live Risk GIS
            </h2>
            <span className="text-xs text-slate-400">
              (Interactive click inspection enabled)
            </span>
          </div>
          <button
            onClick={() => setActiveTab('map')}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center space-x-1"
          >
            <span>Expand Full Screen</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <NERMap
          districts={districts}
          zones={zones}
          roads={roads}
          sensors={sensors}
          reports={[]}
          infrastructure={[]}
          onSelectZone={(z) => setSelectedZone(z)}
        />
      </div>

      {/* Analytical Charts Row (Section 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rainfall vs Landslide Risk Correlation */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Rainfall Intensity vs. Landslide Risk</h3>
              <p className="text-xs text-slate-400">Historical precipitation saturation threshold curve in NER</p>
            </div>
            <CloudRain className="w-4 h-4 text-sky-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.rainfall_vs_risk || []}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="rainfall_bin" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="avg_risk" stroke="#EF4444" fillOpacity={1} fill="url(#riskGrad)" name="Avg Risk (%)" />
                <Line type="monotone" dataKey="historical_events" stroke="#38BDF8" strokeWidth={2} name="Past Slide Count" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Horizon Risk Trend */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Multi-Horizon Landslide Risk Trend</h3>
              <p className="text-xs text-slate-400">Next 1h, 3h, 6h, 12h, and 24h AI prediction progression</p>
            </div>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.risk_trend_horizons || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="horizon" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[40, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="avg_risk" stroke="#F59E0B" strokeWidth={3} dot={{ r: 5 }} name="Projected Risk (%)" />
                <Line type="stepAfter" dataKey="critical_zones" stroke="#EF4444" strokeWidth={2} name="Critical Zones Count" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: District Risk Ranking & Recent Incidents (Section 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* District Risk Ranking */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">NER District Vulnerability Ranking</h3>
            <span className="text-xs text-slate-400">Ordered by current geotechnical risk</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Rank</th>
                  <th className="py-2 px-3">District & State</th>
                  <th className="py-2 px-3">Risk Level</th>
                  <th className="py-2 px-3">Score</th>
                  <th className="py-2 px-3">Roads Blocked</th>
                  <th className="py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {districts.slice(0, 6).map((d, idx) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-300">#{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white">{d.name}</div>
                      <div className="text-[10px] text-slate-400">{d.state}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.current_risk_level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        d.current_risk_level === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        d.current_risk_level === 'MODERATE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {d.current_risk_level}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-200">{d.current_risk_score}%</td>
                    <td className="py-2.5 px-3 text-slate-300">{d.blocked_roads_count}</td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => {
                          const z = zones.find(zn => zn.district_name === d.name);
                          if (z) setSelectedZone(z);
                          else setActiveTab('map');
                        }}
                        className="text-rose-400 hover:text-rose-300 font-bold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Incidents Feed */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Recent Citizen Reports</h3>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
            >
              View All Reports
            </button>
          </div>
          <div className="space-y-2.5">
            {incidents.slice(0, 4).map((inc) => (
              <div key={inc.id} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">{inc.title}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      inc.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {inc.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{inc.description}</p>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1">
                    <span>District: <strong>{inc.district_name}</strong></span>
                    <span>Status: <strong className="text-amber-400">{inc.status}</strong></span>
                    {inc.assigned_team && <span>Team: {inc.assigned_team}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
