import React from 'react';
import {
  Shield,
  Search,
  Radar,
  Sparkles,
  Bell,
  LogOut,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandProfile } from '../types';

interface NavbarProps {
  brands: BrandProfile[];
  selectedBrandId: string;
  onSelectBrandId: (id: string) => void;
  onOpenScanModal: () => void;
  isScanning: boolean;
  onToggleAiDrawer: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  criticalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  brands,
  selectedBrandId,
  onSelectBrandId,
  onOpenScanModal,
  isScanning,
  onToggleAiDrawer,
  criticalCount,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#070d19]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between">
      {/* Brand & Platform Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20">
          <Shield className="w-5 h-5 text-white" />
          <div className="absolute inset-0 rounded-xl border border-cyan-400/30 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-white text-base lg:text-lg">
              SENTINEL<span className="text-cyan-400">SHIELD</span>
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              DRP SOC v2.4
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">Digital Risk Protection Platform</p>
        </div>
      </div>

      {/* Middle: Brand Filter Selector & Live Scan Button */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Brand Selector */}
        <div className="relative flex items-center bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-700 transition">
          <Building2 className="w-3.5 h-3.5 text-cyan-400 mr-2 shrink-0" />
          <select
            value={selectedBrandId}
            onChange={(e) => onSelectBrandId(e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer pr-1 text-xs font-medium"
          >
            <option value="all" className="bg-slate-900 text-slate-200">
              All Monitored Brands ({brands.length})
            </option>
            {brands.map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Live Scan Trigger Button */}
        <button
          onClick={onOpenScanModal}
          disabled={isScanning}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${
            isScanning
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-wait'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-cyan-500/20 hover:shadow-cyan-500/30'
          }`}
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-300" />
              <span className="hidden md:inline">Scanning Channels...</span>
              <span className="md:hidden">Scanning...</span>
            </>
          ) : (
            <>
              <Radar className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden md:inline">Deep Scan Now</span>
              <span className="md:hidden">Scan</span>
            </>
          )}
        </button>

        {/* AI Threat Copilot Button */}
        <button
          onClick={onToggleAiDrawer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 hover:border-indigo-500/80 transition"
          title="Open AI Threat Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>
      </div>

      {/* Right User Controls */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Critical alert bell */}
        <div className="relative p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer">
          <Bell className="w-4 h-4" />
          {criticalCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm shadow-rose-500/50">
              {criticalCount}
            </span>
          )}
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-300">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-medium text-slate-200 leading-tight">{user.name}</p>
              <p className="text-[10px] text-cyan-400/90 font-mono capitalize">{user.role} • {user.organization.split(' ')[0]}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
