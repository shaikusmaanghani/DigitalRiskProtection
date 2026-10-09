import React from 'react';
import {
  LayoutDashboard,
  Users,
  Smartphone,
  SearchCode,
  Building,
  Gavel,
  Bot,
  Database,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  threatsCount: {
    social: number;
    mobile: number;
    takedowns: number;
    critical: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  threatsCount,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'social',
      label: 'Social Impersonation',
      icon: Users,
      badge: threatsCount.social > 0 ? threatsCount.social : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    {
      id: 'mobile',
      label: 'Rogue Mobile Apps',
      icon: Smartphone,
      badge: threatsCount.mobile > 0 ? threatsCount.mobile : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'lookalike',
      label: 'Look-Alike Hunter',
      icon: SearchCode,
      badge: 'Simulator',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
    },
    {
      id: 'brands',
      label: 'Brand Profiles',
      icon: Building,
      badge: 'Exclusions',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
    },
    {
      id: 'takedowns',
      label: 'Takedown Notices',
      icon: Gavel,
      badge: threatsCount.takedowns > 0 ? threatsCount.takedowns : null,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      id: 'copilot',
      label: 'AI Threat Copilot',
      icon: Bot,
      badge: 'Gemini 3.8',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    },
    {
      id: 'database',
      label: 'MongoDB & Schemas',
      icon: Database,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-[#070d19] border-r border-slate-800/80 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation Section */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Threat Intelligence
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Real-time System Status Footer */}
      <div className="mt-auto p-3 m-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-slate-300">Surveillance Grid</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold">ACTIVE</span>
        </div>
        <div className="space-y-1 text-[11px] text-slate-400">
          <div className="flex justify-between">
            <span>Critical Alerts</span>
            <span className="font-mono text-rose-400 font-bold">{threatsCount.critical}</span>
          </div>
          <div className="flex justify-between">
            <span>Detection Latency</span>
            <span className="font-mono text-slate-300">&lt; 1.2s</span>
          </div>
          <div className="flex justify-between">
            <span>AI Reasoning</span>
            <span className="font-mono text-cyan-400">Gemini 3.8 Flash</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
