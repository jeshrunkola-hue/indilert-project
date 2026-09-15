"use client";

import { AlertTriangle, AlertCircle, CheckCircle2, Search } from "lucide-react";

export default function RoadStatus() {
  const roads = [
    {
      id: 1,
      name: "NH-6 near Cherrapunji",
      status: "CLOSED",
      reason: "Landslide",
    },
    {
      id: 2,
      name: "Shillong Bypass Road",
      status: "CAUTION",
      reason: "Heavy rainfall / debris",
    },
    {
      id: 3,
      name: "Main City Road",
      status: "OPEN",
      reason: "",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex flex-col space-y-3">
        <h1 className="text-xl font-black text-slate-800 text-center">ROAD STATUS</h1>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search road or area..." 
            className="w-full bg-slate-100 rounded-lg py-3 pl-10 pr-4 text-slate-800 font-medium border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
        </div>
      </header>

      <main className="p-4 flex flex-col space-y-3 pb-20">
        {roads.map((road) => (
          <div key={road.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800 text-lg">{road.name}</h2>
              {road.reason && <p className="text-slate-500 font-medium text-sm mt-1">{road.reason}</p>}
            </div>
            
            <div className="flex flex-col items-end">
              {road.status === 'CLOSED' && (
                <div className="flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-black text-xs">CLOSED</span>
                </div>
              )}
              {road.status === 'CAUTION' && (
                <div className="flex items-center space-x-1 text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-black text-xs">CAUTION</span>
                </div>
              )}
              {road.status === 'OPEN' && (
                <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-black text-xs">OPEN</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
