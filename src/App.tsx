import React, { useState, useEffect } from 'react';
import { 
  NavigationTab, 
  CropRecord, 
  WasteRecord, 
  RecoveryPartner, 
  RecoveryRequest, 
  ActivityLog, 
  WasteStatus,
  WasteMaterialCategory,
  WasteCondition,
  AppSettings
} from './types';
import { 
  loadCrops, 
  saveCrops, 
  loadWasteRecords, 
  saveWasteRecords, 
  loadRequests, 
  saveRequests, 
  loadActivityLogs, 
  logActivity, 
  calculateImpactSummary, 
  resetToDemoDefaults,
  loadSettings,
  saveSettings
} from './utils/storage';
import { generateWasteAssessment } from './utils/matchingEngine';
import { RECOVERY_PARTNERS_DATABASE } from './data/partnersDatabase';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { OverviewView } from './components/overview/OverviewView';
import { HarvestDashboard } from './components/harvest/HarvestDashboard';
import { AddCropModal } from './components/harvest/AddCropModal';
import { CropDetailModal } from './components/harvest/CropDetailModal';
import { FreshnessCalculatorModal } from './components/harvest/FreshnessCalculatorModal';
import { PhotoAnalysisModal } from './components/harvest/PhotoAnalysisModal';
import { HarvestToRecoveryModal } from './components/handoff/HarvestToRecoveryModal';
import { WasteDashboard } from './components/waste/WasteDashboard';
import { RegisterWasteModal } from './components/waste/RegisterWasteModal';
import { WasteDetailModal } from './components/waste/WasteDetailModal';
import { PartnerMatchesModal } from './components/matching/PartnerMatchesModal';
import { CollectionRequestModal } from './components/requests/CollectionRequestModal';
import { PartnersDirectoryView } from './components/partners/PartnersDirectoryView';
import { ImpactView } from './components/impact/ImpactView';
import { ActivityView } from './components/activity/ActivityView';
import { SettingsView } from './components/settings/SettingsView';
import { HelpModal } from './components/help/HelpModal';
import { SplashScreen } from './components/splash/SplashScreen';
import { GatherAiAssistantModal } from './components/assistant/GatherAiAssistantModal';
import { SurplusAdvisorModal } from './components/waste/SurplusAdvisorModal';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Navigation
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data Entities
  const [crops, setCrops] = useState<CropRecord[]>(() => loadCrops());
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>(() => loadWasteRecords());
  const [requests, setRequests] = useState<RecoveryRequest[]>(() => loadRequests());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadActivityLogs());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // Appearance & Theme Synchronization
  useEffect(() => {
    const root = document.documentElement;

    // Theme (Light / Dark / System)
    if (settings.appearance.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.appearance.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Density (Comfortable / Compact)
    if (settings.appearance.density === 'compact') {
      root.classList.add('compact');
    } else {
      root.classList.remove('compact');
    }

    // High Contrast Mode
    if (settings.appearance.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [settings.appearance]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    // Respect user's in-app notification preference
    if (!settings.notifications.inAppAlerts) return;
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    showToast('Settings saved successfully!');
  };

  // Derived Impact Summary
  const impactSummary = calculateImpactSummary(crops, wasteRecords, requests);

  // Modals state
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  const [selectedCropForDetail, setSelectedCropForDetail] = useState<CropRecord | null>(null);
  const [isFreshnessOpen, setIsFreshnessOpen] = useState(false);
  const [freshnessCropName, setFreshnessCropName] = useState('Tomato (Tamatar)');
  const [isPhotoAnalysisOpen, setIsPhotoAnalysisOpen] = useState(false);

  // Handoff state
  const [isHandoffOpen, setIsHandoffOpen] = useState(false);
  const [handoffCrop, setHandoffCrop] = useState<CropRecord | null>(null);

  // Waste Modals state
  const [isRegisterWasteOpen, setIsRegisterWasteOpen] = useState(false);
  const [selectedWasteForDetail, setSelectedWasteForDetail] = useState<WasteRecord | null>(null);
  const [matchingWasteRecord, setMatchingWasteRecord] = useState<WasteRecord | null>(null);

  // Request Coordinator modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestTargetWaste, setRequestTargetWaste] = useState<WasteRecord | null>(null);
  const [requestTargetPartner, setRequestTargetPartner] = useState<RecoveryPartner | null>(null);

  // PRD Help Guide Modal
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Gather AI Brain Assistant & Surplus Advisor State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState<string | undefined>(undefined);
  const [isSurplusAdvisorOpen, setIsSurplusAdvisorOpen] = useState(false);

  const handleOpenAssistant = (prompt?: string) => {
    setAssistantPrompt(prompt);
    setIsAssistantOpen(true);
  };

  const handleOpenSurplusAdvisor = () => {
    setIsSurplusAdvisorOpen(true);
  };

  const handleProceedFromSurplusAdvisor = (prefill: {
    materialType: string;
    materialCategory: WasteMaterialCategory;
    quantity: number;
    unit: WasteRecord['unit'];
    condition: WasteCondition;
    pickupLocation: string;
    notes?: string;
  }) => {
    setIsSurplusAdvisorOpen(false);
    const now = new Date().toISOString().split('T')[0];
    const assessment = generateWasteAssessment({
      materialType: prefill.materialType,
      materialCategory: prefill.materialCategory,
      quantity: prefill.quantity,
      unit: prefill.unit,
      condition: prefill.condition,
      contaminationStatus: 'Clean / 100% Segregated',
    });
    const newWasteRecord: WasteRecord = {
      id: `waste-ai-${Date.now()}`,
      materialType: prefill.materialType,
      materialCategory: prefill.materialCategory,
      quantity: prefill.quantity,
      unit: prefill.unit,
      pickupLocation: prefill.pickupLocation,
      availableFrom: now,
      preferredPickupWindow: 'Within 24-48 hours',
      condition: prefill.condition,
      contaminationStatus: 'Clean / 100% Segregated',
      storageDetails: 'Stored in ventilated crates / containers',
      contactName: settings.profile.fullName || 'Ramesh Patil',
      contactPhone: settings.profile.phone || '+91 98220 55184',
      status: 'Registered',
      assessment,
      notes: prefill.notes || 'Identified via Gather AI Surplus Advisor.',
      createdAt: now,
      updatedAt: now,
    };
    handleSaveWaste(newWasteRecord);
  };

  // Handlers for Harvest Intelligence
  const handleSaveCrop = (newCrop: CropRecord) => {
    const updated = [newCrop, ...crops];
    setCrops(updated);
    saveCrops(updated);

    logActivity({
      category: 'harvest',
      title: `Crop Registered: ${newCrop.cropName}`,
      description: `Added ${newCrop.cropName} (${newCrop.location}). Growth stage: ${newCrop.currentStage}.`,
      relatedId: newCrop.id,
      statusBadge: newCrop.currentStage,
    });
    setActivityLogs(loadActivityLogs());

    showToast(`Registered ${newCrop.cropName} successfully!`);
  };

  const handleUpdateCrop = (updatedCrop: CropRecord) => {
    const updated = crops.map((c) => (c.id === updatedCrop.id ? updatedCrop : c));
    setCrops(updated);
    saveCrops(updated);
    setSelectedCropForDetail(updatedCrop);

    if (updatedCrop.hasSurplusFlagged) {
      logActivity({
        category: 'harvest',
        title: `Surplus Flagged: ${updatedCrop.cropName}`,
        description: `Flagged ${updatedCrop.surplusDetails?.estimatedQuantity} ${updatedCrop.surplusDetails?.unit} of ${updatedCrop.cropName} for recovery.`,
        relatedId: updatedCrop.id,
        statusBadge: 'Surplus Available',
      });
      setActivityLogs(loadActivityLogs());
      showToast(`Flagged surplus for ${updatedCrop.cropName}.`);
    }
  };

  const handleConfirmPhotoIdentification = (cropName: string, estimatedStage: string) => {
    setIsPhotoAnalysisOpen(false);
    setIsAddCropOpen(true);
    showToast(`AI identified ${cropName} (${estimatedStage}). Complete details below.`);
  };

  // Handlers for Harvest-to-Recovery Handoff
  const handleInitiateHandoff = (crop: CropRecord) => {
    setHandoffCrop(crop);
    setIsHandoffOpen(true);
  };

  const handleConfirmHandoff = (newWaste: WasteRecord) => {
    const updatedWaste = [newWaste, ...wasteRecords];
    setWasteRecords(updatedWaste);
    saveWasteRecords(updatedWaste);

    logActivity({
      category: 'waste',
      title: `Surplus Transferred: ${newWaste.materialType}`,
      description: `Transferred from ${newWaste.originCropName}. ${newWaste.quantity} ${newWaste.unit} registered for partner matching.`,
      relatedId: newWaste.id,
      statusBadge: 'Transferred from Harvest',
    });
    setActivityLogs(loadActivityLogs());

    showToast(`Transferred ${newWaste.materialType} to Food Waste Recovery!`);
    
    // Automatically take user to matching modal for this new batch
    setMatchingWasteRecord(newWaste);
  };

  // Handlers for Food Waste Recovery
  const handleSaveWaste = (newWaste: WasteRecord) => {
    const updated = [newWaste, ...wasteRecords];
    setWasteRecords(updated);
    saveWasteRecords(updated);

    logActivity({
      category: 'waste',
      title: `Organic Biomass Registered: ${newWaste.materialType}`,
      description: `Registered ${newWaste.quantity} ${newWaste.unit} at ${newWaste.pickupLocation}.`,
      relatedId: newWaste.id,
      statusBadge: 'Registered',
    });
    setActivityLogs(loadActivityLogs());

    showToast(`Registered ${newWaste.materialType}!`);

    // Open matching directly to make UX seamless
    setMatchingWasteRecord(newWaste);
  };

  const handleSelectPartnerForRequest = (partner: RecoveryPartner, wasteRecord: WasteRecord) => {
    setRequestTargetPartner(partner);
    setRequestTargetWaste(wasteRecord);
    setIsRequestModalOpen(true);
  };

  const handleSaveRequest = (updatedRequest: RecoveryRequest, updatedWasteStatus: WasteStatus) => {
    // Upsert request
    const existingIndex = requests.findIndex((r) => r.id === updatedRequest.id);
    let newRequests: RecoveryRequest[];
    if (existingIndex >= 0) {
      newRequests = [...requests];
      newRequests[existingIndex] = updatedRequest;
    } else {
      newRequests = [updatedRequest, ...requests];
    }
    setRequests(newRequests);
    saveRequests(newRequests);

    // Update corresponding waste record
    const updatedWasteList = wasteRecords.map((w) => {
      if (w.id === updatedRequest.wasteRecordId) {
        return {
          ...w,
          status: updatedWasteStatus,
          selectedPartnerId: updatedRequest.partnerId,
          activeRequestId: updatedRequest.id,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }
      return w;
    });
    setWasteRecords(updatedWasteList);
    saveWasteRecords(updatedWasteList);

    // Activity log
    logActivity({
      category: updatedWasteStatus === 'Collection Confirmed' ? 'collection' : 'request',
      title: `${updatedWasteStatus}: ${updatedRequest.materialType}`,
      description: `Partner: ${updatedRequest.partnerName}. Status advanced to "${updatedWasteStatus}".`,
      relatedId: updatedRequest.wasteRecordId,
      statusBadge: updatedWasteStatus,
    });
    setActivityLogs(loadActivityLogs());

    showToast(`Request updated: ${updatedWasteStatus}!`);
  };

  // Reset Demo to 5-scene scenario
  const handleResetDemo = () => {
    const defaults = resetToDemoDefaults();
    setCrops(defaults.crops);
    setWasteRecords(defaults.waste);
    setRequests(defaults.requests);
    setActivityLogs(defaults.activity);
    showToast('Reset to 5-scene Hackathon Demo Scenario!');
  };

  return (
    <div className="min-h-screen bg-[#F8F8F2] text-[#1D2922] flex">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed left-auto right-4 sm:right-6 bottom-[max(72px,calc(72px+env(safe-area-inset-bottom,0px)))] sm:bottom-[max(84px,calc(84px+env(safe-area-inset-bottom,0px)))] z-50 bg-[#183E2E] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#85B96F]/40 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-[#D7E8A3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        cropCount={crops.length}
        wasteCount={wasteRecords.length}
        pendingRequestsCount={impactSummary.pendingRequestsCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        userProfile={settings.profile}
      />

      {/* Main Content Area (offset by 256px sidebar on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAddCrop={() => setIsAddCropOpen(true)}
          onOpenRegisterWaste={() => setIsRegisterWasteOpen(true)}
          onResetDemo={handleResetDemo}
          onOpenHelpModal={() => setIsHelpModalOpen(true)}
          onOpenSplash={() => setShowSplash(true)}
          onOpenAssistant={() => handleOpenAssistant()}
          userProfile={settings.profile}
        />

        {/* Tab Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewView
              crops={crops}
              wasteRecords={wasteRecords}
              requests={requests}
              activityLogs={activityLogs}
              impactSummary={impactSummary}
              onNavigate={setActiveTab}
              onOpenAddCrop={() => setIsAddCropOpen(true)}
              onOpenRegisterWaste={() => setIsRegisterWasteOpen(true)}
              onSelectCrop={(c) => setSelectedCropForDetail(c)}
              onSelectWaste={(w) => setSelectedWasteForDetail(w)}
              onInitiateHandoff={handleInitiateHandoff}
              onOpenHelpModal={() => setIsHelpModalOpen(true)}
              onOpenAssistant={handleOpenAssistant}
              onOpenSurplusAdvisor={handleOpenSurplusAdvisor}
              enableAiSuggestions={settings.ai.enableAiSuggestions}
            />
          )}

          {activeTab === 'harvest' && (
            <HarvestDashboard
              crops={crops}
              onOpenAddCrop={() => setIsAddCropOpen(true)}
              onOpenPhotoAnalysis={() => setIsPhotoAnalysisOpen(true)}
              onOpenFreshnessCalculator={(name) => {
                if (name) setFreshnessCropName(name);
                setIsFreshnessOpen(true);
              }}
              onSelectCrop={(c) => setSelectedCropForDetail(c)}
              onInitiateHandoff={handleInitiateHandoff}
            />
          )}

          {activeTab === 'waste' && (
            <WasteDashboard
              wasteRecords={wasteRecords}
              onOpenRegisterWaste={() => setIsRegisterWasteOpen(true)}
              onOpenSurplusAdvisor={handleOpenSurplusAdvisor}
              onOpenMatches={(record) => setMatchingWasteRecord(record)}
              onOpenRequest={(record) => {
                const partner = RECOVERY_PARTNERS_DATABASE.find((p) => p.id === record.selectedPartnerId) || RECOVERY_PARTNERS_DATABASE[0];
                handleSelectPartnerForRequest(partner, record);
              }}
              onSelectWaste={(w) => setSelectedWasteForDetail(w)}
            />
          )}

          {activeTab === 'partners' && (
            <PartnersDirectoryView
              userProfile={settings.profile}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'impact' && (
            <ImpactView
              impactSummary={impactSummary}
              wasteRecords={wasteRecords}
              requests={requests}
              onNavigateToWaste={() => setActiveTab('waste')}
            />
          )}

          {activeTab === 'activity' && <ActivityView activityLogs={activityLogs} />}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              crops={crops}
              wasteRecords={wasteRecords}
              requests={requests}
              activityLogs={activityLogs}
              onResetDemo={handleResetDemo}
              onTriggerTestToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}

      {/* 1. Add Crop Modal */}
      <AddCropModal
        isOpen={isAddCropOpen}
        onClose={() => setIsAddCropOpen(false)}
        onSaveCrop={handleSaveCrop}
        defaultLocation={settings.farm.defaultLocation || settings.profile.location}
      />

      {/* 2. Crop Detail Modal */}
      <CropDetailModal
        crop={selectedCropForDetail}
        isOpen={!!selectedCropForDetail}
        onClose={() => setSelectedCropForDetail(null)}
        onInitiateHandoff={(crop) => {
          setSelectedCropForDetail(null);
          handleInitiateHandoff(crop);
        }}
        onUpdateCrop={handleUpdateCrop}
        onOpenFreshnessCalculator={(cropName) => {
          setFreshnessCropName(cropName);
          setIsFreshnessOpen(true);
        }}
      />

      {/* 3. Freshness Assessment Modal */}
      <FreshnessCalculatorModal
        initialCropName={freshnessCropName}
        isOpen={isFreshnessOpen}
        onClose={() => setIsFreshnessOpen(false)}
        onOpenRecoveryForProduce={(cropName, notes) => {
          setIsFreshnessOpen(false);
          setIsRegisterWasteOpen(true);
        }}
      />

      {/* 4. Photo Analysis Modal */}
      <PhotoAnalysisModal
        isOpen={isPhotoAnalysisOpen}
        onClose={() => setIsPhotoAnalysisOpen(false)}
        onConfirmCropIdentification={handleConfirmPhotoIdentification}
      />

      {/* 5. Harvest-to-Recovery Handoff Modal */}
      <HarvestToRecoveryModal
        crop={handoffCrop}
        isOpen={isHandoffOpen}
        onClose={() => {
          setIsHandoffOpen(false);
          setHandoffCrop(null);
        }}
        onConfirmHandoff={handleConfirmHandoff}
      />

      {/* 6. Register Waste Modal */}
      <RegisterWasteModal
        isOpen={isRegisterWasteOpen}
        onClose={() => setIsRegisterWasteOpen(false)}
        onSaveWaste={handleSaveWaste}
        defaultLocation={settings.farm.defaultLocation || settings.profile.location}
        defaultContactName={settings.profile.fullName}
        defaultContactPhone={settings.profile.phone}
      />

      {/* 7. Waste Detail Modal */}
      <WasteDetailModal
        wasteRecord={selectedWasteForDetail}
        isOpen={!!selectedWasteForDetail}
        onClose={() => setSelectedWasteForDetail(null)}
        onOpenMatches={(record) => {
          setSelectedWasteForDetail(null);
          setMatchingWasteRecord(record);
        }}
        onOpenRequest={(record) => {
          setSelectedWasteForDetail(null);
          const partner = RECOVERY_PARTNERS_DATABASE.find((p) => p.id === record.selectedPartnerId) || RECOVERY_PARTNERS_DATABASE[0];
          handleSelectPartnerForRequest(partner, record);
        }}
      />

      {/* 8. Partner Matches Modal */}
      <PartnerMatchesModal
        wasteRecord={matchingWasteRecord}
        isOpen={!!matchingWasteRecord}
        onClose={() => setMatchingWasteRecord(null)}
        onSelectPartnerForRequest={handleSelectPartnerForRequest}
      />

      {/* 9. Collection Request Modal */}
      <CollectionRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setRequestTargetWaste(null);
          setRequestTargetPartner(null);
        }}
        wasteRecord={requestTargetWaste}
        partner={requestTargetPartner}
        existingRequest={requests.find((r) => r.wasteRecordId === requestTargetWaste?.id)}
        onSaveRequest={handleSaveRequest}
      />

      {/* 10. PRD Principles & Guide Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onResetDemo={handleResetDemo}
        onOpenSplash={() => setShowSplash(true)}
      />

      {/* 11. Surplus & Waste Route Advisor Modal */}
      <SurplusAdvisorModal
        isOpen={isSurplusAdvisorOpen}
        onClose={() => setIsSurplusAdvisorOpen(false)}
        onProceedToRegister={handleProceedFromSurplusAdvisor}
      />

      {/* 12. Gather AI Context-Aware Assistant Modal */}
      <GatherAiAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => {
          setIsAssistantOpen(false);
          setAssistantPrompt(undefined);
        }}
        activeTab={activeTab}
        currentCrop={selectedCropForDetail}
        currentWaste={selectedWasteForDetail || matchingWasteRecord}
        currentPartner={requestTargetPartner}
        totalCropsCount={crops.length}
        totalWasteCount={wasteRecords.length}
        pendingRequestsCount={impactSummary.pendingRequestsCount}
        activeHarvestCrops={crops
          .filter((c) => c.currentStage === 'Harvest Window Active' || c.currentStage === 'Ripening & Maturation')
          .map((c) => c.cropName)}
        flaggedSurplusCrops={crops
          .filter((c) => c.hasSurplusFlagged)
          .map((c) => c.cropName)}
        initialQuestion={assistantPrompt}
        showFollowUpSuggestions={settings.ai.showFollowUpSuggestions}
        onNavigate={setActiveTab}
        onOpenAddCrop={() => {
          setIsAssistantOpen(false);
          setIsAddCropOpen(true);
        }}
        onOpenRegisterWaste={() => {
          setIsAssistantOpen(false);
          setIsRegisterWasteOpen(true);
        }}
      />

      {/* Floating Action Button (FAB) - Ask Gather AI */}
      <button
        onClick={() => handleOpenAssistant()}
        className="fixed left-auto right-4 bottom-4 sm:right-6 sm:bottom-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#183E2E] to-[#245C43] text-white shadow-xl hover:shadow-2xl border border-[#85B96F]/40 hover:border-[#D7E8A3] transition-all transform hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer [bottom:max(16px,calc(16px+env(safe-area-inset-bottom,0px)))] sm:[bottom:max(24px,calc(24px+env(safe-area-inset-bottom,0px)))] [right:max(16px,calc(16px+env(safe-area-inset-right,0px)))] sm:[right:max(24px,calc(24px+env(safe-area-inset-right,0px)))]"
        title="Ask Gather AI (Shared Intelligence)"
        aria-label="Ask Gather AI"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[#D7E8A3] group-hover:scale-110 transition-transform">
          <Sparkles className="w-3.5 h-3.5 text-[#D7E8A3]" />
        </div>
        <span className="text-xs font-bold tracking-wide text-white">Ask Gather AI</span>
        <span className="hidden sm:inline-block text-[10px] bg-[#D7E8A3] text-[#183E2E] font-semibold px-2 py-0.5 rounded-full">
          Brain
        </span>
      </button>

      {/* Production Splash Screen */}
      {showSplash && (
        <SplashScreen
          onComplete={() => setShowSplash(false)}
        />
      )}
    </div>
  );
};

export default App;
