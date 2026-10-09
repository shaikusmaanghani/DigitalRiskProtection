import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthView } from './components/AuthView';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { SocialThreatsView } from './components/SocialThreatsView';
import { MobileAppsView } from './components/MobileAppsView';
import { LookalikeHunterView } from './components/LookalikeHunterView';
import { BrandProfilesView } from './components/BrandProfilesView';
import { TakedownsView } from './components/TakedownsView';
import { AiCopilotView } from './components/AiCopilotView';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { ThreatDetailModal } from './components/ThreatDetailModal';
import { ScanModal } from './components/ScanModal';
import { DetectFakeProfileModal } from './components/DetectFakeProfileModal';
import { DetectFakeAppModal } from './components/DetectFakeAppModal';
import { api } from './services/api';
import {
  BrandProfile,
  DashboardStats,
  MobileAppThreat,
  SocialImpersonation,
  TakedownRequest,
} from './types';
import { RefreshCw, X } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();

  const [activeView, setActiveView] = useState('dashboard');
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [socialThreats, setSocialThreats] = useState<SocialImpersonation[]>([]);
  const [mobileThreats, setMobileThreats] = useState<MobileAppThreat[]>([]);
  const [takedowns, setTakedowns] = useState<TakedownRequest[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Modals & Drawers state
  const [inspectedThreat, setInspectedThreat] = useState<any | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isDetectProfileOpen, setIsDetectProfileOpen] = useState(false);
  const [isDetectAppOpen, setIsDetectAppOpen] = useState(false);
  const [copilotContextThreat, setCopilotContextThreat] = useState<any | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    try {
      const [brandsRes, statsRes, socialRes, mobileRes, takedownsRes] = await Promise.all([
        api.getBrands(),
        api.getDashboardStats(),
        api.getSocialThreats(),
        api.getMobileThreats(),
        api.getTakedowns(),
      ]);

      setBrands(brandsRes.brands);
      setDashboardStats(statsRes);
      setSocialThreats(socialRes.threats);
      setMobileThreats(mobileRes.threats);
      setTakedowns(takedownsRes.takedowns);
    } catch (err) {
      console.error('Error fetching platform data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060911] text-cyan-400 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="text-xs font-mono tracking-widest uppercase">
          Initializing SentinelShield SOC...
        </span>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  // Filtered threats based on active brand selector in Navbar
  const currentSocialThreats =
    selectedBrandId === 'all'
      ? socialThreats
      : socialThreats.filter((t) => t.brandId === selectedBrandId);

  const currentMobileThreats =
    selectedBrandId === 'all'
      ? mobileThreats
      : mobileThreats.filter((t) => t.brandId === selectedBrandId);

  const criticalCount =
    currentSocialThreats.filter((t) => t.threatLevel === 'CRITICAL').length +
    currentMobileThreats.filter((t) => t.threatLevel === 'CRITICAL').length;

  // Actions
  const handleInspectThreat = (threat: any) => {
    setInspectedThreat(threat);
  };

  const handleStatusChange = async (threatId: string, newStatus: string, isSocial: boolean) => {
    try {
      if (isSocial) {
        await api.updateSocialThreatStatus(threatId, newStatus);
      } else {
        await api.updateMobileThreatStatus(threatId, newStatus);
      }
      showToast(`Threat status updated to ${newStatus}`);
      loadAllData();
      if (inspectedThreat?.id === threatId) {
        setInspectedThreat((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleWhitelistThreat = async (threatId: string) => {
    try {
      await api.updateSocialThreatStatus(threatId, 'WHITELISTED');
      showToast('Asset added to Brand Official Exclusions list.');
      loadAllData();
    } catch (err) {
      console.error('Failed to whitelist threat:', err);
    }
  };

  const handleInitiateTakedown = async (threat: any) => {
    const isSoc = 'handle' in threat;
    const targetEntity = isSoc ? threat.handle : threat.packageName;
    const platform = isSoc ? threat.platform : threat.store;

    try {
      const res = await api.createTakedown({
        threatId: threat.id,
        threatType: isSoc ? 'social' : 'mobile_app',
        targetEntity,
        platform,
        legalGrounds: 'TRADEMARK_INFRINGEMENT',
      });

      showToast(`Takedown demand generated (Ticket: ${res.takedown.ticketReference})`);
      setInspectedThreat(null);
      loadAllData();
      setActiveView('takedowns');
    } catch (err: any) {
      console.error('Failed to initiate takedown:', err);
      showToast('Failed to initiate takedown');
    }
  };

  const handleOpenTakedownWithCustomData = async (data: {
    targetEntity: string;
    platform: string;
    brandName: string;
    legalGrounds?: string;
  }) => {
    try {
      const res = await api.createTakedown({
        threatId: `ad_hoc_${Date.now()}`,
        threatType:
          data.platform.includes('play') || data.platform.includes('apk') || data.platform.includes('aptoide')
            ? 'mobile_app'
            : 'social',
        targetEntity: data.targetEntity,
        platform: data.platform,
        legalGrounds: (data.legalGrounds as any) || 'TRADEMARK_INFRINGEMENT',
      });
      showToast(`Takedown demand generated (Ticket: ${res.takedown.ticketReference})`);
      loadAllData();
      setActiveView('takedowns');
    } catch (err: any) {
      console.error('Failed to create takedown:', err);
      showToast('Failed to create takedown');
    }
  };

  const handleOpenAiWithContext = (threat: any) => {
    setCopilotContextThreat(threat);
    setInspectedThreat(null);
    setActiveView('copilot');
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        brands={brands}
        selectedBrandId={selectedBrandId}
        onSelectBrandId={setSelectedBrandId}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        isScanning={isScanning}
        onToggleAiDrawer={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
        activeView={activeView}
        setActiveView={setActiveView}
        criticalCount={criticalCount}
      />

      {/* Main Body */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          threatsCount={{
            social: currentSocialThreats.length,
            mobile: currentMobileThreats.length,
            takedowns: takedowns.length,
            critical: criticalCount,
          }}
        />

        {/* Center Content View Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeView === 'dashboard' && (
            <DashboardView
              stats={dashboardStats}
              socialThreats={currentSocialThreats}
              mobileThreats={currentMobileThreats}
              onInspectThreat={handleInspectThreat}
              onNavigateToView={setActiveView}
              onTriggerScan={() => setIsScanModalOpen(true)}
              isScanning={isScanning}
              onOpenDetectProfileModal={() => setIsDetectProfileOpen(true)}
              onOpenDetectAppModal={() => setIsDetectAppOpen(true)}
            />
          )}

          {activeView === 'social' && (
            <SocialThreatsView
              threats={currentSocialThreats}
              brands={brands}
              onInspectThreat={handleInspectThreat}
              onInitiateTakedown={handleInitiateTakedown}
              onWhitelistThreat={handleWhitelistThreat}
              onQuickAiAnalyze={handleOpenAiWithContext}
              onOpenDetectProfileModal={() => setIsDetectProfileOpen(true)}
            />
          )}

          {activeView === 'mobile' && (
            <MobileAppsView
              threats={currentMobileThreats}
              brands={brands}
              onInspectThreat={handleInspectThreat}
              onInitiateTakedown={handleInitiateTakedown}
              onQuickAiAnalyze={handleOpenAiWithContext}
              onOpenDetectAppModal={() => setIsDetectAppOpen(true)}
            />
          )}

          {activeView === 'lookalike' && (
            <LookalikeHunterView brands={brands} />
          )}

          {activeView === 'brands' && (
            <BrandProfilesView brands={brands} onRefreshBrands={loadAllData} />
          )}

          {activeView === 'takedowns' && (
            <TakedownsView takedowns={takedowns} onRefreshTakedowns={loadAllData} />
          )}

          {activeView === 'copilot' && (
            <AiCopilotView
              contextThreat={copilotContextThreat}
              onClearContext={() => setCopilotContextThreat(null)}
            />
          )}

          {activeView === 'database' && <DatabaseSchemaView />}
        </main>
      </div>

      {/* Threat Detail Modal */}
      {inspectedThreat && (
        <ThreatDetailModal
          threat={inspectedThreat}
          onClose={() => setInspectedThreat(null)}
          onStatusChange={(newStatus) =>
            handleStatusChange(
              inspectedThreat.id,
              newStatus,
              'handle' in inspectedThreat
            )
          }
          onOpenAiCopilotWithContext={handleOpenAiWithContext}
          onInitiateTakedown={handleInitiateTakedown}
        />
      )}

      {/* Deep Scan Modal */}
      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        brandId={selectedBrandId === 'all' ? undefined : selectedBrandId}
        onScanComplete={loadAllData}
      />

      {/* Real-time Detect Fake Profile Modal */}
      <DetectFakeProfileModal
        isOpen={isDetectProfileOpen}
        onClose={() => setIsDetectProfileOpen(false)}
        brands={brands}
        onThreatAdded={loadAllData}
        onOpenTakedownWithData={handleOpenTakedownWithCustomData}
      />

      {/* Real-time Detect Fake App Modal */}
      <DetectFakeAppModal
        isOpen={isDetectAppOpen}
        onClose={() => setIsDetectAppOpen(false)}
        brands={brands}
        onThreatAdded={loadAllData}
        onOpenTakedownWithData={handleOpenTakedownWithCustomData}
      />

      {/* Slide-out AI Copilot Drawer (Quick Access) */}
      {isAiDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#090e1a] border-l border-indigo-500/30 shadow-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Threat Copilot (Quick Assist)</span>
            </span>
            <button
              onClick={() => setIsAiDrawerOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden pt-2">
            <AiCopilotView
              contextThreat={copilotContextThreat}
              onClearContext={() => setCopilotContextThreat(null)}
            />
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-cyan-950/90 text-cyan-200 border border-cyan-500/40 text-xs font-medium shadow-2xl shadow-cyan-500/20 animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
