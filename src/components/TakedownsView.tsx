import React, { useState } from 'react';
import {
  Gavel,
  FileText,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { TakedownRequest } from '../types';
import { api } from '../services/api';

interface TakedownsViewProps {
  takedowns: TakedownRequest[];
  onRefreshTakedowns: () => void;
}

export const TakedownsView: React.FC<TakedownsViewProps> = ({
  takedowns,
  onRefreshTakedowns,
}) => {
  const [selectedTakedown, setSelectedTakedown] = useState<TakedownRequest | null>(
    takedowns[0] || null
  );
  const [copiedNotice, setCopiedNotice] = useState(false);

  const handleCopyNotice = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await api.updateTakedownStatus(id, newStatus);
      if (selectedTakedown?.id === id) {
        setSelectedTakedown(res.takedown);
      }
      onRefreshTakedowns();
    } catch (err) {
      console.error('Failed to update takedown status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Gavel className="w-5 h-5 text-blue-400" />
            <span>Takedown Enforcement & DMCA Notice Center</span>
          </h1>
          <p className="text-xs text-slate-400">
            Track formal legal removal demands, trademark cease-and-desist filings, and platform abuse tickets.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">
            Active Tickets: <strong className="text-white">{takedowns.length}</strong>
          </span>
          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            Accepted / Purged: <strong className="text-emerald-400">{takedowns.filter(t => t.status === 'ACCEPTED').length}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Enforcement Queue ({takedowns.length})
          </h2>

          <div className="space-y-2">
            {takedowns.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
                No active takedown requests. Click "Takedown" on any threat in the Social or Mobile views to generate one.
              </div>
            ) : (
              takedowns.map((item) => {
                const isSelected = selectedTakedown?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedTakedown(item)}
                    className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                      isSelected
                        ? 'bg-blue-500/10 border-blue-500/40 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white truncate max-w-[200px]">
                        {item.targetEntity}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          item.status === 'ACCEPTED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : item.status === 'IN_REVIEW'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : item.status === 'SUBMITTED'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Platform: {item.platform}</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {item.ticketReference || 'TICKET-PENDING'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Takedown Details & Legal Notice Body */}
        <div className="lg:col-span-7">
          {selectedTakedown ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
              {/* Top status header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base font-mono">
                      {selectedTakedown.targetEntity}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      {selectedTakedown.legalGrounds}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Target Platform: <strong className="text-slate-200">{selectedTakedown.platform}</strong> • Ticket Ref:{' '}
                    <span className="font-mono text-cyan-400">{selectedTakedown.ticketReference}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <select
                    value={selectedTakedown.status}
                    onChange={(e) => handleUpdateStatus(selectedTakedown.id, e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="IN_REVIEW">IN REVIEW</option>
                    <option value="ACCEPTED">ACCEPTED (REMOVED)</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              {/* Legal Notice Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    Generated Legal Cease & Desist Demand
                  </span>
                  <button
                    onClick={() => handleCopyNotice(selectedTakedown.noticeContent)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    {copiedNotice ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Notice</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                  {selectedTakedown.noticeContent}
                </div>
              </div>

              {/* Submission info */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Dispatched By:</span>
                  <span className="text-slate-300">{selectedTakedown.submittedBy}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Dispatched Timestamp:</span>
                  <span className="text-slate-300">{new Date(selectedTakedown.submittedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/20 border border-slate-800 rounded-2xl">
              Select a takedown ticket from the queue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
