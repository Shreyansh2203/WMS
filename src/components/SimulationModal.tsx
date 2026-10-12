import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Activity,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  X,
  Play,
  Snowflake,
  TrendingDown,
  Layers,
  Server,
  Cpu,
  Database,
  Flame,
} from 'lucide-react';
import { playSuccessChime, playTactileTick } from '../utils/audio';

export interface SimulationScenario {
  id: string;
  title: string;
  badge: string;
  severity: 'nominal' | 'warning' | 'critical';
  systemTarget: 'WMS' | 'BUSS' | 'MIPS' | 'ODI' | 'ALL';
  description: string;
  telemetryEffects: string[];
  applyEffects: () => void;
}

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySurgeOrder: () => void;
  onApplyFreezerExcursion: () => void;
  onApplyOdiThrottle: () => void;
  onApplyBlindLineJam: () => void;
  onResetFactoryBaseline: () => void;
  isSoundEnabled?: boolean;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  onApplySurgeOrder,
  onApplyFreezerExcursion,
  onApplyOdiThrottle,
  onApplyBlindLineJam,
  onResetFactoryBaseline,
  isSoundEnabled = true,
}) => {
  const [activeRunningScenario, setActiveRunningScenario] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastExecutedMessage, setLastExecutedMessage] = useState<string | null>(null);

  const scenarios: SimulationScenario[] = [
    {
      id: 'cold-chain-alarm',
      title: 'Blast Freezer Thermal Excursion & Ghost Surge',
      badge: 'Cold Chain Failure',
      severity: 'critical',
      systemTarget: 'WMS',
      description:
        'Simulates an evaporator compressor trip in Blast Freezer Bay F-14 (-18°F spikes to -4.2°F). Emergency pallet switchover generates 4 unregistered ghost lots.',
      telemetryEffects: [
        'Bay F-14 status changes to critical alert (-4.2°F)',
        'Freezer ghost lots jump from 3 to 7 lots pending deduction',
        'Hotspot #7 variance triggers in Incident Queue',
      ],
      applyEffects: onApplyFreezerExcursion,
    },
    {
      id: 'surge-order-conflict',
      title: 'Emergency Surge Order Allocation Shock',
      badge: 'Demand Shock',
      severity: 'warning',
      systemTarget: 'BUSS',
      description:
        'Walmart issues an unannounced 5,000 unit holiday push for Vanilla Tub SKU-74398. Exhausts scheduled capacity and starves Target line SP-4412.',
      telemetryEffects: [
        'Gross demand spikes by +5,000 units',
        'SO-9104 vs SP-4412 conflict flagged with 0% allocation on special-pack line',
        'Hotspot #1 variance escalates to $18,400 exposure',
      ],
      applyEffects: onApplySurgeOrder,
    },
    {
      id: 'odi-partition',
      title: 'Downstream Oracle Cloud ODI Pipeline Partition',
      badge: 'Interface Lag',
      severity: 'critical',
      systemTarget: 'ODI',
      description:
        'Simulates an enterprise socket timeout and thread-pool exhaustion between WMS staging tables and Oracle Cloud ERP Financials General Ledger.',
      telemetryEffects: [
        'Transfer latency escalates from 6.2m to 48.5m (>10m SLA breach)',
        'Stage 3 Interface failed with ORA-00054 lock exception',
        'Hotspot #8 batch repush queue requires supervisory override',
      ],
      applyEffects: onApplyOdiThrottle,
    },
    {
      id: 'mips-blind-line',
      title: 'Plant Floor Packaging Blind Run Disconnect',
      badge: 'Shop Floor MES',
      severity: 'warning',
      systemTarget: 'MIPS',
      description:
        'Line 2 Filling switches carton sizes without updating the central MIPS terminal, stranding 1,200 finished units on a ghost zero-quantity line.',
      telemetryEffects: [
        'Line 2 flags Blind Line Alert with 1,200 stranded units',
        'Line 2 workstation sync drops to stale WebSocket status',
        'Hotspot #2 duplicate production threat triggers in Incident Queue',
      ],
      applyEffects: onApplyBlindLineJam,
    },
  ];

  const handleRunScenario = (sc: SimulationScenario) => {
    setIsExecuting(true);
    setActiveRunningScenario(sc.id);
    if (isSoundEnabled) playTactileTick();

    setTimeout(() => {
      sc.applyEffects();
      setIsExecuting(false);
      setLastExecutedMessage(`Injected scenario: ${sc.title}`);
      if (isSoundEnabled) playTactileTick();
    }, 600);
  };

  const handleRestoreNominal = () => {
    setIsExecuting(true);
    if (isSoundEnabled) playTactileTick();

    setTimeout(() => {
      onResetFactoryBaseline();
      setActiveRunningScenario(null);
      setIsExecuting(false);
      setLastExecutedMessage('Restored nominal plant equilibrium across all 4 IT layers.');
      if (isSoundEnabled) playSuccessChime();
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-12 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.16 }}
        className="relative w-full max-w-3xl rounded-xl bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-2xl text-slate-900 dark:text-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-[#1a2336] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#141b2b] text-slate-900 dark:text-white border border-slate-200 dark:border-[#222e47]">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
                <span>Enterprise Stress Testing</span>
                <span>·</span>
                <span>What-If Scenario Sandbox</span>
              </div>
              <h2 className="text-lg font-bold font-display text-slate-950 dark:text-white mt-0.5">
                Plant LV-04 Operational Stress & Fault Simulator
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#101524] border-b border-slate-200/80 dark:border-[#1a2336] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Simulate enterprise failure modes to observe cross-subsystem cascading effects across WMS, BUSS, MIPS, and ODI.
            </span>
          </div>

          <button
            onClick={handleRestoreNominal}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shrink-0 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Nominal State</span>
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="p-5 space-y-3.5 max-h-[62vh] overflow-y-auto">
          {scenarios.map((sc) => {
            const isCurrent = activeRunningScenario === sc.id;

            return (
              <div
                key={sc.id}
                className={`p-4 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-slate-50/90 dark:bg-[#131a2a] border-slate-400 dark:border-slate-500 shadow-sm'
                    : 'bg-white dark:bg-[#0f1422] border-slate-200/80 dark:border-[#1a2336] hover:border-slate-300 dark:hover:border-[#222e47]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-950 dark:text-white">
                      {sc.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium border ${
                        sc.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {sc.badge}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-[#161d2d] px-1.5 py-0.2 rounded border border-slate-200 dark:border-[#1a2336]">
                      Target: {sc.systemTarget}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRunScenario(sc)}
                    disabled={isExecuting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-950 dark:bg-white dark:text-slate-950 rounded hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs disabled:opacity-50 self-start sm:self-auto shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Inject Fault</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans mt-1">
                  {sc.description}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#182133] grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-500">
                  {sc.telemetryEffects.map((eff, i) => (
                    <div key={i} className="flex items-baseline gap-1.5">
                      <span className="text-slate-400 shrink-0">›</span>
                      <span className="truncate">{eff}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-[#1a2336] bg-slate-50/50 dark:bg-[#0c1018] flex items-center justify-between text-xs">
          <div>
            {lastExecutedMessage ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lastExecutedMessage}</span>
              </span>
            ) : (
              <span className="text-slate-400 font-mono">Ready to inject plant stress vectors</span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
          >
            Close Sandbox
          </button>
        </div>
      </motion.div>
    </div>
  );
};
