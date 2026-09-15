"use client";

import { Phone, ShieldAlert, HeartPulse, Flame, Building2 } from "lucide-react";

export default function HelpPage() {
  const contacts = [
    { name: "National Emergency Number", number: "112", icon: ShieldAlert, color: "bg-red-600" },
    { name: "Police", number: "100", icon: ShieldAlert, color: "bg-blue-600" },
    { name: "Ambulance", number: "108", icon: HeartPulse, color: "bg-green-600" },
    { name: "Fire & Rescue", number: "101", icon: Flame, color: "bg-orange-600" },
    { name: "District Emergency Centre", number: "1077", icon: Building2, color: "bg-purple-600" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-red-700 text-white p-4 sticky top-0 z-10">
        <h1 className="text-xl font-black text-center tracking-wide">EMERGENCY HELP</h1>
      </header>

      <main className="p-4 flex flex-col space-y-4 pb-20">
        <p className="text-slate-600 font-bold text-center mb-2">Tap any button below to call immediately.</p>
        
        {contacts.map((contact, index) => {
          const Icon = contact.icon;
          return (
            <a 
              key={index} 
              href={`tel:${contact.number}`}
              className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-slate-400 active:scale-95 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className={`${contact.color} p-3 rounded-full text-white shadow-inner`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="font-black text-xl text-slate-800">{contact.name}</h2>
                  <p className="text-slate-500 font-bold text-lg">{contact.number}</p>
                </div>
              </div>
              <div className="bg-slate-100 p-4 rounded-full text-green-600 border border-slate-200">
                <Phone className="w-6 h-6 fill-current" />
              </div>
            </a>
          );
        })}
      </main>
    </div>
  );
}
