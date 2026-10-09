import React, { useState, useEffect } from 'react';
import {
  SearchCode,
  Sparkles,
  Search,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Layers,
  CheckCircle,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import { LookalikeItem, BrandProfile } from '../types';

interface LookalikeHunterViewProps {
  brands: BrandProfile[];
  onAddKeywordToBrand?: (brandId: string, keyword: string) => void;
}

export const LookalikeHunterView: React.FC<LookalikeHunterViewProps> = ({ brands }) => {
  const [inputBrand, setInputBrand] = useState('ApexFin');
  const [activeCategory, setActiveCategory] = useState<'all' | 'homoglyph' | 'typosquat' | 'combosquat'>('all');
  const [lookalikes, setLookalikes] = useState<LookalikeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedVariant, setCopiedVariant] = useState<string | null>(null);

  const fetchPermutations = async (brand: string) => {
    setIsLoading(true);
    try {
      const res = await api.getLookalikes(brand);
      setLookalikes(res.lookalikes);
    } catch (err) {
      console.error('Failed to generate lookalikes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermutations(inputBrand);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputBrand.trim()) {
      fetchPermutations(inputBrand.trim());
    }
  };

  const handleCopy = (variant: string) => {
    navigator.clipboard.writeText(variant);
    setCopiedVariant(variant);
    setTimeout(() => setCopiedVariant(null), 2000);
  };

  const filteredItems = lookalikes.filter((item) => {
    if (activeCategory === 'homoglyph') return item.type.toLowerCase().includes('homoglyph');
    if (activeCategory === 'typosquat') return item.type.toLowerCase().includes('typosquat');
    if (activeCategory === 'combosquat') return item.type.toLowerCase().includes('combosquat');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <SearchCode className="w-5 h-5 text-cyan-400" />
          <span>Look-Alike Name & Homoglyph Permutation Simulator</span>
        </h1>
        <p className="text-xs text-slate-400">
          Proactively generate potential typosquats, Unicode homoglyph substitutions, and combosquat handles before threat actors register them.
        </p>
      </div>

      {/* Input bar */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Enter brand or trademark (e.g. ApexFin, VortexCloud, Netflix)..."
              value={inputBrand}
              onChange={(e) => setInputBrand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition font-mono font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{isLoading ? 'Generating Variants...' : 'Generate Permutations'}</span>
          </button>
        </form>

        {/* Quick chip suggestions */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-500 font-mono">Suggested Brand Targets:</span>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setInputBrand(b.name);
                fetchPermutations(b.name);
              }}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              {b.name}
            </button>
          ))}
          <button
            onClick={() => {
              setInputBrand('CryptoVault');
              fetchPermutations('CryptoVault');
            }}
            className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
          >
            CryptoVault
          </button>
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeCategory === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          All Permutations ({lookalikes.length})
        </button>
        <button
          onClick={() => setActiveCategory('homoglyph')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeCategory === 'homoglyph'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Homoglyph Substitutions (Cyrillic / Numbers)
        </button>
        <button
          onClick={() => setActiveCategory('typosquat')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeCategory === 'typosquat'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Typosquatting (Omissions & Duplicates)
        </button>
        <button
          onClick={() => setActiveCategory('combosquat')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeCategory === 'combosquat'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Combosquatting (High-Risk Affixes)
        </button>
      </div>

      {/* Grid of Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.map((item, idx) => {
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold capitalize ${
                      item.type.includes('Homoglyph')
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : item.type.includes('Typosquat')
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {item.type}
                  </span>

                  <span className="text-[11px] font-mono font-bold text-cyan-400">
                    {item.similarity}% match
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 mb-2">
                  <span className="font-mono text-sm font-bold text-white tracking-wide">
                    @{item.variant}
                  </span>
                  <button
                    onClick={() => handleCopy(item.variant)}
                    className="p-1 text-slate-400 hover:text-cyan-400 transition"
                    title="Copy Handle"
                  >
                    {copiedVariant === item.variant ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono">Simulated Platform:</span>
                <span className="text-slate-300">X / Instagram / Telegram</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
