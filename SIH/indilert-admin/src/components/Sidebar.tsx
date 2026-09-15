import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Map,
  BrainCircuit,
  CloudRain,
  Radio,
  Mountain,
  Route,
  MessageSquareWarning,
  ShieldAlert,
  ListOrdered,
  BarChart3,
  Settings,
  AlertCircle
} from 'lucide-react';

interface NavItem {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, t, role } = useApp();

  const navItems: NavItem[] = [
    { id: 'overview', labelKey: 'overview', icon: LayoutDashboard },
    { id: 'map', labelKey: 'live_map', icon: Map },
    { id: 'predictions', labelKey: 'predictions', icon: BrainCircuit, badge: 'AI', badgeColor: 'bg-indigo-500/20 text-indigo-400' },
    { id: 'weather', labelKey: 'weather', icon: CloudRain },
    { id: 'sensors', labelKey: 'sensors', icon: Radio, badge: 'IoT', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
    { id: 'roads', labelKey: 'roads', icon: Route, badge: 'NH', badgeColor: 'bg-amber-500/20 text-amber-400' },
    { id: 'reports', labelKey: 'citizen_reports', icon: MessageSquareWarning },
    { id: 'alerts', labelKey: 'emergency_alerts', icon: ShieldAlert, badge: 'LIVE', badgeColor: 'bg-rose-500/20 text-rose-400 animate-pulse' },
    { id: 'priorities', labelKey: 'risk_prioritization', icon: ListOrdered },
    { id: 'analytics', labelKey: 'analytics', icon: BarChart3 },
    { id: 'settings', labelKey: 'settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between hidden md:flex h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="py-3 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Disaster Command Center
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{t(item.labelKey)}</span>
              </div>
              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.badgeColor || 'bg-slate-700 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

      </div>

      {/* Admin Context Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="rounded-lg p-2.5 bg-slate-800/60 border border-slate-800">
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-bold text-slate-300">Indilert Admin</span>
          </div>
          <p className="text-xs font-semibold text-emerald-400 truncate">
            Emergency Management
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Command & Control Console
          </p>
        </div>
      </div>
    </aside>
  );
};
