import React, { useState } from 'react';
import { Supervisor, ShiftHandoffLog } from '../../types';
import { Plus, X } from 'lucide-react';

interface ShiftHandoffViewProps {
  supervisors: Supervisor[];
  handoffLogs: ShiftHandoffLog[];
  currentSupervisor: string;
  onSelectCurrentSupervisor: (name: string, shift: string) => void;
  onAddHandoffLog: (log: ShiftHandoffLog) => void;
}

export const ShiftHandoffView: React.FC<ShiftHandoffViewProps> = ({
  supervisors,
  handoffLogs,
  currentSupervisor,
  onSelectCurrentSupervisor,
  onAddHandoffLog,
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [fromShift, setFromShift] = useState('Shift 1 (06:00 - 14:00)');
  const [toShift, setToShift] = useState('Shift 2 (14:00 - 22:00)');
  const [summary, setSummary] = useState('');
  const [criticalLots, setCriticalLots] = useState('LV94, LV98');

  const handleSubmitHandoff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    const newLog: ShiftHandoffLog = {
      id: `HO-${Math.floor(900 + Math.random() * 100)}`,
      timestamp: `${new Date().toISOString().slice(0, 10)} ${new Date().toISOString().slice(11, 16)} UTC`,
      fromShift,
      toShift,
      supervisorName: currentSupervisor,
      summary: summary.trim(),
      unresolvedMismatchesCount: 2,
      criticalLotsHandedOver: criticalLots.split(',').map((s) => s.trim()).filter(Boolean),
    };

    onAddHandoffLog(newLog);
    setShowLogModal(false);
    setSummary('');
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(255,255,255,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              <span>Plant LV-04</span>
              <span>/</span>
              <span>Operations Governance</span>
              <span>/</span>
              <span>Shift Continuity</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white mt-1">
              Production Shift Handover & Supervisory Logbook
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Continuous operations log capturing inter-shift variances, unnetted lot alerts, and supervisory sign-offs.
            </p>
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-950 dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 rounded shadow-xs transition-colors self-start md:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Handover Entry</span>
          </button>
        </div>

        {/* Active Lead info */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1a2336] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-slate-500">
            Active Lead on Shift: <strong className="text-slate-950 dark:text-white font-mono">{currentSupervisor}</strong>
          </span>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Change Active Lead:</span>
            <select
              value={currentSupervisor}
              onChange={(e) => {
                const s = supervisors.find((sup) => sup.name === e.target.value);
                if (s) onSelectCurrentSupervisor(s.name, s.shift);
              }}
              className="bg-slate-50 dark:bg-[#121725] border border-slate-200/90 dark:border-[#1a2336] rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {supervisors.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.shift.split(' ')[0]}) - {s.role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Handover Logs Timeline */}
      <div className="bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(255,255,255,0.03)]">
        <h2 className="text-sm font-semibold text-slate-950 dark:text-white mb-3">
          Historical Shift Handover Notes
        </h2>

        <div className="space-y-3">
          {handoffLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded border border-slate-200/80 dark:border-[#1a2336] bg-slate-50/50 dark:bg-[#111726]/60 text-xs shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200/60 dark:border-[#1a2336]">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-slate-950 dark:text-white">{log.id}</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{log.fromShift.split(' ')[0]} → {log.toShift.split(' ')[0]}</span>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  <span>Lead: {log.supervisorName}</span>
                  <span className="mx-1.5">·</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>

              <p className="mt-2 text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {log.summary}
              </p>

              {log.criticalLotsHandedOver.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#1a2336] flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[11px]">Watch Lots:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {log.criticalLotsHandedOver.map((lot) => (
                      <span key={lot} className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 dark:bg-[#151c2c] text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-[#222e47] font-medium">
                        {lot}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Supervisory Roster 3 Shifts */}
      <div className="bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(255,255,255,0.03)]">
        <h2 className="text-sm font-semibold text-slate-950 dark:text-white mb-3">
          Plant Supervisory Roster (11 Leads Across 3 Shifts)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { shiftName: 'Shift 1 (06:00 - 14:00)', label: 'Shift 1 · Morning Production' },
            { shiftName: 'Shift 2 (14:00 - 22:00)', label: 'Shift 2 · Evening Operations' },
            { shiftName: 'Shift 3 (22:00 - 06:00)', label: 'Shift 3 · Night & Sanitation' },
          ].map((block) => {
            const shiftSups = supervisors.filter((s) => s.shift === block.shiftName);

            return (
              <div
                key={block.shiftName}
                className="p-3.5 rounded border border-slate-200/80 dark:border-[#1a2336] bg-slate-50/50 dark:bg-[#111726]/60 text-xs shadow-xs"
              >
                <div className="font-semibold text-slate-900 dark:text-white mb-2.5 font-mono text-[11px]">
                  {block.label}
                </div>
                <div className="space-y-1.5">
                  {shiftSups.map((sup) => (
                    <div
                      key={sup.id}
                      className="p-2.5 rounded bg-white dark:bg-[#0c1018] border border-slate-200/70 dark:border-[#1a2336] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{sup.name}</div>
                        <div className="text-[10px] text-slate-400">{sup.role}</div>
                      </div>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-medium">
                        {sup.activeApprovalsCount} resolved
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Record Handover Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] rounded-lg shadow-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1a2336]">
              <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                Record Shift Handover Note
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitHandoff} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Inter-Shift Handover</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={fromShift}
                    onChange={(e) => setFromShift(e.target.value)}
                    className="w-full p-2 rounded border border-slate-200/90 dark:border-[#1a2336] bg-slate-50 dark:bg-[#121725] text-slate-900 dark:text-white"
                  >
                    <option value="Shift 1 (06:00 - 14:00)">Shift 1 (Day)</option>
                    <option value="Shift 2 (14:00 - 22:00)">Shift 2 (Evening)</option>
                    <option value="Shift 3 (22:00 - 06:00)">Shift 3 (Night)</option>
                  </select>
                  <select
                    value={toShift}
                    onChange={(e) => setToShift(e.target.value)}
                    className="w-full p-2 rounded border border-slate-200/90 dark:border-[#1a2336] bg-slate-50 dark:bg-[#121725] text-slate-900 dark:text-white"
                  >
                    <option value="Shift 2 (14:00 - 22:00)">Shift 2 (Evening)</option>
                    <option value="Shift 3 (22:00 - 06:00)">Shift 3 (Night)</option>
                    <option value="Shift 1 (06:00 - 14:00)">Shift 1 (Day)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Operational Context & Discrepancies</label>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Document run changes, unnetted dock pallets, or cold storage lots needing supervisor review..."
                  className="w-full p-2.5 rounded border border-slate-200/90 dark:border-[#1a2336] bg-slate-50 dark:bg-[#121725] text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Lot Watchlist (comma separated)</label>
                <input
                  type="text"
                  value={criticalLots}
                  onChange={(e) => setCriticalLots(e.target.value)}
                  className="w-full p-2 rounded border border-slate-200/90 dark:border-[#1a2336] bg-slate-50 dark:bg-[#121725] text-slate-900 dark:text-white font-mono"
                  placeholder="e.g. LV94, LV98"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-[#1a2336]">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-medium rounded hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xs transition-colors"
                >
                  Submit Handover Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
