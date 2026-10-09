import React, { useState } from 'react';
import {
  Building,
  Plus,
  ShieldCheck,
  Globe,
  Smartphone,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Sliders,
  Check,
  X,
} from 'lucide-react';
import { BrandProfile, OfficialHandle } from '../types';
import { api } from '../services/api';

interface BrandProfilesViewProps {
  brands: BrandProfile[];
  onRefreshBrands: () => void;
}

export const BrandProfilesView: React.FC<BrandProfilesViewProps> = ({
  brands,
  onRefreshBrands,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<BrandProfile | null>(brands[0] || null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New Brand Form State
  const [newBrandName, setNewBrandName] = useState('');
  const [newIndustry, setNewIndustry] = useState('FinTech & Financial Services');
  const [newDomain, setNewDomain] = useState('');
  const [newThreshold, setNewThreshold] = useState(65);

  // Exclusions addition state
  const [newHandlePlatform, setNewHandlePlatform] = useState<'twitter' | 'instagram' | 'linkedin' | 'telegram'>('twitter');
  const [newHandleText, setNewHandleText] = useState('');

  // Domain addition state
  const [newDomainInput, setNewDomainInput] = useState('');

  // Mobile App ID addition state
  const [newAppIdInput, setNewAppIdInput] = useState('');

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    try {
      const res = await api.createBrand({
        name: newBrandName.trim(),
        industry: newIndustry,
        officialDomains: newDomain ? [newDomain.trim()] : [],
        officialHandles: [
          { platform: 'twitter', handle: `@${newBrandName.replace(/\s+/g, '')}`, verified: true },
        ],
        officialAppIds: [`com.${newBrandName.toLowerCase().replace(/\s+/g, '')}.app`],
        keywords: [newBrandName.trim(), `${newBrandName.trim()} Support`],
        riskThreshold: newThreshold,
      });

      onRefreshBrands();
      setIsCreatingNew(false);
      setNewBrandName('');
      setNewDomain('');
      setSelectedBrand(res.brand);
    } catch (err) {
      console.error('Failed to create brand:', err);
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (!confirm('Are you sure you want to remove this brand profile from continuous surveillance?')) return;
    try {
      await api.deleteBrand(brandId);
      onRefreshBrands();
      if (selectedBrand?.id === brandId) {
        setSelectedBrand(brands.find(b => b.id !== brandId) || null);
      }
    } catch (err) {
      console.error('Failed to delete brand:', err);
    }
  };

  const handleAddOfficialHandle = async () => {
    if (!selectedBrand || !newHandleText.trim()) return;

    const formattedHandle = newHandleText.startsWith('@') ? newHandleText.trim() : `@${newHandleText.trim()}`;
    const updatedHandles: OfficialHandle[] = [
      ...selectedBrand.officialHandles,
      { platform: newHandlePlatform, handle: formattedHandle, verified: true },
    ];

    try {
      const res = await api.updateBrand(selectedBrand.id, { officialHandles: updatedHandles });
      setSelectedBrand(res.brand);
      onRefreshBrands();
      setNewHandleText('');
    } catch (err) {
      console.error('Failed to add handle exclusion:', err);
    }
  };

  const handleRemoveOfficialHandle = async (handleToRemove: string) => {
    if (!selectedBrand) return;

    const updatedHandles = selectedBrand.officialHandles.filter(h => h.handle !== handleToRemove);
    try {
      const res = await api.updateBrand(selectedBrand.id, { officialHandles: updatedHandles });
      setSelectedBrand(res.brand);
      onRefreshBrands();
    } catch (err) {
      console.error('Failed to remove handle:', err);
    }
  };

  const handleAddOfficialDomain = async () => {
    if (!selectedBrand || !newDomainInput.trim()) return;

    const updatedDomains = [...selectedBrand.officialDomains, newDomainInput.trim()];
    try {
      const res = await api.updateBrand(selectedBrand.id, { officialDomains: updatedDomains });
      setSelectedBrand(res.brand);
      onRefreshBrands();
      setNewDomainInput('');
    } catch (err) {
      console.error('Failed to add domain:', err);
    }
  };

  const handleAddOfficialAppId = async () => {
    if (!selectedBrand || !newAppIdInput.trim()) return;

    const updatedAppIds = [...selectedBrand.officialAppIds, newAppIdInput.trim()];
    try {
      const res = await api.updateBrand(selectedBrand.id, { officialAppIds: updatedAppIds });
      setSelectedBrand(res.brand);
      onRefreshBrands();
      setNewAppIdInput('');
    } catch (err) {
      console.error('Failed to add app ID:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-cyan-400" />
            <span>Brand Profiles & Official-Account Exclusions</span>
          </h1>
          <p className="text-xs text-slate-400">
            Define corporate trademarks, official web properties, verified social handles, and authorized mobile apps to eliminate false positives.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingNew(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition shadow-sm"
        >
          <Plus className="w-4 h-4 text-cyan-300" />
          <span>Add New Protected Brand</span>
        </button>
      </div>

      {/* Main Grid: Left Brands List, Right Brand Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Brand list */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Protected Entities ({brands.length})
          </h2>

          <div className="space-y-2">
            {brands.map((b) => {
              const isSelected = selectedBrand?.id === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBrand(b)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-white text-sm">{b.name}</div>
                    <div className="text-[11px] text-slate-400">{b.industry}</div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 pt-1">
                      <span>{b.officialHandles.length} Excluded Handles</span>
                      <span>•</span>
                      <span>{b.officialDomains.length} Domains</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Brand Management & Exclusions */}
        <div className="lg:col-span-8">
          {selectedBrand ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedBrand.name}</h2>
                  <p className="text-xs text-slate-400">{selectedBrand.industry}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteBrand(selectedBrand.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Brand</span>
                  </button>
                </div>
              </div>

              {/* Official Account Exclusions (High Value Feature) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Official-Account Exclusions (Whitelisted Socials)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Accounts verified to belong to your brand. The scanning engine automatically ignores these to prevent false alarms.
                    </p>
                  </div>
                </div>

                {/* Exclusions List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedBrand.officialHandles.map((h, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-mono font-bold text-slate-200">{h.handle}</span>
                          <span className="text-[10px] text-slate-500 block uppercase">{h.platform}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveOfficialHandle(h.handle)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove Exclusion"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new exclusion input */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <select
                    value={newHandlePlatform}
                    onChange={(e: any) => setNewHandlePlatform(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  >
                    <option value="twitter">X / Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="telegram">Telegram</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Enter official handle (e.g. @ApexFinGlobal)..."
                    value={newHandleText}
                    onChange={(e) => setNewHandleText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />

                  <button
                    onClick={handleAddOfficialHandle}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shrink-0"
                  >
                    + Add to Exclusions
                  </button>
                </div>
              </div>

              {/* Official Verified Web Domains */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Authorized Web Domains</span>
                </h3>

                <div className="flex flex-wrap gap-2">
                  {selectedBrand.officialDomains.map((dom, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300"
                    >
                      https://{dom}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add verified domain (e.g. apexfin-invest.com)..."
                    value={newDomainInput}
                    onChange={(e) => setNewDomainInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600"
                  />
                  <button
                    onClick={handleAddOfficialDomain}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    Add Domain
                  </button>
                </div>
              </div>

              {/* Official Mobile Apps */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Legitimate Mobile App Package IDs</span>
                </h3>

                <div className="flex flex-wrap gap-2">
                  {selectedBrand.officialAppIds.map((appId, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300"
                    >
                      {appId}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add official package ID (e.g. com.apexfin.wallet)..."
                    value={newAppIdInput}
                    onChange={(e) => setNewAppIdInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600"
                  />
                  <button
                    onClick={handleAddOfficialAppId}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    Add App ID
                  </button>
                </div>
              </div>

              {/* Sensitivity Threshold */}
              <div className="space-y-2 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Alert Sensitivity Threshold:</span>
                  <span className="font-mono text-cyan-400 font-bold">{selectedBrand.riskThreshold}/100</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Accounts with an algorithmic risk score equal to or exceeding this threshold trigger high-priority alerts.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/20 border border-slate-800 rounded-2xl">
              Select a brand profile or create a new one to manage exclusions.
            </div>
          )}
        </div>
      </div>

      {/* New Brand Modal */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#090e1a] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create New Protected Brand</h3>
              <button onClick={() => setIsCreatingNew(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ApexFin Global"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Industry Sector</label>
                <input
                  type="text"
                  placeholder="e.g. FinTech, Crypto, HealthTech"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Primary Official Domain</label>
                <input
                  type="text"
                  placeholder="e.g. apexfin.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Risk Threshold ({newThreshold})</label>
                <input
                  type="range"
                  min="40"
                  max="90"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                >
                  Create & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
