import React, { useState } from 'react';
import {
  Smartphone,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  X,
  Gavel,
  RefreshCw,
  Copy,
  Check,
  Terminal,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { BrandProfile } from '../types';

interface DetectFakeAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: BrandProfile[];
  onThreatAdded: () => void;
  onOpenTakedownWithData?: (data: any) => void;
}

export const DetectFakeAppModal: React.FC<DetectFakeAppModalProps> = ({
  isOpen,
  onClose,
  brands,
  onThreatAdded,
  onOpenTakedownWithData,
}) => {
  const [title, setTitle] = useState('ApexFin Mobile Wallet & Pay');
  const [packageName, setPackageName] = useState('com.apexfin.mobile.quickpay');
  const [store, setStore] = useState('apkpure');
  const [developerName, setDeveloperName] = useState('Apex FinTech Global Devs (Unauthorized)');
  const [brandId, setBrandId] = useState(brands[0]?.id || '');
  const [downloadCount, setDownloadCount] = useState('15,000+');
  const [sha256Hash, setSha256Hash] = useState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

  // Permission toggles
  const [hasSms, setHasSms] = useState(true);
  const [hasOverlay, setHasOverlay] = useState(true);
  const [hasAccessibility, setHasAccessibility] = useState(false);
  const [hasInstaller, setHasInstaller] = useState(true);
  const [hasCamera, setHasCamera] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const applyPreset = (preset: 'banking_trojan' | 'fake_crypto' | 'adware' | 'official_safe') => {
    setError(null);
    setDetectionResult(null);

    if (preset === 'banking_trojan') {
      setTitle('ApexFin Mobile Wallet & Pay');
      setPackageName('com.apexfin.mobile.quickpay');
      setStore('apkpure');
      setDeveloperName('Apex FinTech Global Devs (Unauthorized)');
      setDownloadCount('15,000+');
      setBrandId(brands[0]?.id || '');
      setHasSms(true);
      setHasOverlay(true);
      setHasAccessibility(false);
      setHasInstaller(true);
      setHasCamera(false);
    } else if (preset === 'fake_crypto') {
      setTitle('Apex Crypto Vault & Staking');
      setPackageName('com.apex.cryptovault.fin');
      setStore('aptoide');
      setDeveloperName('Vault Tech Solutions LLC');
      setDownloadCount('3,200+');
      setBrandId(brands[0]?.id || '');
      setHasSms(false);
      setHasOverlay(false);
      setHasAccessibility(false);
      setHasInstaller(false);
      setHasCamera(true);
    } else if (preset === 'adware') {
      setTitle('VortexAI Assistant Pro & Prompt Studio');
      setPackageName('io.vortexai.promptgenerator.free');
      setStore('google_play');
      setDeveloperName('CloudTools Pro Studio');
      setDownloadCount('50,000+');
      setBrandId(brands[1]?.id || brands[0]?.id || '');
      setHasSms(false);
      setHasOverlay(false);
      setHasAccessibility(false);
      setHasInstaller(false);
      setHasCamera(false);
    } else if (preset === 'official_safe') {
      setTitle('ApexFin Official Mobile Banking');
      setPackageName('com.apexfin.mobile');
      setStore('google_play');
      setDeveloperName('ApexFin Global Inc.');
      setDownloadCount('500,000+');
      setBrandId(brands[0]?.id || '');
      setHasSms(false);
      setHasOverlay(false);
      setHasAccessibility(false);
      setHasInstaller(false);
      setHasCamera(false);
    }
  };

  const handleRunDetection = async (saveToDb = false) => {
    if (!packageName.trim() && !title.trim()) {
      setError('Please provide app title and package name');
      return;
    }
    setError(null);
    setIsAnalyzing(true);

    const activePermissions: string[] = ['android.permission.INTERNET'];
    if (hasSms) activePermissions.push('android.permission.RECEIVE_SMS (SMS Intercept)');
    if (hasOverlay) activePermissions.push('android.permission.SYSTEM_ALERT_WINDOW (Overlay Attack)');
    if (hasAccessibility) activePermissions.push('android.permission.BIND_ACCESSIBILITY_SERVICE (Keylogger)');
    if (hasInstaller) activePermissions.push('android.permission.REQUEST_INSTALL_PACKAGES (Silent Dropper)');
    if (hasCamera) activePermissions.push('android.permission.CAMERA');

    try {
      const res = await api.analyzeFakeApp({
        title: title.trim(),
        packageName: packageName.trim(),
        store,
        developerName: developerName.trim(),
        permissions: activePermissions,
        brandId,
        downloadCount,
        sha256Hash: sha256Hash.trim(),
        saveToDatabase: saveToDb,
      });

      setDetectionResult(res);
      if (saveToDb) {
        onThreatAdded();
      }
    } catch (err: any) {
      console.error('App detection failed:', err);
      setError(err.message || 'Detection failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#090e1a] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Real-Time Suspicious Mobile App & Rogue APK Detector</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/30">
                  APK REVERSE RADAR
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspect APK binaries, identify Trojan overlay vectors, evaluate abuse permissions, and cross-reference authorized app IDs.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-200">
          {/* Presets */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1-Click APK Test Demonstrations:
              </span>
              <span className="text-[10px] text-slate-500">Test malware signatures & authorized whitelists</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('banking_trojan')}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 font-medium transition"
              >
                🚨 Banking Trojan (SMS + Overlay)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('fake_crypto')}
                className="px-2.5 py-1.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-800/50 font-medium transition"
              >
                🪙 Fake Crypto Sweeper APK
              </button>
              <button
                type="button"
                onClick={() => applyPreset('adware')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50 font-medium transition"
              >
                ⚠️ Google Play Adware Imposter
              </button>
              <button
                type="button"
                onClick={() => applyPreset('official_safe')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 font-medium transition"
              >
                🛡️ Verified Official App (com.apexfin.mobile)
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-300 font-medium mb-1">App Title *</label>
              <input
                type="text"
                placeholder="e.g. ApexFin Mobile Wallet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Package Name (Identifier) *</label>
              <input
                type="text"
                placeholder="e.g. com.apexfin.mobile.quickpay"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Store / Repository Origin</label>
              <select
                value={store}
                onChange={(e) => setStore(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
              >
                <option value="google_play">Google Play Store</option>
                <option value="apkpure">APKPure (Third-Party Repository)</option>
                <option value="aptoide">Aptoide</option>
                <option value="telegram_repo">Telegram Direct APK Channel</option>
                <option value="apple_app_store">Apple App Store</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Protected Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Developer Signature</label>
              <input
                type="text"
                placeholder="e.g. Apex FinTech Global Devs"
                value={developerName}
                onChange={(e) => setDeveloperName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Estimated Victim Downloads</label>
              <input
                type="text"
                placeholder="e.g. 15,000+"
                value={downloadCount}
                onChange={(e) => setDownloadCount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Permission Flags */}
            <div className="md:col-span-2 space-y-2 pt-2 border-t border-slate-800">
              <span className="block text-slate-300 font-medium text-[11px] uppercase tracking-wider">
                Requested Android System Permissions (Abuse Vectors):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSms}
                    onChange={(e) => setHasSms(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-rose-500"
                  />
                  <span className="text-rose-300">RECEIVE_SMS (Banking OTP Intercept)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasOverlay}
                    onChange={(e) => setHasOverlay(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-rose-500"
                  />
                  <span className="text-rose-300">SYSTEM_ALERT_WINDOW (Overlay Attack)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAccessibility}
                    onChange={(e) => setHasAccessibility(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500"
                  />
                  <span className="text-amber-300">BIND_ACCESSIBILITY_SERVICE (Keylogger)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInstaller}
                    onChange={(e) => setHasInstaller(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-rose-500"
                  />
                  <span className="text-rose-300">REQUEST_INSTALL_PACKAGES (Silent Dropper)</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleRunDetection(false)}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 transition shadow-lg shadow-amber-500/25 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Dissecting APK Permissions & Hash...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Run Fake App Detection</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300">
              {error}
            </div>
          )}

          {/* Results display */}
          {detectionResult && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-5 animate-fade-in">
              {/* Header Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      detectionResult.isOfficialApp
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : detectionResult.isFake
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {detectionResult.isOfficialApp ? (
                      <ShieldCheck className="w-6 h-6" />
                    ) : (
                      <ShieldAlert className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        detectionResult.isOfficialApp
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : detectionResult.isFake
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {detectionResult.verdict.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {detectionResult.verdictTitle}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Impersonated Brand: <strong className="text-cyan-400">{detectionResult.matchedBrand}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] text-slate-400">Composite Risk:</span>
                  <span
                    className={`text-2xl font-black font-mono ${
                      detectionResult.riskScore >= 80
                        ? 'text-rose-400'
                        : detectionResult.riskScore >= 50
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {detectionResult.riskScore}/100
                  </span>
                </div>
              </div>

              {/* Forensic Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Attack Vector</span>
                  <span className="text-sm font-bold text-amber-300 font-mono capitalize">
                    {detectionResult.detectionVector?.replace(/_/g, ' ')}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Malware classification type</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">
                    Flagged Permissions
                  </span>
                  <span className="text-sm font-bold text-rose-300">
                    {detectionResult.abusePermissions?.length || 0} Critical Permissions
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Including SMS and overlay hooks</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">
                    Authorized App Match
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      detectionResult.isOfficialApp ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {detectionResult.isOfficialApp ? 'Authorized Official App' : 'Unauthorized Binary'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Compared with brand app registry</p>
                </div>
              </div>

              {/* AI Forensics Report */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                <div className="flex items-center gap-2 mb-2 text-indigo-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Gemini 3.8 Flash Mobile Malware Assessment</span>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {detectionResult.aiForensics}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs text-amber-300 font-semibold font-mono">
                  Recommended: {detectionResult.recommendedAction}
                </span>

                <div className="flex items-center gap-2">
                  {detectionResult.isFake && (
                    <button
                      type="button"
                      onClick={() => handleRunDetection(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    >
                      + Save to Active Rogue APKs
                    </button>
                  )}

                  {detectionResult.isFake && onOpenTakedownWithData && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenTakedownWithData({
                          targetEntity: packageName,
                          platform: store,
                          brandName: detectionResult.matchedBrand,
                          legalGrounds: 'PHISHING_FRAUD',
                        });
                      }}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm"
                    >
                      <Gavel className="w-3.5 h-3.5" />
                      <span>Issue Platform Removal Notice</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
