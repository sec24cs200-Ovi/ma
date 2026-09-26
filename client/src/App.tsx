import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { SosModal } from './components/Modals/SosModal';
import { FamilySchedulerModal } from './components/Modals/FamilySchedulerModal';
import { CatchAuctionModal } from './components/Modals/CatchAuctionModal';
import { GovtSchemeModal } from './components/Modals/GovtSchemeModal';

// Views
import { DashboardView } from './components/Views/DashboardView';
import { AiAssistantView } from './components/Views/AiAssistantView';
import { GisMapView } from './components/Views/GisMapView';
import { PfzZonesView } from './components/Views/PfzZonesView';
import { SeaSafetyView } from './components/Views/SeaSafetyView';
import { SatelliteTelemetryView } from './components/Views/SatelliteTelemetryView';
import { EquipmentView } from './components/Views/EquipmentView';
import { RoutePlannerView } from './components/Views/RoutePlannerView';
import { AlertsView } from './components/Views/AlertsView';
import { MarineDataView } from './components/Views/MarineDataView';
import { ServicesView } from './components/Views/ServicesView';
import { GovtSchemesView } from './components/Views/GovtSchemesView';

import { NavView, LanguageCode, PFZZone, CatchAuction, GovtScheme } from './types';
import { INITIAL_AUCTIONS, PFZ_ZONES } from './data/mockData';

export function App() {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [activeRegion, setActiveRegion] = useState<string>('rameswaram');
  const [language, setLanguage] = useState<LanguageCode>('en');

  // Modals state
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isAuctionOpen, setIsAuctionOpen] = useState(false);
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState<GovtScheme | null>(null);

  // Data state
  const [auctions, setAuctions] = useState<CatchAuction[]>(INITIAL_AUCTIONS);
  const [selectedZone, setSelectedZone] = useState<PFZZone | null>(PFZ_ZONES[0]);
  const [appliedSchemes, setAppliedSchemes] = useState<Record<string, boolean>>({
    'navic-transceiver': true,
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([
    {
      id: 'welcome',
      title: 'Marine AI Connected',
      message: 'ISRO OceanSat-3 & NavIC Satellite Telemetry feeds synchronized.',
      type: 'success',
    },
  ]);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleApplyScheme = (schemeId: string) => {
    setAppliedSchemes((prev) => ({ ...prev, [schemeId]: true }));
    addToast(
      'Application Submitted!',
      'Your DBT subsidy application was dispatched with biometric ID & Vessel IND-TN-10 verification.',
      'success'
    );
  };

  const handleAddAuction = (newAuction: CatchAuction) => {
    setAuctions((prev) => [newAuction, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050b14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Fixed Header */}
      <Header
        activeRegion={activeRegion}
        onRegionChange={setActiveRegion}
        language={language}
        onLanguageChange={setLanguage}
        onTriggerSos={() => setIsSosOpen(true)}
      />

      {/* Main Body: Sidebar + Dynamic Content View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          language={language}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#070e1b]/60">
          {currentView === 'dashboard' && (
            <DashboardView
              activeRegion={activeRegion}
              onNavigate={setCurrentView}
              onSelectZone={(zone) => {
                setSelectedZone(zone);
                setCurrentView('route-planner');
              }}
              onOpenScheduler={() => setIsSchedulerOpen(true)}
              onOpenAuction={() => setIsAuctionOpen(true)}
            />
          )}

          {currentView === 'ai-assistant' && (
            <AiAssistantView onShowToast={addToast} />
          )}

          {currentView === 'gis-map' && (
            <GisMapView
              activeRegion={activeRegion}
              onSelectZone={(zone) => {
                setSelectedZone(zone);
                setCurrentView('route-planner');
              }}
            />
          )}

          {currentView === 'pfz-zones' && (
            <PfzZonesView
              onSelectZone={setSelectedZone}
              onNavigateToRoute={() => setCurrentView('route-planner')}
              onShowToast={addToast}
            />
          )}

          {currentView === 'sea-safety' && (
            <SeaSafetyView activeRegion={activeRegion} />
          )}

          {currentView === 'satellite-telemetry' && (
            <SatelliteTelemetryView
              activeRegion={activeRegion}
              onShowToast={addToast}
            />
          )}

          {currentView === 'equipment' && (
            <EquipmentView onShowToast={addToast} />
          )}

          {currentView === 'route-planner' && (
            <RoutePlannerView
              activeRegion={activeRegion}
              selectedZone={selectedZone}
              onShowToast={addToast}
            />
          )}

          {currentView === 'alerts' && (
            <AlertsView activeRegion={activeRegion} />
          )}

          {currentView === 'marine-data' && (
            <MarineDataView activeRegion={activeRegion} />
          )}

          {currentView === 'services' && (
            <ServicesView
              auctions={auctions}
              onOpenAuctionModal={() => setIsAuctionOpen(true)}
              onShowToast={addToast}
            />
          )}

          {currentView === 'schemes' && (
            <GovtSchemesView
              onSelectSchemeForApplication={(scheme) => setSelectedSchemeForModal(scheme)}
              appliedSchemes={appliedSchemes}
            />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        activeRegion={activeRegion}
        onShowToast={addToast}
      />

      <FamilySchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        activeRegion={activeRegion}
        onShowToast={addToast}
      />

      <CatchAuctionModal
        isOpen={isAuctionOpen}
        onClose={() => setIsAuctionOpen(false)}
        onAddAuction={handleAddAuction}
        onShowToast={addToast}
      />

      <GovtSchemeModal
        isOpen={!!selectedSchemeForModal}
        onClose={() => setSelectedSchemeForModal(null)}
        scheme={selectedSchemeForModal}
        onApply={handleApplyScheme}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
