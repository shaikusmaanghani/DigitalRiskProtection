import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Gavel,
  CheckCircle,
  Copy,
  Check,
  Building,
  Calendar,
  Users,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { SocialImpersonation, MobileAppThreat } from '../types';
import { api } from '../services/api';

interface ThreatDetailModalProps {
  threat: (SocialImpersonation | MobileAppThreat) & { type?: 'social' | 'mobile_app' };
  onClose: () => void;
  onStatusChange: (newStatus: string) => void;
  onOpenAiCopilotWithContext: (threat: any) => void;
  onInitiateTakedown: (threat: any) => void;
}

export const ThreatDetailModal: React.FC<ThreatDetailModalProps> = ({
  threat,
  onClose,
  onStatusChange,
  onOpenAiCopilotWithContext,
  onInitiateTakedown,
}) => {
  const isSocial = 'handle' in threat;
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleGenerateAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeThreatWithAi(
        isSocial ? 'Social Media Impersonation' : 'Rogue Mobile App',
        threat
      );
      setAiAnalysis(res.analysis);
    } catch (err) {
      console.error('Failed to analyze threat:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#090e1a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                threat.threatLevel === 'CRITICAL'
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                  : threat.threatLevel === 'HIGH'
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                  : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isSocial ? (threat as SocialImpersonation).displayName : (threat as MobileAppThreat).title}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    threat.threatLevel === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : threat.threatLevel === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {threat.threatLevel} RISK ({threat.riskScore}/100)
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Brand Target: <span className="text-cyan-400 font-semibold">{threat.brandName}</span> • Detected:{' '}
                {new Date(threat.detectedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Side by side comparison: Official Brand vs Imposter Asset */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Imposter Target Card */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold tracking-wider text-rose-400 uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Flagged Imposter Asset
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {isSocial ? (threat as SocialImpersonation).platform : (threat as MobileAppThreat).store}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Identifier / Handle:</span>
                  <span className="font-mono text-sm font-bold text-rose-200">
                    {isSocial ? (threat as SocialImpersonation).handle : (threat as MobileAppThreat).packageName}
                  </span>
                </div>

                {isSocial && (
                  <>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Bio & Phishing Hook:</span>
                      <p className="text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-slate-200">
                        "{(threat as SocialImpersonation).bioSnippet}"
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Followers:</span>
                        <span className="text-white">{(threat as SocialImpersonation).followerCount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Following:</span>
                        <span className="text-white">{(threat as SocialImpersonation).followingCount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Account Age:</span>
                        <span className="text-rose-400 font-semibold">{(threat as SocialImpersonation).accountAgeDays} days</span>
                      </div>
                    </div>
                  </>
                )}

                {!isSocial && (
                  <>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Rogue Developer:</span>
                      <span className="font-semibold text-rose-300">{(threat as MobileAppThreat).developerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Abuse Permissions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(threat as MobileAppThreat).abusePermissions.map((perm, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">SHA-256 Hash:</span>
                      <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 font-mono text-[10px] text-slate-400">
                        <span className="truncate">{(threat as MobileAppThreat).sha256Hash}</span>
                        <button
                          onClick={() => copyText((threat as MobileAppThreat).sha256Hash)}
                          className="text-cyan-400 hover:text-cyan-300 ml-2"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Official Brand Baseline */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Official Trademark Baseline
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  VERIFIED ASSET
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Official Brand Name:</span>
                  <span className="font-semibold text-white text-sm">{threat.brandName}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Official Verified Domain(s):</span>
                  <div className="space-y-1 mt-1">
                    <span className="inline-block px-2 py-1 rounded bg-slate-950 text-cyan-300 font-mono text-xs border border-slate-800">
                      https://{threat.brandName.toLowerCase().replace(/\s+/g, '')}.com
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Enforcement Rule Applied:</span>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Account not listed in registered <strong>Official-Account Exclusions</strong>. Flagged by{' '}
                    <span className="text-cyan-400 font-mono">Levenshtein similarity & keyword heuristics</span>.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onStatusChange('WHITELISTED')}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Confirm as Official (Add to Exclusions)</span>
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-1">
                    Permanently suppresses future alerts for this identifier
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factors Breakdown */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Detection Mechanics & Risk Scoring
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">Similarity Index</span>
                <span className="text-lg font-bold font-mono text-cyan-400">
                  {isSocial ? `${(threat as SocialImpersonation).similarityScore}%` : 'High Visual'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Permutation Match</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">Composite Risk</span>
                <span
                  className={`text-lg font-bold font-mono ${
                    threat.riskScore >= 80 ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {threat.riskScore}/100
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Scoring Model v2</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">Detection Vector</span>
                <span className="text-xs font-bold text-white capitalize block mt-1 truncate">
                  {isSocial
                    ? (threat as SocialImpersonation).detectionType.replace('_', ' ')
                    : (threat as MobileAppThreat).detectionVector.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Attack Classification</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">Current Status</span>
                <span className="text-xs font-bold font-mono text-amber-300 block mt-1">
                  {threat.status}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Workflow State</span>
              </div>
            </div>
          </div>

          {/* AI Threat Copilot Analysis Section */}
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-cyan-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white">AI Cyber Analyst Assessment</span>
                  <span className="text-[10px] text-indigo-300 block font-mono">Gemini 3.8 Flash Threat Reasoning</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!aiAnalysis && (
                  <button
                    onClick={handleGenerateAiAnalysis}
                    disabled={isAnalyzing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition shadow-sm"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Intelligence...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Run AI Threat Analysis</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => onOpenAiCopilotWithContext(threat)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-300 hover:text-white hover:bg-indigo-900/50 border border-indigo-700/40 transition"
                >
                  Open in Threat Copilot
                </button>
              </div>
            </div>

            {aiAnalysis ? (
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-indigo-500/20 text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                {aiAnalysis}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Click "Run AI Threat Analysis" to let Gemini deconstruct the attacker's modus operandi, calculate customer brand damage, and formulate specific takedown grounds.
              </p>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Update Status:</span>
            <select
              value={threat.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono"
            >
              <option value="NEW">NEW</option>
              <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
              <option value="CONFIRMED_IMPERSONATION">CONFIRMED IMPERSONATION</option>
              <option value="TAKEDOWN_REQUESTED">TAKEDOWN REQUESTED</option>
              <option value="WHITELISTED">WHITELISTED (OFFICIAL)</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Close
            </button>
            <button
              onClick={() => onInitiateTakedown(threat)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-lg shadow-rose-600/20"
            >
              <Gavel className="w-4 h-4" />
              <span>Initiate Takedown Demand</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
