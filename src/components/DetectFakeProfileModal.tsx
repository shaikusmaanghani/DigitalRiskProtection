import React, { useState } from 'react';
import {
  Users,
  Search,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  X,
  Gavel,
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  Plus,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { BrandProfile } from '../types';

interface DetectFakeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: BrandProfile[];
  onThreatAdded: () => void;
  onOpenTakedownWithData?: (data: any) => void;
}

export const DetectFakeProfileModal: React.FC<DetectFakeProfileModalProps> = ({
  isOpen,
  onClose,
  brands,
  onThreatAdded,
  onOpenTakedownWithData,
}) => {
  const [handle, setHandle] = useState('@ApexF1n_Support');
  const [displayName, setDisplayName] = useState('ApexFin Customer Care & Helpdesk');
  const [platform, setPlatform] = useState('twitter');
  const [bio, setBio] = useState('Official 24/7 ApexFin Helpdesk. DM for instant wallet unfreeze & KYC verification. Link: apexfin-verify[.]net');
  const [followerCount, setFollowerCount] = useState(250);
  const [followingCount, setFollowingCount] = useState(3800);
  const [accountAgeDays, setAccountAgeDays] = useState(4);
  const [isVerified, setIsVerified] = useState(false);
  const [externalLink, setExternalLink] = useState('https://apexfin-verify.net');
  const [brandId, setBrandId] = useState(brands[0]?.id || '');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset demo scenarios
  const applyPreset = (presetType: 'fake_support' | 'fake_ceo' | 'fake_giveaway' | 'official_safe') => {
    setError(null);
    setDetectionResult(null);

    if (presetType === 'fake_support') {
      setHandle('@ApexF1n_Support');
      setDisplayName('ApexFin Customer Care & Helpdesk');
      setPlatform('twitter');
      setBio('Official 24/7 ApexFin Helpdesk. DM for instant transaction unfreeze & KYC recovery.');
      setFollowerCount(180);
      setFollowingCount(4200);
      setAccountAgeDays(3);
      setIsVerified(false);
      setExternalLink('https://apexfin-helpdesk-verify.xyz');
      setBrandId(brands[0]?.id || '');
    } else if (presetType === 'fake_ceo') {
      setHandle('@VortexAl_CEO');
      setDisplayName('Devon Ray (CEO VortexAI)');
      setPlatform('twitter');
      setBio('Co-Founder & CEO at @VortexAI. Exclusive API credit vouchers and test models available.');
      setFollowerCount(890);
      setFollowingCount(120);
      setAccountAgeDays(6);
      setIsVerified(false);
      setExternalLink('https://vortex-preview-grants.org');
      setBrandId(brands[1]?.id || brands[0]?.id || '');
    } else if (presetType === 'fake_giveaway') {
      setHandle('@ApexFin_VIP_Airdrop');
      setDisplayName('ApexFin VIP Airdrop & Bonus Rewards');
      setPlatform('telegram');
      setBio('Official celebration airdrop! Deposit 0.1 ETH to receive 2,500 APEX tokens immediately.');
      setFollowerCount(15000);
      setFollowingCount(10);
      setAccountAgeDays(8);
      setIsVerified(false);
      setExternalLink('https://claim-apexfin-airdrop.net');
      setBrandId(brands[0]?.id || '');
    } else if (presetType === 'official_safe') {
      setHandle('@ApexFinGlobal');
      setDisplayName('ApexFin Global Official');
      setPlatform('twitter');
      setBio('The premier institutional digital banking and wealth platform. Member FDIC.');
      setFollowerCount(185000);
      setFollowingCount(420);
      setAccountAgeDays(1420);
      setIsVerified(true);
      setExternalLink('https://apexfin.com');
      setBrandId(brands[0]?.id || '');
    }
  };

  const handleRunDetection = async (saveToDb = false) => {
    if (!handle.trim()) {
      setError('Please provide a profile handle / username');
      return;
    }
    setError(null);
    setIsAnalyzing(true);

    try {
      const res = await api.analyzeFakeProfile({
        handle: handle.trim(),
        displayName: displayName.trim(),
        platform,
        bio: bio.trim(),
        followerCount: Number(followerCount),
        followingCount: Number(followingCount),
        accountAgeDays: Number(accountAgeDays),
        isVerified,
        externalLink: externalLink.trim(),
        brandId,
        saveToDatabase: saveToDb,
      });

      setDetectionResult(res);
      if (saveToDb) {
        onThreatAdded();
      }
    } catch (err: any) {
      console.error('Detection failed:', err);
      setError(err.message || 'Detection failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#090e1a] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Real-Time Fake Social Profile Detector</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  AI FORENSICS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspect any profile handle, analyze homoglyphs, check official exclusions, and calculate threat probability.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-200">
          {/* Quick Presets Bar */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1-Click Preset Demonstrations:
              </span>
              <span className="text-[10px] text-slate-500">Test algorithm & exclusions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('fake_support')}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 font-medium transition"
              >
                🚨 Fake Support Imposter (@ApexF1n_Support)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('fake_ceo')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50 font-medium transition"
              >
                ⚠️ Executive Impersonation (@VortexAl_CEO)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('fake_giveaway')}
                className="px-2.5 py-1.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-800/50 font-medium transition"
              >
                🎁 Telegram Airdrop Scam (@ApexFin_VIP)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('official_safe')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 font-medium transition"
              >
                🛡️ Verified Official Account (@ApexFinGlobal)
              </button>
            </div>
          </div>

          {/* Input Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Handle / Username *</label>
              <input
                type="text"
                placeholder="e.g. @ApexF1n_Support"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
              >
                <option value="twitter">X / Twitter</option>
                <option value="telegram">Telegram</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Display Name</label>
              <input
                type="text"
                placeholder="e.g. ApexFin Helpdesk"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
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
                    {b.name} ({b.industry})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">Profile Bio / Description</label>
              <textarea
                rows={2}
                placeholder="Paste the profile bio, customer service hooks, or link description..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 md:col-span-2">
              <div>
                <label className="block text-slate-400 text-[10px] uppercase mb-1">Followers</label>
                <input
                  type="number"
                  value={followerCount}
                  onChange={(e) => setFollowerCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] uppercase mb-1">Following</label>
                <input
                  type="number"
                  value={followingCount}
                  onChange={(e) => setFollowingCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] uppercase mb-1">Age (Days)</label>
                <input
                  type="number"
                  value={accountAgeDays}
                  onChange={(e) => setAccountAgeDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-cyan-500"
                />
                <span className="text-slate-300">Account has Platform Verified Checkmark</span>
              </label>

              <button
                type="button"
                onClick={() => handleRunDetection(false)}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Analyzing Homoglyphs & Bio...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Run Fake Profile Detection</span>
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

          {/* Detection Results Display */}
          {detectionResult && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-5 animate-fade-in">
              {/* Verdict Header Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      detectionResult.verdict === 'OFFICIAL_VERIFIED_ASSET'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : detectionResult.isFake
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {detectionResult.verdict === 'OFFICIAL_VERIFIED_ASSET' ? (
                      <ShieldCheck className="w-6 h-6" />
                    ) : (
                      <ShieldAlert className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        detectionResult.verdict === 'OFFICIAL_VERIFIED_ASSET'
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
                      Evaluated against Brand: <strong className="text-cyan-400">{detectionResult.matchedBrand}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] text-slate-400">Calculated Risk:</span>
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
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">
                    Visual / Phonetic Match
                  </span>
                  <span className="text-base font-bold font-mono text-cyan-300">
                    {detectionResult.similarityScore}%
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Levenshtein similarity to brand trademark</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">
                    Homoglyphs Uncovered
                  </span>
                  <span className="text-sm font-bold text-purple-300">
                    {detectionResult.homoglyphsDetected.length > 0
                      ? `${detectionResult.homoglyphsDetected.length} Spoofed Glyphs`
                      : 'None'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">
                    {detectionResult.homoglyphsDetected[0] || 'Standard ASCII characters'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">
                    Exclusion Whitelist Status
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      detectionResult.isWhitelisted ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {detectionResult.isWhitelisted ? 'Excluded (Official Asset)' : 'Not in Exclusions'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Checked brand whitelist repository</p>
                </div>
              </div>

              {/* Gemini AI Cyber Forensics */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                <div className="flex items-center gap-2 mb-2 text-indigo-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Gemini 3.8 Flash Threat Forensics</span>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {detectionResult.aiForensics}
                </div>
              </div>

              {/* Actions row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs text-cyan-300 font-semibold font-mono">
                  Recommended: {detectionResult.recommendedAction}
                </span>

                <div className="flex items-center gap-2">
                  {detectionResult.isFake && (
                    <button
                      type="button"
                      onClick={() => handleRunDetection(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    >
                      + Save to Active Threats
                    </button>
                  )}

                  {detectionResult.isFake && onOpenTakedownWithData && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenTakedownWithData({
                          targetEntity: handle,
                          platform,
                          brandName: detectionResult.matchedBrand,
                          legalGrounds: 'TRADEMARK_INFRINGEMENT',
                        });
                      }}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm"
                    >
                      <Gavel className="w-3.5 h-3.5" />
                      <span>Dispatch Takedown Notice</span>
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
