import React from 'react';
import { useApp } from '../context/AppContext';
import { LANGUAGES, SupportedLanguage } from '../i18n/translations';
import { Shield, Wifi, WifiOff, Globe, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    isOnline,
    setActiveTab
  } = useApp();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Brand, Admin Indicator & Online Status */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-950/50">
          <Shield className="w-6 h-6 text-white" fill="currentColor" />
        </div>
        <div>
          <div className="flex items-baseline space-x-2">
            <span className="font-black text-xl tracking-wider text-white">Indilert</span>
          </div>
          <p className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase -mt-0.5">
            Admin
          </p>
        </div>

        {/* Connectivity status beside logo */}
        <div className={`ml-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-rose-400" />}
          <span className="hidden sm:inline">{isOnline ? 'Online (Real-time)' : 'Offline'}</span>
        </div>
      </div>

      {/* Right: Language & Notification Bell */}
      <div className="flex items-center space-x-3">
        {/* 11-Language Selector */}
        <div className="relative flex items-center">
          <Globe className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>

        {/* Quick notification link */}
        <button
          onClick={() => setActiveTab('alerts')}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 relative"
          title="Emergency Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
        </button>
      </div>
    </header>
  );
};
