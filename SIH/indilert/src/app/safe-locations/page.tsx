"use client";

import { Tent, Navigation, Phone, ShieldPlus } from "lucide-react";

export default function SafeLocations() {
  const locations = [
    {
      id: 1,
      name: "St. Anthony's College Camp",
      type: "Relief Camp",
      distance: "1.2 km",
      status: "OPEN",
      capacity: "Available",
    },
    {
      id: 2,
      name: "Civil Hospital Shillong",
      type: "Hospital",
      distance: "2.5 km",
      status: "OPEN",
      capacity: "Emergency Only",
    },
    {
      id: 3,
      name: "Laitumkhrah Police Station",
      type: "Police Station",
      distance: "3.0 km",
      status: "OPEN",
      capacity: "Available",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
        <h1 className="text-xl font-black text-slate-800 text-center">SAFE LOCATIONS</h1>
      </header>

      <main className="p-4 flex flex-col space-y-4 pb-20">
        <p className="text-slate-600 font-medium text-center mb-2">Nearby shelters and emergency facilities.</p>
        
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="font-bold text-lg text-slate-800">{loc.name}</h2>
                  <p className="text-slate-500 font-medium text-sm flex items-center mt-1">
                    <ShieldPlus className="w-4 h-4 mr-1" /> {loc.type}
                  </p>
                </div>
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold border border-green-200">
                  {loc.status}
                </div>
              </div>
              
              <div className="flex items-center text-slate-600 font-semibold my-3">
                <Navigation className="w-4 h-4 mr-1 text-slate-400" />
                <span>{loc.distance} away</span>
                <span className="mx-2">•</span>
                <span>{loc.capacity}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button className="bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 shadow-sm">
                  <Navigation className="w-5 h-5" />
                  <span>DIRECTIONS</span>
                </button>
                <button className="bg-slate-100 text-slate-800 border border-slate-200 font-bold py-3 rounded-lg flex items-center justify-center space-x-2 shadow-sm">
                  <Phone className="w-5 h-5" />
                  <span>CALL</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
