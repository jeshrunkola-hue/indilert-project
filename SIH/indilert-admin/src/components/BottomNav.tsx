import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Map, ShieldAlert, MessageSquareWarning, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const items = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'alerts', label: 'Alerts', icon: ShieldAlert, badge: true },
    { id: 'reports', label: 'Report', icon: MessageSquareWarning },
    { id: 'settings', label: 'Profile', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-slate-900/95 backdrop-blur border-t border-slate-800 flex items-center justify-around z-40 px-2">
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = activeTab === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setActiveTab(it.id)}
            className={`flex flex-col items-center justify-center w-full py-1 relative ${
              isActive ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{it.label}</span>
            {it.badge && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
