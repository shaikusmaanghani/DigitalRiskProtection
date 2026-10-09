import React from 'react';
import {
  ShieldAlert,
  Flame,
  Smartphone,
  Gavel,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Radar,
  Users,
  ExternalLink,
  Sparkles,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { DashboardStats, SocialImpersonation, MobileAppThreat } from '../types';

interface DashboardViewProps {
  stats: DashboardStats | null;
  socialThreats: SocialImpersonation[];
  mobileThreats: MobileAppThreat[];
  onInspectThreat: (threat: any) => void;
  onNavigateToView: (view: string) => void;
  onTriggerScan: () => void;
  isScanning: boolean;
  onOpenDetectProfileModal?: () => void;
  onOpenDetectAppModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  socialThreats,
  mobileThreats,
  onInspectThreat,
  onNavigateToView,
  onTriggerScan,
  isScanning,
  onOpenDetectProfileModal,
  onOpenDetectAppModal,
}) => {
  const criticalThreats = [
    ...socialThreats.filter((t) => t.threatLevel === 'CRITICAL'),
    ...mobileThreats.filter((t) => t.threatLevel === 'CRITICAL'),
  ].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner: Surveillance Grid Status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#0a152e] to-[#071329] border border-cyan-500/20 p-6 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ACTIVE MONITORING
              </span>
              <span className="text-xs text-slate-400">
                Continuous Digital Risk Surface Surveillance
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Executive Threat & Brand Impersonation Dashboard
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Real-time intelligence engine scanning look-alike handles, homoglyph typosquats, rogue APK banking clones, and phishing infrastructure across social networks and app stores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenDetectProfileModal && (
              <button
                onClick={onOpenDetectProfileModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 transition shadow-sm"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Detect Fake Profile</span>
              </button>
            )}

            {onOpenDetectAppModal && (
              <button
                onClick={onOpenDetectAppModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition shadow-sm"
              >
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Detect Fake App</span>
              </button>
            )}

            <button
              onClick={onTriggerScan}
              disabled={isScanning}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            >
              <Radar className="w-4 h-4 text-slate-950" />
              <span>{isScanning ? 'Scanning...' : 'Perimeter Scan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Total Flagged Threats</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {stats ? stats.totalThreats : socialThreats.length + mobileThreats.length}
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">
              {socialThreats.length} Social • {mobileThreats.length} Mobile
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Perimeter Coverage</span>
            <span className="text-slate-300 font-mono">100%</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/20 hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-rose-300">Critical Impersonations</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400">
              {stats ? stats.criticalThreats : 5}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Immediate Action Required
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Risk Index &gt; 85</span>
            <span className="text-rose-400 font-mono">High Danger</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-amber-300">Rogue Mobile Apps</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {stats ? stats.mobileCount : mobileThreats.length}
            </span>
            <span className="text-[11px] text-slate-400">
              Across 5 App Stores
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>SMS & Overlay Trojans</span>
            <span className="text-amber-400 font-mono">3 Clones</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-blue-500/20 hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-300">Enforcement / Takedowns</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Gavel className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-400">
              {stats ? stats.activeTakedowns : 2}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              {stats ? stats.resolvedTakedowns : 1} Resolved
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Avg Takedown Velocity</span>
            <span className="text-slate-300 font-mono">4.8 hours</span>
          </div>
        </div>
      </div>

      {/* Visual Charts & Heatmap Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Threat Trend Velocity Chart */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>7-Day Threat Velocity & Incident Velocity</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Daily frequency of newly indexed look-alike accounts and APK clones
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
              LIVE TELEMETRY
            </span>
          </div>

          {/* SVG Bar / Area visualization */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {stats?.trend ? (
              stats.trend.labels.map((day, idx) => {
                const count = stats.trend.values[idx] || 3;
                const maxVal = Math.max(...stats.trend.values, 10);
                const heightPct = Math.min(100, Math.max(15, (count / maxVal) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
                      {count}
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 relative ${
                        idx === stats.trend.labels.length - 1
                          ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-md shadow-cyan-500/30'
                          : 'bg-gradient-to-t from-slate-800 to-slate-700 hover:from-cyan-700 hover:to-cyan-500'
                      }`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-300/40 rounded-t-lg" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{day}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-500 w-full text-center py-10">Loading telemetry...</div>
            )}
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-1">Vector Distribution</h2>
            <p className="text-[11px] text-slate-400 mb-4">Threat density across vectors</p>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Twitter / X Impersonators
                  </span>
                  <span className="font-mono text-slate-400">42%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-400 w-[42%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Telegram Fraud Channels
                  </span>
                  <span className="font-mono text-slate-400">26%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-500 w-[26%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Rogue Mobile APKs
                  </span>
                  <span className="font-mono text-slate-400">20%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-400 w-[20%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Instagram & LinkedIn
                  </span>
                  <span className="font-mono text-slate-400">12%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-400 w-[12%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Detection Engine</span>
            <span className="font-mono text-cyan-400">Levenshtein + Homoglyphs</span>
          </div>
        </div>
      </div>

      {/* Critical Threats Quick Action Feed */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Priority Impersonation Threats (Requiring Action)</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              High-confidence brand lookalikes actively harvesting user credentials or distributing trojans
            </p>
          </div>

          <button
            onClick={() => onNavigateToView('social')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All ({socialThreats.length + mobileThreats.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {criticalThreats.map((threat) => {
            const isSoc = 'handle' in threat;
            return (
              <div
                key={threat.id}
                className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-800/30 px-3 rounded-xl transition"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      threat.threatLevel === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {isSoc ? <Users className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">
                        {isSoc ? (threat as SocialImpersonation).displayName : (threat as MobileAppThreat).title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {isSoc ? (threat as SocialImpersonation).platform : (threat as MobileAppThreat).store}
                      </span>
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Score {threat.riskScore}/100
                      </span>
                    </div>

                    <p className="text-xs font-mono text-cyan-400">
                      {isSoc ? (threat as SocialImpersonation).handle : (threat as MobileAppThreat).packageName}
                    </p>

                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {isSoc
                        ? (threat as SocialImpersonation).bioSnippet
                        : (threat as MobileAppThreat).analysisSummary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onInspectThreat(threat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Investigate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
