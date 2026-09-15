import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { CriticalAlertModal } from './components/CriticalAlertModal';

// Pages
import { OverviewDashboard } from './pages/OverviewDashboard';
import { LiveRiskMapPage } from './pages/LiveRiskMapPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { WeatherRainfallPage } from './pages/WeatherRainfallPage';
import { SensorsPage } from './pages/SensorsPage';
import { RoadConnectivityPage } from './pages/RoadConnectivityPage';
import { CitizenReportingPage } from './pages/CitizenReportingPage';
import { EmergencyAlertsPage } from './pages/EmergencyAlertsPage';
import { ResponsePrioritizationPage } from './pages/ResponsePrioritizationPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

export const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />;
      case 'map':
        return <LiveRiskMapPage />;
      case 'predictions':
        return <PredictionsPage />;
      case 'weather':
        return <WeatherRainfallPage />;
      case 'sensors':
        return <SensorsPage />;
      case 'roads':
        return <RoadConnectivityPage />;
      case 'reports':
        return <CitizenReportingPage />;
      case 'alerts':
        return <EmergencyAlertsPage />;
      case 'priorities':
        return <ResponsePrioritizationPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <div className="flex flex-1 relative">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-20 md:pb-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      <BottomNav />
      <CriticalAlertModal />
    </div>
  );
};
