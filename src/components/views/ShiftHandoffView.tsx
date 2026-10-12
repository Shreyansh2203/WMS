import React, { useState } from 'react';
import { Supervisor, ShiftHandoffLog } from '../../types';
import { Users, FileText, Plus, CheckCircle2, Clock, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playTactileTick, playSuccessChime } from '../../utils/audio';

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

    playSuccessChime();
    onAddHandoffLog(newLog);
    setShowLogModal(false);
    setSummary('');
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
                <Users className="w-4 h-4" />
              </div>
              <h1 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
                Shift Handover & Operations Log
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Synchronize operational context across 3 production shifts and 11 plant leads.
            </p>
          </div>

          <button
            onClick={() => {
              playTactileTick();
              setShowLogModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors self-start md:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Shift Handover</span>
          </button>
        </div>

        {/* Active Lead selector */}
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-zinc-500">
            Currently logged in: <strong className="text-zinc-900 dark:text-white font-mono">{currentSupervisor}</strong>
          </span>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11px]">Switch lead:</span>
            <select
              value={currentSupervisor}
              onChange={(e) => {
                playTactileTick();
                const s = supervisors.find((sup) => sup.name === e.target.value);
                if (s) onSelectCurrentSupervisor(s.name, s.shift);
              }}
              className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
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
      <div className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white font-display mb-4">
          Recorded Shift Handovers
        </h2>

        <div className="space-y-4">
          {handoffLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-zinc-200/60 dark:border-zinc-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">{log.id}</span>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">{log.fromShift.split(' ')[0]} → {log.toShift.split(' ')[0]}</span>
                </div>
                <div className="text-zinc-500 font-mono text-[11px] flex items-center gap-1.5">
                  <span>Author: {log.supervisorName}</span>
                  <span>·</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>

              <p className="mt-3 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                {log.summary}
              </p>

              {log.criticalLotsHandedOver.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 text-xs">
                  <span className="text-zinc-500 text-[11px]">Watch Lots:</span>
                  <div className="flex gap-1.5">
                    {log.criticalLotsHandedOver.map((lot) => (
                      <span key={lot} className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[10px]">
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
      <div className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white font-display mb-4">
          Plant Supervisory Roster (11 Leads)
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
                className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs"
              >
                <div className="font-bold text-zinc-900 dark:text-white mb-3">
                  {block.label}
                </div>
                <div className="space-y-2">
                  {shiftSups.map((sup) => (
                    <div
                      key={sup.id}
                      className="p-2 rounded bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-white">{sup.name}</div>
                        <div className="text-[10px] text-zinc-500">{sup.role}</div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                        {sup.activeApprovalsCount} approved
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
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-[#111317] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white font-display">
                  Log Shift Handover Note
                </h3>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitHandoff} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-zinc-500 mb-1 font-semibold">From Shift → To Shift</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={fromShift}
                      onChange={(e) => setFromShift(e.target.value)}
                      className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                    >
                      <option value="Shift 1 (06:00 - 14:00)">Shift 1 (Morning)</option>
                      <option value="Shift 2 (14:00 - 22:00)">Shift 2 (Evening)</option>
                      <option value="Shift 3 (22:00 - 06:00)">Shift 3 (Night)</option>
                    </select>
                    <select
                      value={toShift}
                      onChange={(e) => setToShift(e.target.value)}
                      className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                    >
                      <option value="Shift 2 (14:00 - 22:00)">Shift 2 (Evening)</option>
                      <option value="Shift 3 (22:00 - 06:00)">Shift 3 (Night)</option>
                      <option value="Shift 1 (06:00 - 14:00)">Shift 1 (Morning)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-500 mb-1 font-semibold">Handover Summary & Variances</label>
                  <textarea
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Document active line changes, open pallet tickets, or freezer lots needing attention..."
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 mb-1 font-semibold">Critical Lot Watchlist (comma separated)</label>
                  <input
                    type="text"
                    value={criticalLots}
                    onChange={(e) => setCriticalLots(e.target.value)}
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                    placeholder="e.g. LV94, LV98"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-3.5 py-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold rounded-lg shadow-xs"
                  >
                    Commit Handover Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
