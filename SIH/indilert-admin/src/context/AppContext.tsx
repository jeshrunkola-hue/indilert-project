import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UserRole, Zone, Alert } from '../types';
import { SupportedLanguage, TRANSLATIONS } from '../i18n/translations';
import { wsService } from '../services/websocket';
import { api } from '../services/api';
import { syncOfflineReports } from '../offline/sync';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedZone: Zone | null;
  setSelectedZone: (zone: Zone | null) => void;
  isOnline: boolean;
  activeCriticalAlert: Alert | null;
  dismissCriticalAlert: () => void;
  simulationStatus: any;
  advanceSimulation: () => Promise<void>;
  resetSimulation: () => Promise<void>;
  refreshKey: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [activeCriticalAlert, setActiveCriticalAlert] = useState<Alert | null>(null);
  const [simulationStatus, setSimulationStatus] = useState<any>({ is_simulating: false, current_step: 0, logs: [] });
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  // Translation helper
  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  const acknowledgedAlertsRef = useRef<Set<number>>(new Set());

  const dismissCriticalAlert = () => {
    if (activeCriticalAlert?.id) {
      acknowledgedAlertsRef.current.add(activeCriticalAlert.id);
    }
    setActiveCriticalAlert(null);
  };

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const res = await syncOfflineReports();
      if (res.syncedCount > 0) {
        triggerRefresh();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-login for testing purposes to populate the token
    const autoLogin = async () => {
      try {
        if (!localStorage.getItem('ner_safe_token')) {
          const res = await api.login('admin@nersafe.gov.in', 'Password@123');
          localStorage.setItem('ner_safe_token', res.access_token);
        }
      } catch (err) {
        console.error('Auto-login failed', err);
      }
    };
    autoLogin();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch initial alerts and check for critical warnings
  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const alerts = await api.getAlerts();
        const critical = alerts.find(a => a.level === 'LEVEL_4_EMERGENCY' && a.is_active);
        if (critical && !acknowledgedAlertsRef.current.has(critical.id)) {
          setActiveCriticalAlert(critical);
        }
      } catch (err) {
        console.warn('Could not fetch alerts:', err);
      }
    };
    checkAlerts();
  }, [refreshKey]);

  // WebSocket event subscriptions
  useEffect(() => {
    const unsubscribe = wsService.subscribe((msg) => {
      if (msg.type === 'SENSOR_TELEMETRY_UPDATE') {
        // Pulse update
      } else if (msg.type === 'EMERGENCY_ALERT_TRIGGERED') {
        if (!acknowledgedAlertsRef.current.has(msg.alert?.id)) {
          setActiveCriticalAlert(msg.alert);
        }
        triggerRefresh();
      } else if (msg.type === 'INCIDENT_REPORTED' || msg.type === 'CITIZEN_REPORT_SUBMITTED') {
        // If high risk report received, maybe trigger an emergency prompt?
        triggerRefresh();
        // Since we want admin to get a prompt when a citizen reports high risk:
        if (msg.incident?.severity === 'HIGH' || msg.incident?.severity === 'CRITICAL' || msg.report?.severity === 'HIGH') {
           setActiveCriticalAlert({
             id: msg.incident?.id || Date.now(),
             level: 'LEVEL_4_EMERGENCY',
             message_en: 'EMERGENCY: High Risk Incident reported by user.',
             message_hi: 'EMERGENCY: High Risk Incident reported by user.',
             message_regional: 'EMERGENCY: High Risk Incident reported by user.',
             district_name: msg.incident?.district_name || 'Unknown',
             zone_name: msg.incident?.zone_name || '',
             recommended_action: 'Verify incident and dispatch SDRF immediately.',
             is_active: true
           } as Alert);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const advanceSimulation = async () => {
    try {
      const res = await api.advanceSimulation();
      setSimulationStatus(res);
      triggerRefresh();
      // If critical, trigger alert
      const alerts = await api.getAlerts();
      const crit = alerts.find(a => a.level === 'LEVEL_4_EMERGENCY' && a.is_active);
      if (crit && !acknowledgedAlertsRef.current.has(crit.id)) setActiveCriticalAlert(crit);
    } catch (err) {
      console.error('Error advancing simulation:', err);
    }
  };

  const resetSimulation = async () => {
    try {
      const res = await api.resetSimulation();
      setSimulationStatus(res);
      setActiveCriticalAlert(null);
      triggerRefresh();
    } catch (err) {
      console.error('Error resetting simulation:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        t,
        activeTab,
        setActiveTab,
        selectedZone,
        setSelectedZone,
        isOnline,
        activeCriticalAlert,
        dismissCriticalAlert,
        simulationStatus,
        advanceSimulation,
        resetSimulation,
        refreshKey,
        triggerRefresh
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
