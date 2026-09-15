import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Play, RotateCcw, AlertTriangle, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { simulationStatus, advanceSimulation, resetSimulation, triggerRefresh } = useApp();
  const [sendingDemoAlert, setSendingDemoAlert] = useState(false);
  const [demoSentSuccess, setDemoSentSuccess] = useState(false);

  const currentStep = simulationStatus?.current_step || 0;
  const isSimulating = simulationStatus?.is_simulating;
  const isDemoAlertReady = currentStep >= 3 || simulationStatus?.demo_alert_ready;

  const stepLabels = [
    "Stage 1/3: Baseline: Normal monsoon rainfall (No alert)",
    "Stage 2/3: High Risk: Heavy precipitation & soil saturation (Warning advisory)",
    "Stage 3/3: Critical: Debris flow onset! Risk 88% — Road NH-27 Blocked"
  ];

  const handleSendToIndilert = async () => {
    setSendingDemoAlert(true);
    try {
      await api.sendEmergencyAlert({
        title: "🚨 CRITICAL LANDSLIDE ALERT: JATINGA ESCARPMENT",
        message: "Severe rotational slope collapse detected in Dima Hasao. NH-27 lifeline highway blocked with debris.",
        severity: "CRITICAL",
        type: "LANDSLIDE",
        state: "Assam",
        district: "Dima Hasao",
        area: "Jatinga Escarpment Corridor",
        latitude: 25.1220,
        longitude: 93.0318,
        risk_score: 88.0,
        expected_window: "Next 1-2 hours",
        recommended_action: "Evacuate downhill perimeters immediately. Avoid NH-27 and seek community shelters in Haflong.",
        expires_hours: 6,
        mode: "DEMO"
      });
      setDemoSentSuccess(true);
      setTimeout(() => setDemoSentSuccess(false), 5000);
      triggerRefresh();
    } catch (err) {
      console.error("Failed to send demo alert:", err);
    } finally {
      setSendingDemoAlert(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-950/50 via-rose-950/60 to-slate-900 border-b border-amber-500/30 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5 animate-bounce text-amber-400" />
          <span>SIMULATOR</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-200">
            {stepLabels[Math.min(currentStep, 2)]}
          </span>
          {isSimulating && (
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold animate-pulse">
              LIVE SCENARIO
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* STAGE 3/3 CRITICAL DEMO ALERT BUTTON */}
        {isDemoAlertReady && (
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-black text-rose-400 animate-pulse hidden sm:inline">
              🚨 CRITICAL ALERT READY
            </span>
            <button
              onClick={handleSendToIndilert}
              disabled={sendingDemoAlert}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs shadow-md shadow-rose-950 transition border border-rose-400 cursor-pointer"
              title="Explicitly dispatch this demonstration alert to Indilert users"
            >
              {sendingDemoAlert ? (
                <span>SENDING...</span>
              ) : demoSentSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>SENT TO INDILERT!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>[ SEND TO INDILERT ]</span>
                </>
              )}
            </button>
          </div>
        )}

        <button
          onClick={advanceSimulation}
          className="flex items-center space-x-1 px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-sm"
        >
          <Play className="w-3.5 h-3.5" />
          <span>{currentStep === 0 ? "Start Scenario" : `Advance (${currentStep}/3)`}</span>
        </button>

        <button
          onClick={async () => {
            await resetSimulation();
            triggerRefresh();
          }}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          title="Reset simulation to baseline (preserves real LIVE alerts in history)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
