import React, { useState } from 'react';
import {
  Smartphone,
  Search,
  Filter,
  AlertTriangle,
  Gavel,
  Eye,
  Sparkles,
  ShieldAlert,
  Copy,
  Check,
  Download,
  Terminal,
} from 'lucide-react';
import { MobileAppThreat, BrandProfile } from '../types';

interface MobileAppsViewProps {
  threats: MobileAppThreat[];
  brands: BrandProfile[];
  onInspectThreat: (threat: MobileAppThreat) => void;
  onInitiateTakedown: (threat: MobileAppThreat) => void;
  onQuickAiAnalyze: (threat: MobileAppThreat) => void;
  onOpenDetectAppModal?: () => void;
}

export const MobileAppsView: React.FC<MobileAppsViewProps> = ({
  threats,
  brands,
  onInspectThreat,
  onInitiateTakedown,
  onQuickAiAnalyze,
  onOpenDetectAppModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filteredThreats = threats.filter((threat) => {
    if (selectedStore !== 'all' && threat.store !== selectedStore) return false;
    if (selectedSeverity !== 'all' && threat.threatLevel !== selectedSeverity) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        threat.title.toLowerCase().includes(q) ||
        threat.packageName.toLowerCase().includes(q) ||
        threat.developerName.toLowerCase().includes(q) ||
        threat.brandName.toLowerCase().includes(q) ||
        threat.sha256Hash.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <span>Suspicious Mobile App & Rogue APK Monitoring</span>
          </h1>
          <p className="text-xs text-slate-400">
            Surveillance of unauthorized APK packages, banking trojans, and lookalike apps mimicking brand assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {onOpenDetectAppModal && (
            <button
              onClick={onOpenDetectAppModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-sans shadow-md shadow-amber-500/20 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Detect & Analyze Any App / APK</span>
            </button>
          )}
          <span className="px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            Repositories: <strong className="text-white">Google Play • APKPure • Aptoide</strong>
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search package name, developer, SHA-256 hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
        >
          <option value="all">All Repositories & Stores</option>
          <option value="google_play">Google Play Store</option>
          <option value="apkpure">APKPure</option>
          <option value="aptoide">Aptoide</option>
          <option value="telegram_repo">Telegram Malware Channels</option>
        </select>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
        >
          <option value="all">All Threat Levels</option>
          <option value="CRITICAL">Critical (Malware / Trojan)</option>
          <option value="HIGH">High (Adware / Clone)</option>
          <option value="MEDIUM">Medium</option>
        </select>
      </div>

      {/* Grid of Mobile App Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredThreats.map((threat) => {
          return (
            <div
              key={threat.id}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={threat.iconUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0 shadow-md"
                      onError={(e) => {
                        (e.target as any).src = 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div>
                      <h3 className="font-bold text-white text-sm">{threat.title}</h3>
                      <p className="text-xs font-mono text-cyan-400">{threat.packageName}</p>
                      <p className="text-[11px] text-slate-400">
                        Target Brand: <strong className="text-slate-200">{threat.brandName}</strong>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                      threat.threatLevel === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {threat.threatLevel} ({threat.riskScore}/100)
                  </span>
                </div>

                {/* Metadata details */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Store / Origin:</span>
                    <span className="font-mono text-slate-200 uppercase bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                      {threat.store.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Developer Signature:</span>
                    <span className="text-rose-300 font-semibold">{threat.developerName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Est. Victim Downloads:</span>
                    <span className="font-mono text-amber-300">{threat.downloadCountEstimate}</span>
                  </div>

                  {/* Abuse Permissions */}
                  <div className="pt-1">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">
                      Abuse Permissions Detected:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {threat.abusePermissions.map((perm, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SHA-256 Hash */}
                  <div className="pt-1">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Package SHA-256:</span>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 font-mono text-[10px] text-slate-400 border border-slate-800">
                      <span className="truncate">{threat.sha256Hash}</span>
                      <button
                        onClick={() => handleCopy(threat.sha256Hash)}
                        className="text-cyan-400 hover:text-cyan-300 ml-2"
                      >
                        {copiedHash === threat.sha256Hash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed mt-2">
                    {threat.analysisSummary}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {threat.status}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onInspectThreat(threat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => onQuickAiAnalyze(threat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/70 hover:bg-indigo-900 text-cyan-300 border border-indigo-700/50 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Deep Dive</span>
                  </button>

                  <button
                    onClick={() => onInitiateTakedown(threat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>Takedown</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
