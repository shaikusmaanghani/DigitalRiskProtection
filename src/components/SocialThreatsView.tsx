import React, { useState } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Gavel,
  Eye,
  Sparkles,
  CheckCircle,
  Users,
  ShieldAlert,
  ArrowUpDown,
} from 'lucide-react';
import { SocialImpersonation, BrandProfile } from '../types';

interface SocialThreatsViewProps {
  threats: SocialImpersonation[];
  brands: BrandProfile[];
  onInspectThreat: (threat: SocialImpersonation) => void;
  onInitiateTakedown: (threat: SocialImpersonation) => void;
  onWhitelistThreat: (threatId: string) => void;
  onQuickAiAnalyze: (threat: SocialImpersonation) => void;
  onOpenDetectProfileModal?: () => void;
}

export const SocialThreatsView: React.FC<SocialThreatsViewProps> = ({
  threats,
  brands,
  onInspectThreat,
  onInitiateTakedown,
  onWhitelistThreat,
  onQuickAiAnalyze,
  onOpenDetectProfileModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  const filteredThreats = threats.filter((threat) => {
    if (selectedPlatform !== 'all' && threat.platform !== selectedPlatform) return false;
    if (selectedSeverity !== 'all' && threat.threatLevel !== selectedSeverity) return false;
    if (selectedStatus !== 'all' && threat.status !== selectedStatus) return false;
    if (selectedBrand !== 'all' && threat.brandId !== selectedBrand) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        threat.handle.toLowerCase().includes(q) ||
        threat.displayName.toLowerCase().includes(q) ||
        threat.brandName.toLowerCase().includes(q) ||
        threat.bioSnippet.toLowerCase().includes(q) ||
        threat.detectionType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Social Media Impersonation Radar</span>
          </h1>
          <p className="text-xs text-slate-400">
            Automated discovery of look-alike handles, homoglyphs, and fraudulent support accounts across social platforms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {onOpenDetectProfileModal && (
            <button
              onClick={onOpenDetectProfileModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-sans shadow-md shadow-cyan-500/20 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Detect & Analyze Any Profile</span>
            </button>
          )}
          <span className="px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            Active: <strong className="text-white">{filteredThreats.length}</strong>
          </span>
          <span className="px-2 py-1.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
            Critical: <strong className="text-rose-400">{filteredThreats.filter(t => t.threatLevel === 'CRITICAL').length}</strong>
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search handle, name, brand, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Platform Filter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Platforms</option>
            <option value="twitter">X / Twitter</option>
            <option value="telegram">Telegram</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>

        {/* Severity Filter */}
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
        >
          <option value="all">All Severities</option>
          <option value="CRITICAL">Critical (Score &ge; 85)</option>
          <option value="HIGH">High (Score 70-84)</option>
          <option value="MEDIUM">Medium (Score 45-69)</option>
          <option value="LOW">Low (Score &lt; 45)</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="NEW">New Alert</option>
          <option value="UNDER_INVESTIGATION">Under Investigation</option>
          <option value="CONFIRMED_IMPERSONATION">Confirmed Impersonation</option>
          <option value="TAKEDOWN_REQUESTED">Takedown Requested</option>
          <option value="WHITELISTED">Whitelisted (Exclusion)</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        {/* Brand Filter */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
        >
          <option value="all">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Threats Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                <th className="py-3 px-4">Imposter Account</th>
                <th className="py-3 px-4">Brand Target</th>
                <th className="py-3 px-4">Detection Vector</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Followers</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredThreats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No impersonation threats found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredThreats.map((threat) => {
                  return (
                    <tr
                      key={threat.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Imposter Account */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={threat.avatarUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                            onError={(e) => {
                              // fallback placeholder
                              (e.target as any).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="max-w-[220px]">
                            <div className="font-bold text-white truncate">{threat.displayName}</div>
                            <div className="font-mono text-cyan-400 text-[11px] flex items-center gap-1">
                              <span>{threat.handle}</span>
                              <span className="text-[10px] text-slate-500 uppercase">({threat.platform})</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Brand Target */}
                      <td className="py-3 px-4 font-medium text-slate-300">
                        {threat.brandName}
                      </td>

                      {/* Detection Vector */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold capitalize ${
                            threat.detectionType === 'homoglyph'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : threat.detectionType === 'support_scam'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : threat.detectionType === 'executive_impersonation'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {threat.detectionType.replace('_', ' ')}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {threat.similarityScore}% similarity
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${threat.riskScore}%` }}
                              className={`h-full ${
                                threat.threatLevel === 'CRITICAL'
                                  ? 'bg-rose-500'
                                  : threat.threatLevel === 'HIGH'
                                  ? 'bg-amber-400'
                                  : 'bg-cyan-400'
                              }`}
                            />
                          </div>
                          <span
                            className={`font-mono font-bold ${
                              threat.threatLevel === 'CRITICAL'
                                ? 'text-rose-400'
                                : threat.threatLevel === 'HIGH'
                                ? 'text-amber-400'
                                : 'text-cyan-400'
                            }`}
                          >
                            {threat.riskScore}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{threat.threatLevel}</span>
                      </td>

                      {/* Followers */}
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {threat.followerCount.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            threat.status === 'CONFIRMED_IMPERSONATION'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : threat.status === 'TAKEDOWN_REQUESTED'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : threat.status === 'WHITELISTED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : threat.status === 'UNDER_INVESTIGATION'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {threat.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onInspectThreat(threat)}
                            title="Inspect Evidence & Modus Operandi"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onQuickAiAnalyze(threat)}
                            title="Ask AI Cyber Analyst"
                            className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-cyan-300 border border-indigo-700/50 transition"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          {threat.status !== 'TAKEDOWN_REQUESTED' && (
                            <button
                              onClick={() => onInitiateTakedown(threat)}
                              title="Generate Cease & Desist / Takedown"
                              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-700/40 transition"
                            >
                              <Gavel className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {threat.status !== 'WHITELISTED' && (
                            <button
                              onClick={() => onWhitelistThreat(threat.id)}
                              title="Confirm as Official (Add to Exclusions)"
                              className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 transition"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
