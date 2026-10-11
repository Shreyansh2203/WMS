import React, { useState } from 'react';
import { Supervisor, ShiftHandoffLog } from '../../types';
import { Users, FileText, Plus, CheckCircle2, Clock } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header with Scroll-In-View Transition */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-[#111317] border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white">
                3 Shifts · 11 Supervisors Handoff Architecture
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Replaces error-prone verbal shift handoffs with structured, logged reconciliation notes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playTactileTick();
                setShowLogModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-medium rounded-md shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Shift Handover</span>
            </button>
          </div>
        </div>

        {/* Current Active Supervisor Switcher */}
        <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Currently Acting Lead:</span>
            <span className="font-bold text-zinc-900 dark:text-white font-mono">{currentSupervisor}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11px]">Simulate Logged-in Supervisor:</span>
            <select
              value={currentSupervisor}
              onChange={(e) => {
                playTactileTick();
                const s = supervisors.find((sup) => sup.name === e.target.value);
                if (s) onSelectCurrentSupervisor(s.name, s.shift);
              }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              {supervisors.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.shift.split(' ')[0]}) - {s.role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* 11 Supervisors Roster Across 3 Shifts with Scroll-In-View */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-[#111317] border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs"
      >
        <h3 className="text-sm font-semibold font-display text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
          Lehigh Valley Supervisory Roster (11 Plant Leads)
        </h3>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {(
            [
              { shiftName: 'Shift 1 (06:00 - 14:00)', label: 'Morning Production Shift' },
              { shiftName: 'Shift 2 (14:00 - 22:00)', label: 'Evening Output Shift' },
              { shiftName: 'Shift 3 (22:00 - 06:00)', label: 'Night Overhaul & Recon Shift' },
            ] as const
          ).map((shiftBlock) => {
            const shiftSups = supervisors.filter((s) => s.shift === shiftBlock.shiftName);
            return (
              <div
                key={shiftBlock.shiftName}
                className="bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3.5 text-xs"
              >
                <div className="font-bold text-zinc-900 dark:text-white font-mono flex items-center justify-between">
                  <span>{shiftBlock.shiftName.split(' ')[0]}</span>
                  <span className="text-[10px] font-normal text-zinc-500">{shiftBlock.shiftName.split(' ')[1]}</span>
                </div>
                <div className="text-[11px] text-zinc-500 mb-3">{shiftBlock.label}</div>

                <div className="space-y-2 divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                  {shiftSups.map((sup) => (
                    <div key={sup.id} className="pt-2 first:pt-0 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-white">{sup.name}</div>
                        <div className="text-[10px] text-zinc-500">{sup.role}</div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-[10px] font-mono font-semibold ${
                            sup.status === 'on_duty' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                          }`}
                        >
                          {sup.status === 'on_duty' ? 'On Duty' : 'Off Duty'}
                        </span>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {sup.activeApprovalsCount} approved
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Logged Shift Handoff Trail with Scroll-In-View */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-[#111317] border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs"
      >
        <h3 className="text-sm font-semibold font-display text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
          Shift Handoff Historical Ledger
        </h3>

        <div className="mt-4 space-y-3">
          {handoffLogs.map((log) => (
            <motion.div
              key={log.id}
              layout
              className="p-4 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-zinc-500">{log.id}</span>
                  <span>{log.fromShift} → {log.toShift}</span>
                </div>
                <div className="font-mono text-zinc-400 text-[11px]">{log.timestamp}</div>
              </div>

              <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                "{log.summary}"
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 text-[11px] text-zinc-500 font-mono">
                <div>Recorded by Supervisor: <span className="font-bold text-zinc-700 dark:text-zinc-300">{log.supervisorName}</span></div>
                <div className="flex items-center gap-1.5">
                  <span>Critical Lots:</span>
                  {log.criticalLotsHandedOver.map((lot) => (
                    <span key={lot} className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold">
                      {lot}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Modal for recording handoff */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-20 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-2xs"
              onClick={() => setShowLogModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#14161b] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-2xl text-xs z-10"
            >
              <h3 className="text-base font-bold text-zinc-900 dark:text-white font-display mb-1">
                Record Shift Handover
              </h3>
              <p className="text-zinc-500 mb-4">
                Enter shift handover summary replacing verbal shift exchange.
              </p>

              <form onSubmit={handleSubmitHandoff} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">From Shift</label>
                    <select
                      value={fromShift}
                      onChange={(e) => setFromShift(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-zinc-900 dark:text-white"
                    >
                      <option value="Shift 1 (06:00 - 14:00)">Shift 1 (06:00 - 14:00)</option>
                      <option value="Shift 2 (14:00 - 22:00)">Shift 2 (14:00 - 22:00)</option>
                      <option value="Shift 3 (22:00 - 06:00)">Shift 3 (22:00 - 06:00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">To Shift</label>
                    <select
                      value={toShift}
                      onChange={(e) => setToShift(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-zinc-900 dark:text-white"
                    >
                      <option value="Shift 2 (14:00 - 22:00)">Shift 2 (14:00 - 22:00)</option>
                      <option value="Shift 3 (22:00 - 06:00)">Shift 3 (22:00 - 06:00)</option>
                      <option value="Shift 1 (06:00 - 14:00)">Shift 1 (06:00 - 14:00)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                    Handover Summary & Plant Notes
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Detail active line runs, pending blind line reconciliations, returned tickets in staging, and freezer lot status..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                    Critical Lots Flagged (comma separated)
                  </label>
                  <input
                    type="text"
                    value={criticalLots}
                    onChange={(e) => setCriticalLots(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-zinc-900 dark:text-white font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-3 py-1.5 text-zinc-500 hover:text-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium rounded shadow-xs"
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
