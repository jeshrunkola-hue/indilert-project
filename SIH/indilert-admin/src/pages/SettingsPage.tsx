import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BACKEND_URL } from '../services/api';
import {
  Settings,
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Lock,
  Server,
  Key,
  Database,
  Radio,
  Clock,
  BadgeCheck,
  Fingerprint,
  RefreshCcw,
  X,
  UserCircle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { role, isOnline } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Title Bar */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <Shield className="w-6 h-6 text-indigo-400" />
            <span>Admin Console Settings</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Configure telemetry nodes, simulation bounds, and API integrations.</p>
        </div>
        <button 
          onClick={() => setShowLoginModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl flex items-center space-x-2 text-sm transition shadow-lg"
        >
          <UserCircle className="w-4 h-4" />
          <span>Admin Login</span>
        </button>
      </div>

      {/* Admin Profile Overview Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-4">
            {/* Avatar with Shield & Status */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-0.5 shadow-xl shadow-emerald-950/40 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Shield className="w-10 h-10 text-emerald-400" fill="currentColor" fillOpacity={0.2} />
                </div>
              </div>
              <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                isOnline ? 'bg-emerald-500' : 'bg-rose-500'
              }`} title={isOnline ? 'Active Online' : 'Offline'}>
                <span className="w-2 h-2 rounded-full bg-white" />
              </span>
            </div>

            {/* Profile Core Info */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-wide">SDMA Incident Commander</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  VERIFIED ADMIN
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-400">
                Senior Disaster Response Officer • Level 1 Clearances
              </p>
              <p className="text-[11px] text-slate-400">
                State Disaster Management Authority (SDMA) & NDMA NER Division
              </p>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <span className="text-slate-500 text-[10px] block">Official Officer ID</span>
              <span className="font-mono font-bold text-white">IND-ADM-NER-78401</span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <span className="text-slate-500 text-[10px] block">Session Protocol</span>
              <span className="font-mono font-bold text-emerald-400">VAPID-AES-256 (Active)</span>
            </div>
          </div>
        </div>

        {/* Admin Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>Official Emergency Email</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-sm">admin@indilert.gov.in</span>
              <span className="text-[10px] bg-sky-500/10 text-sky-400 font-bold px-2 py-0.5 rounded border border-sky-500/20">
                Secured Gov Domain
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Emergency Control Room Hotline</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-sm font-mono">+91 364 222 4119 / +91 1070</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                24/7 Monitored
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Authorized Jurisdiction</span>
            </div>
            <p className="text-white font-semibold text-xs leading-relaxed">
              North Eastern Region (NER) — 8 States (Assam, Meghalaya, Sikkim, Nagaland, Arunachal Pradesh, Mizoram, Manipur, Tripura)
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Security & Privileges</span>
            </div>
            <div className="space-y-1">
              <p className="text-white font-semibold text-xs">
                Emergency Alert Broadcast Authorization • Incident Resolution • Geofence Overrides
              </p>
              <div className="flex items-center space-x-2 text-[10px] text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>2-Factor TOTP Hardware Authentication Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backend API & Developer Gateway Card (Moved here from Header) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 rounded-2xl border border-indigo-500/30 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-black text-white">Backend API & Integration Engine</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                FastAPI v0.115
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Access the live interactive Swagger UI documentation, OpenAPI specification schemas, WebPush distribution APIs, and live telemetry endpoints for system integrations.
            </p>
          </div>

          {/* PROMINENT BACKEND API BUTTON */}
          <a
            href={`${BACKEND_URL}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition shadow-lg shadow-indigo-950/60 flex items-center justify-center space-x-2.5 border border-indigo-400 group shrink-0"
            title="Open interactive Swagger UI in a new tab"
          >
            <ExternalLink className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span>OPEN BACKEND API (SWAGGER UI)</span>
          </a>
        </div>

        {/* Quick Endpoint Reference */}
        <div className="pt-3 border-t border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Key REST Endpoints
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">POST</span>
                <span className="text-slate-500 font-bold">API</span>
              </div>
              <p className="font-mono text-slate-200 text-[11px] font-bold mt-1">/api/emergency-alerts/send</p>
              <span className="text-[10px] text-slate-400">WebPush to Indilert</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">GET</span>
                <span className="text-slate-500 font-bold">API</span>
              </div>
              <p className="font-mono text-slate-200 text-[11px] font-bold mt-1">/api/reports</p>
              <span className="text-[10px] text-slate-400">Citizen Reports Feed</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">GET</span>
                <span className="text-slate-500 font-bold">API</span>
              </div>
              <p className="font-mono text-slate-200 text-[11px] font-bold mt-1">/api/predictions</p>
              <span className="text-[10px] text-slate-400">AI Landslide Risk Scores</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">WS</span>
                <span className="text-slate-500 font-bold">STREAM</span>
              </div>
              <p className="font-mono text-slate-200 text-[11px] font-bold mt-1">/ws/live</p>
              <span className="text-[10px] text-slate-400">Real-time Telemetry Stream</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Environment & Active Integrations Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4 text-xs">
        <div className="flex items-center space-x-2 text-white font-bold border-b border-slate-800 pb-3">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Platform Environment & Security Architecture</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold block">Citizen App Integration</span>
            <div className="font-bold text-white">Indilert Web Application</div>
            <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Connected via Port 3000 & Netlify</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold block">Push Notification Gateway</span>
            <div className="font-bold text-white">VAPID Web Push Service</div>
            <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active Keys & WebSockets</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold block">Audit Logging & Persistence</span>
            <div className="font-bold text-white">SQLite WAL Database</div>
            <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Synchronized & Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 bg-slate-800 p-2 rounded-full text-slate-400 hover:bg-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-black text-white mb-2 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span>Admin Login</span>
            </h3>
            <p className="text-sm text-slate-400 font-medium mb-6">Authenticate to access elevated console privileges.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Email Address</label>
                <input type="email" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="admin@nersafe.gov.in" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Password</label>
                <input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" />
              </div>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm mt-2"
              >
                Authenticate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
