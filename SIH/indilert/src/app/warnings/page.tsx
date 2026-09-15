"use client";

import { AlertTriangle, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getReceivedAlerts, StoredEmergencyAlert } from "@/lib/pushNotifications";

export default function Warnings() {
  const defaultWarnings = [
    {
      id: "sample-1",
      threat: "LANDSLIDE",
      area: "Cherrapunji – Nearby areas",
      issued: "20 min ago",
      instructions: "Avoid hill roads. Move to stable ground.",
      severity: "high",
    },
    {
      id: "sample-2",
      threat: "HEAVY RAINFALL",
      area: "East Khasi Hills District",
      issued: "2 hours ago",
      instructions: "Expect waterlogging. Do not cross fast-flowing water.",
      severity: "watch",
    }
  ];

  const [receivedAlerts, setReceivedAlerts] = useState<StoredEmergencyAlert[]>([]);

  useEffect(() => {
    setReceivedAlerts(getReceivedAlerts());

    const handleUpdate = () => {
      setReceivedAlerts(getReceivedAlerts());
    };

    window.addEventListener('indilert_alert_updated', handleUpdate);
    return () => {
      window.removeEventListener('indilert_alert_updated', handleUpdate);
    };
  }, []);

  const warnings = [
    ...receivedAlerts.map((a) => ({
      id: a.id,
      threat: a.title || a.type || "EMERGENCY ALERT",
      area: a.area || "Active Alert Area",
      issued: a.issuedAt ? new Date(a.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
      instructions: a.body,
      severity: a.severity?.toLowerCase() === 'critical' || a.severity?.toLowerCase() === 'high' ? 'high' : 'watch',
    })),
    ...defaultWarnings,
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 p-4 flex items-center sticky top-0 z-10">
        <h1 className="text-xl font-black text-slate-800 mx-auto">ACTIVE WARNINGS</h1>
      </header>

      <main className="p-4 flex flex-col space-y-4 pb-20">
        {warnings.map((w) => (
          <div key={w.id} className={`bg-white border-l-8 rounded-lg shadow-sm overflow-hidden ${w.severity === 'high' ? 'border-red-600' : 'border-orange-500'}`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`w-5 h-5 ${w.severity === 'high' ? 'text-red-600' : 'text-orange-500'}`} />
                  <h2 className="font-black text-lg text-slate-800">{w.threat}</h2>
                </div>
                <div className="flex items-center text-slate-500 text-xs font-semibold">
                  <Clock className="w-3 h-3 mr-1" />
                  {w.issued}
                </div>
              </div>
              <p className="font-bold text-slate-700 mb-2">📍 {w.area}</p>
              <p className="text-slate-600 font-medium mb-4">{w.instructions}</p>
              <button className="w-full bg-slate-100 text-slate-800 font-bold py-3 rounded text-sm hover:bg-slate-200 transition-colors">
                READ FULL ALERT
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
