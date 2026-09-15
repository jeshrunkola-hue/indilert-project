"use client";

import Link from "next/link";
import { AlertTriangle, MapPin, Shield, User, ShieldCheck, Bell, X, CheckCircle, PhoneCall } from "lucide-react";
import { useState, useEffect } from "react";
import { translations } from "./translations";
import DynamicMap from "./components/DynamicMap";
import { useNerSafeAlerts } from "@/lib/useNerSafeAlerts";

type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH';

export default function Home() {
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');

  const languages = [
    "English", 
    "Hindi", 
    "Assamese", 
    "Bengali", 
    "Bodo", 
    "Meitei (Manipuri)", 
    "Khasi", 
    "Mizo", 
    "Garo", 
    "Kokborok", 
    "Nagamese"
  ];

  // Get current translation object
  const t = translations[currentLang] || translations["English"];

  // Dynamic theme based on risk level
  const themes = {
    LOW: {
      headerBg: 'bg-green-700',
      headerBtn: 'bg-green-800 hover:bg-green-900',
      textLight: 'text-green-100',
      boxBg: 'bg-green-50',
      boxBorder: 'border-green-600',
      bannerBg: 'bg-green-600',
      headingText: 'text-green-800',
      subHeading: 'text-green-700',
      innerBorder: 'border-green-200',
      buttonBorder: 'border-green-700 text-green-700 hover:bg-green-50',
      alertIcon: ShieldCheck,
      alertTitle: t.areaSafe,
      warningTitle: t.noActiveWarnings,
      warningDesc: t.safeDesc,
      instructionsTitle: t.generalPrep,
      instructions: t.safeInstructions,
      pulseClass: '',
      showRouting: false,
    },
    MODERATE: {
      headerBg: 'bg-yellow-600',
      headerBtn: 'bg-yellow-700 hover:bg-yellow-800',
      textLight: 'text-yellow-100',
      boxBg: 'bg-yellow-50',
      boxBorder: 'border-yellow-500',
      bannerBg: 'bg-yellow-500',
      headingText: 'text-yellow-800',
      subHeading: 'text-yellow-700',
      innerBorder: 'border-yellow-200',
      buttonBorder: 'border-yellow-600 text-yellow-600 hover:bg-yellow-50',
      alertIcon: AlertTriangle,
      alertTitle: t.weatherAdvisory,
      warningTitle: t.heavyRainfall,
      warningDesc: t.modDesc,
      instructionsTitle: t.preemptive,
      instructions: t.modInstructions,
      pulseClass: '',
      showRouting: true,
    },
    HIGH: {
      headerBg: 'bg-red-700',
      headerBtn: 'bg-red-800 hover:bg-red-900',
      textLight: 'text-red-100',
      boxBg: 'bg-red-50',
      boxBorder: 'border-red-600',
      bannerBg: 'bg-red-600',
      headingText: 'text-red-800',
      subHeading: 'text-red-700',
      innerBorder: 'border-red-200',
      buttonBorder: 'border-red-700 text-red-700 hover:bg-red-50',
      alertIcon: AlertTriangle,
      alertTitle: t.govAlert,
      warningTitle: t.landslideWarning,
      warningDesc: t.highDesc,
      instructionsTitle: t.whatToDoNow,
      instructions: t.highInstructions,
      pulseClass: 'animate-pulse-slow',
      showRouting: true,
    }
  };

  const theme = themes[riskLevel];
  const ActiveIcon = theme.alertIcon;

  const { 
    activeAlert, 
    modalAlert, 
    isModalOpen, 
    closeModal, 
    alertHistory,
    isSubscribed, 
    toggleNotifications, 
    acknowledgeAlert 
  } = useNerSafeAlerts();

  // Dynamically sync risk level when an official alert arrives
  useEffect(() => {
    if (activeAlert) {
      const sev = activeAlert.severity?.toUpperCase();
      if (sev === "CRITICAL" || sev === "HIGH") {
        setRiskLevel("HIGH");
      } else if (sev === "WARNING" || sev === "MODERATE") {
        setRiskLevel("MODERATE");
      } else if (sev === "ADVISORY" || sev === "LOW") {
        setRiskLevel("LOW");
      }
    } else {
      setRiskLevel("LOW");
    }
  }, [activeAlert]);

  // Multilingual / active alert fallback strings
  const displayTitle = activeAlert?.title || theme.warningTitle;
  const displayDesc = activeAlert?.message || theme.warningDesc;
  const displayInstructions = activeAlert?.recommendedAction
    ? [activeAlert.recommendedAction, ...theme.instructions.slice(1)]
    : theme.instructions;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative">
      {/* Header */}
      <header className={`${theme.headerBg} text-white p-4 flex items-center justify-between shadow-md transition-colors duration-500 relative z-20`}>
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6" fill="currentColor" />
          <h1 className="text-xl font-black tracking-widest">{t.appTitle}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-1 ${theme.textLight} text-xs font-semibold`}>
            <MapPin className="w-4 h-4" />
            <span>{t.location}</span>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className={`${theme.headerBtn} w-8 h-8 rounded-full transition-colors shadow-sm flex items-center justify-center`} 
              aria-label="Change Language"
            >
              <span className="font-bold text-sm leading-none">A</span>
            </button>
            
            {showLangMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowLangMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden text-slate-800">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{t.selectLanguage}</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto no-scrollbar">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setCurrentLang(lang);
                          setShowLangMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm border-b border-slate-100 last:border-0 hover:bg-blue-50 transition-colors ${currentLang === lang ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-slate-700 font-medium'}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notification History Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowHistory(!showHistory)}
              title="Recent Alerts"
              className={`${theme.headerBtn} w-8 h-8 rounded-full transition-colors shadow-sm flex items-center justify-center relative`}
              aria-label="View Alerts"
            >
              <Bell className="w-4 h-4 text-white" />
              {alertHistory.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full ring-1 ring-white" />
              )}
            </button>
            
            {showHistory && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowHistory(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden text-slate-800">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Alert History</span>
                    <button onClick={toggleNotifications} className="text-blue-500 text-xs font-bold hover:underline">
                      {isSubscribed ? "Mute" : "Unmute"}
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto no-scrollbar">
                    {alertHistory.length === 0 ? (
                      <div className="p-4 text-sm text-slate-500 text-center">No recent alerts</div>
                    ) : (
                      alertHistory.map((alert, idx) => (
                        <div key={idx} className="w-full text-left px-4 py-3 text-sm border-b border-slate-100 last:border-0 hover:bg-slate-50">
                          <div className="font-bold text-slate-800">{alert.title}</div>
                          <div className="text-xs text-slate-500 mt-1 line-clamp-2">{alert.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <button onClick={() => setShowLoginModal(true)} className={`${theme.headerBtn} w-8 h-8 flex items-center justify-center rounded-full transition-colors shadow-sm`} aria-label="User Profile">
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col space-y-5 mb-20 relative z-10">
        
        {/* Emergency Alert Content */}
        <div className={`${theme.boxBg} border-2 ${theme.boxBorder} rounded-xl overflow-hidden shadow-sm transition-colors duration-500 ${theme.pulseClass}`}>
          <div className={`${theme.bannerBg} text-white p-3 font-bold flex items-center space-x-2 transition-colors duration-500`}>
            <ActiveIcon className="w-5 h-5" />
            <span>{theme.alertTitle}</span>
          </div>
          <div className="p-4 flex flex-col space-y-3">
            <h2 className={`text-2xl font-black ${theme.headingText} uppercase transition-colors duration-500`}>{displayTitle}</h2>
            <p className="font-semibold text-slate-800 text-lg">{displayDesc}</p>
            
            <div className={`bg-white p-3 rounded-lg border ${theme.innerBorder} mt-2 flex flex-col transition-colors duration-500`}>
              <div>
                <h3 className={`font-bold ${theme.subHeading} mb-2 transition-colors duration-500`}>
                  {theme.instructionsTitle}
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 font-medium text-sm">
                  {displayInstructions.map((instruction: string, index: number) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              {/* Map View Always Expanded */}
              <div className="mt-4 h-48 w-full rounded-xl border border-slate-300 overflow-hidden relative shadow-inner">
                 <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
                   {theme.showRouting && (
                     <p className="text-[10px] font-black text-slate-700 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                       {t.routingText}
                     </p>
                   )}
                 </div>
                 <DynamicMap showRouting={theme.showRouting} />
              </div>
            </div>

            <div className="flex flex-col space-y-2 mt-4">
              <Link 
                href="/help" 
                onClick={() => acknowledgeAlert()}
                className={`bg-white border-2 ${theme.buttonBorder} text-center font-bold py-4 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2`}
              >
                <span>{t.getHelp}</span>
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* Emergency Alert Detail Popup Modal */}
      {isModalOpen && modalAlert && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border-2 border-red-600 flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-red-600 text-white p-3.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-300 animate-bounce" />
                <span className="font-black text-xs tracking-wider uppercase">
                  Official Emergency Alert
                </span>
              </div>
              <button
                onClick={closeModal}
                className="w-7 h-7 rounded-full bg-red-700 hover:bg-red-800 flex items-center justify-center text-white/90 hover:text-white transition-colors"
                aria-label="Close Alert Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex flex-col space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[11px] font-black rounded-full bg-red-100 text-red-700 border border-red-200 tracking-wide uppercase">
                  {modalAlert.severity || "CRITICAL"}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  {modalAlert.district || "East Khasi Hills"}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-black text-red-800 uppercase leading-tight tracking-tight">
                  {modalAlert.title}
                </h2>
                <p className="mt-1.5 text-sm text-slate-700 font-semibold leading-relaxed">
                  {modalAlert.message}
                </p>
              </div>

              {/* Recommended Safety Action Banner */}
              {modalAlert.recommendedAction && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-950">
                  <div className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800 mb-1 flex items-center space-x-1">
                    <span>⚡ Recommended Safety Action:</span>
                  </div>
                  <p className="font-medium leading-normal">{modalAlert.recommendedAction}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 pt-1">
                <button
                  onClick={() => {
                    acknowledgeAlert();
                    closeModal();
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-wider active:scale-98"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>I Am Safe / Acknowledge</span>
                </button>

                <a
                  href="tel:112"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-wider text-center"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Emergency Helpline 112</span>
                </a>

                <button
                  onClick={closeModal}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold py-1 transition-colors text-center"
                >
                  Dismiss for now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* User Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-black text-slate-800 mb-2">Citizen Login</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Sign in to view personalized alerts and manage your emergency contacts.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number</label>
                <input type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+91" />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">
                Send OTP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
