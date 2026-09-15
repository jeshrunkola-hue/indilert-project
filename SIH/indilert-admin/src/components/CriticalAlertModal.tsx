import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertOctagon, X, MapPin, Clock, ShieldAlert, CheckCircle, Navigation, Radio, Check } from 'lucide-react';
import { api } from '../services/api';

export const CriticalAlertModal: React.FC = () => {
  const { activeCriticalAlert, dismissCriticalAlert, setActiveTab, t, language } = useApp();

  if (!activeCriticalAlert) return null;

  const handleAcknowledge = async () => {
    try {
      await api.acknowledgeAlert(activeCriticalAlert.id);
    } catch (e) {
      // ignore
    }
    dismissCriticalAlert();
  };

  const handleViewMap = () => {
    dismissCriticalAlert();
    setActiveTab('map');
  };

  const handleViewIncident = () => {
    dismissCriticalAlert();
    setActiveTab('alerts');
  };

  const [notifySuccess, setNotifySuccess] = useState(false);

  const handleNotifyField = () => {
    setNotifySuccess(true);
    setTimeout(() => setNotifySuccess(false), 3000);
  };

  const message = language === 'hi'
    ? activeCriticalAlert.message_hi
    : language === 'as'
    ? activeCriticalAlert.message_regional
    : activeCriticalAlert.message_en;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-rose-600 rounded-2xl max-w-xl w-full p-6 shadow-2xl shadow-rose-950/80 relative overflow-hidden">
        {/* Animated warning stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 animate-pulse" />

        {/* Close Button */}
        <button
          onClick={dismissCriticalAlert}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500">
            <AlertOctagon className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-rose-600 text-white tracking-widest uppercase">
                EMERGENCY ALERT LEVEL 4
              </span>
              <span className="text-xs text-rose-400 font-bold animate-pulse">
                IMMEDIATE DANGER
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-0.5">
              🚨 CRITICAL LANDSLIDE WARNING
            </h2>
          </div>
        </div>

        {/* Alert Details Card */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-rose-900/40 mb-4 space-y-3">
          <p className="text-sm font-semibold text-rose-200 leading-relaxed">
            {message}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Area / Corridor:</span>
              <span className="font-bold text-white flex items-center mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 mr-1" />
                {activeCriticalAlert.district_name} {activeCriticalAlert.zone_name ? `• ${activeCriticalAlert.zone_name}` : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Expected Time Window:</span>
              <span className="font-bold text-amber-300 flex items-center mt-0.5">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Next 3–6 Hours
              </span>
            </div>
          </div>

          <div className="bg-rose-950/40 rounded-lg p-2.5 border border-rose-800/40 text-xs">
            <span className="font-bold text-rose-300 block mb-1">Recommended Action:</span>
            <p className="text-rose-100">
              {activeCriticalAlert.recommended_action}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <button
            onClick={handleAcknowledge}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Acknowledge</span>
          </button>

          <button
            onClick={handleViewMap}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-950"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>View Map</span>
          </button>

          <button
            onClick={handleViewIncident}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>View Incident</span>
          </button>

          <button
            onClick={handleNotifyField}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Notify Field</span>
          </button>
        </div>
        {/* Notify Success Toast */}
        {notifySuccess && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center shadow-lg animate-in slide-in-from-top-4">
            <Check className="w-4 h-4 mr-2" />
            Dispatch notice queued to SDRF Field Battalions!
          </div>
        )}
      </div>
    </div>
  );
};
