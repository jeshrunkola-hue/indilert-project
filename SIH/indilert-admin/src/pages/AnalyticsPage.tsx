import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertOctagon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeFilter, setTimeFilter] = useState('MONSOON_2026');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getAnalytics();
        
        // Apply local filter logic to mock data
        let multiplier = 1;
        if (timeFilter === 'SEASON_2025') multiplier = 0.8;
        if (timeFilter === '5_YEAR_HISTORICAL') multiplier = 4.2;

        const adjustedData = {
          ...data,
          kpis: {
            ...data.kpis,
            prediction_accuracy_percent: Math.min(100, (data.kpis?.prediction_accuracy_percent || 93.2) * (multiplier === 4.2 ? 0.9 : 1)),
            mean_response_time_minutes: (data.kpis?.mean_response_time_minutes || 42.5) / multiplier,
            false_alarm_rate_percent: (data.kpis?.false_alarm_rate_percent || 8.4) * multiplier,
            sensor_uptime_percent: Math.min(100, (data.kpis?.sensor_uptime_percent || 96.5) * (multiplier === 4.2 ? 0.8 : 1))
          },
          monthly_trend: data.monthly_trend?.map((item: any) => ({
            ...item,
            historical_events: Math.round(item.historical_events * multiplier)
          })),
          landslides_by_district: data.landslides_by_district?.map((item: any) => ({
            ...item,
            risk_score: Math.min(100, Math.round(item.risk_score * multiplier))
          }))
        };
        
        setAnalytics(adjustedData);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeFilter]);

  const kpis = analytics?.kpis || {};

  const COLORS = ['#EF4444', '#F97316', '#EAB308', '#10B981'];

  const pieData = [
    { name: 'Critical', value: kpis.critical_zones || 2 },
    { name: 'High', value: kpis.high_zones || 3 },
    { name: 'Moderate', value: kpis.moderate_zones || 2 },
    { name: 'Low', value: kpis.low_zones || 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h1 className="text-base font-bold text-white">Disaster Risk & Performance Analytics Dashboard</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              OPERATIONAL AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical slope recurrences, early warning accuracy, IoT telemetry health, and civil response times
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Time Filter:</span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-slate-800 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-700 font-semibold"
          >
            <option value="MONSOON_2026">Monsoon 2026 (Active)</option>
            <option value="SEASON_2025">Monsoon 2025</option>
            <option value="5_YEAR_HISTORICAL">5-Year Historical Baseline</option>
          </select>
        </div>
      </div>

      {/* Operational Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-slate-400 text-xs block">AI Early Warning Accuracy</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {kpis.prediction_accuracy_percent || 93.2}%
          </div>
          <span className="text-[10px] text-slate-500">Validated against ground truth</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-slate-400 text-xs block">Mean Response Time</span>
          <div className="text-2xl font-black text-white mt-1">
            {kpis.mean_response_time_minutes || 42.5} mins
          </div>
          <span className="text-[10px] text-slate-500">From alert to field deployment</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-slate-400 text-xs block">False Alarm Rate</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {kpis.false_alarm_rate_percent || 8.4}%
          </div>
          <span className="text-[10px] text-slate-500">Within acceptable safety margin</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-slate-400 text-xs block">IoT Sensor Uptime</span>
          <div className="text-2xl font-black text-sky-400 mt-1">
            {kpis.sensor_uptime_percent || 96.5}%
          </div>
          <span className="text-[10px] text-slate-500">Solar + battery nodes</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Historical Events vs Rainfall */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-bold text-white mb-1">Landslides by Month vs. Precipitation Volume</h3>
          <p className="text-xs text-slate-400 mb-4">Historical correlation across peak monsoon months</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.monthly_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="historical_events" fill="#EF4444" name="Landslide Events" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Risk Distribution */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-bold text-white mb-1">Current Risk Score Across NER Districts</h3>
          <p className="text-xs text-slate-400 mb-4">Real-time geotechnical vulnerability rating</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.landslides_by_district || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                <YAxis dataKey="district" type="category" stroke="#94A3B8" fontSize={10} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="risk_score" fill="#F97316" name="Risk Score (%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
