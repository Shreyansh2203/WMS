import React, { useState } from 'react';
import { HotspotNumber, ReconciliationItem } from '../../types';
import { HOTSPOT_METADATA } from '../../data/mockData';
import { AlertTriangle, Database, Server, Cpu, ArrowRight, X, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playTactileTick, playAlertWarning } from '../../utils/audio';

interface TopologyViewProps {
  onSelectHotspot: (hotspot: HotspotNumber) => void;
  onNavigateToRecon: () => void;
  unresolvedCount: number;
  items: ReconciliationItem[];
}

export const TopologyView: React.FC<TopologyViewProps> = ({
  onSelectHotspot,
  onNavigateToRecon,
  unresolvedCount,
  items,
}) => {
  const [activeInspectedHotspot, setActiveInspectedHotspot] = useState<HotspotNumber | null>(null);

  const handleInspect = (num: HotspotNumber) => {
    playTactileTick();
    setActiveInspectedHotspot(num);
  };

  const inspectedMeta = activeInspectedHotspot ? HOTSPOT_METADATA[activeInspectedHotspot] : null;
  const inspectedItems = activeInspectedHotspot
    ? items.filter((i) => i.hotspotNumber === activeInspectedHotspot && i.status === 'pending_approval')
    : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111317] border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Lehigh Valley Plant</span>
              <span>·</span>
              <span>Plant Code: LV-04</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Telemetry Online</span>
            </div>
            <h2 className="text-lg font-bold font-display text-zinc-900 dark:text-white mt-1">
              MIPS–WMS Inventory Reconciliation Architecture
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Multi-tier data flows, 8 discrepancy hotspots, and continuous supervisory autonomous reconciliation loop.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playAlertWarning();
                onNavigateToRecon();
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white rounded-md shadow-xs transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
              <span>Review {unresolvedCount} Active Mismatches</span>
            </button>
          </div>
        </div>

        {/* 5-Step Workflow Pipeline Strip */}
        <div className="mt-4 pt-1">
          <div className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mb-2 font-semibold">
            Reconciliation Agent Execution Cycle
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {[
              {
                step: '01 · COLLECT',
                title: 'Data Ingestion',
                desc: 'MIPS runs & changes, WMS tickets & returns, Oracle batch postings.',
              },
              {
                step: '02 · CONSOLIDATE',
                title: 'Position Netting',
                desc: 'Net req = Demand - Usable - Completed ± Returns. Resolves #1, #2, #4.',
              },
              {
                step: '03 · MATCH',
                title: 'Cross-Key Linking',
                desc: 'Runs ↔ WO ↔ Tickets ↔ Lots ↔ Oracle txns. Resolves #3, #5, #7.',
              },
              {
                step: '04 · DETECT',
                title: 'Anomaly Engine',
                desc: 'Unallocated WMS stock, unnetted returns, SLA timeouts. Resolves #6, #8.',
              },
              {
                step: '05 · RECOMMEND',
                title: 'Supervisor Approval',
                desc: 'Audited one-click executable fixes across 3 shifts and 11 supervisors.',
              },
            ].map((st, i) => (
              <div
                key={i}
                className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded p-2.5 text-xs transition-colors"
              >
                <div className="font-mono text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                  {st.step}
                </div>
                <div className="font-medium text-zinc-900 dark:text-white mt-0.5">
                  {st.title}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {st.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Visual Topology Map */}
      <div className="bg-white dark:bg-[#111317] border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold font-display text-zinc-900 dark:text-white">
              Live Topology & Failure Hotspots
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Click any numbered marker or system node to open the live telemetry inspector.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-700 dark:bg-zinc-300 inline-block" />
              Physical / ERP Link
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              SLA Timeout Risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Active Mismatch Hotspot
            </span>
          </div>
        </div>

        {/* System Node Diagram Container */}
        <div className="mt-8 relative max-w-5xl mx-auto py-2">
          {/* Top: BUSS (Sales Orders) */}
          <div className="flex justify-center mb-8">
            <div className="w-72 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-center shadow-xs">
              <div className="text-xs font-bold text-zinc-900 dark:text-white font-mono flex items-center justify-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-zinc-500" />
                BUSS Repository
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Sales Orders & Demand Baseline</div>
              <div className="mt-1 text-[10px] font-mono text-zinc-400">Order Lines · Historical Volumes · Customer Delivery</div>
            </div>
          </div>

          {/* Middle Row: MIPS <--> AI RECON AGENT <--> ORACLE CLOUD + ODI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* MIPS Node */}
            <div className="bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-700 rounded-lg p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                    MIPS Console
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                </div>
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-1">
                  Plant Scheduling & Batch Execution
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Daily production lines, runs & discrete work orders.
                </div>
              </div>

              {/* Hotspots 1, 2, 3, 4 */}
              <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400">Hotspots:</span>
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleInspect(num as HotspotNumber)}
                    className="w-5 h-5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white font-mono font-bold text-[10px] flex items-center justify-center transition-all shadow-xs"
                    title={`Inspect Hotspot #${num}: ${HOTSPOT_METADATA[num].title}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Central Autonomous Recon Engine (Architectural Dark Slate, Anti-Slop) */}
            <div className="bg-zinc-900 dark:bg-black text-white border border-zinc-700 dark:border-zinc-800 rounded-lg p-4 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-zinc-300 animate-pulse" />
                    <span className="text-xs font-bold font-display uppercase tracking-wider text-zinc-100">
                      Reconciliation Engine
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    LV-04 Core
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-[11px] text-zinc-300 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Single Net Position Formula</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Multi-Key Cross System Linkage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>Ghost Lot & Phantom Detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                    <span>Executable Shift Handoff Audits</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Supervisory Sign-Off:</span>
                <span className="text-zinc-200 font-bold">11 Plant Leads</span>
              </div>
            </div>

            {/* ORACLE Cloud + ODI Node */}
            <div className="bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-700 rounded-lg p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                    Oracle ODI
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Synced</span>
                </div>
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-1">
                  Cloud ERP & Financial Postings
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Batch inventory accounting and interface queues.
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400">Latency Risk:</span>
                <button
                  onClick={() => handleInspect(8)}
                  className="px-2 py-0.5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-rose-600 hover:text-white font-mono font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors"
                >
                  <span>Hotspot 8</span>
                  <span className="text-[9px] opacity-75">~10m SLA</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom: WMS (Warehouse Management) */}
          <div className="flex justify-center mt-8">
            <div className="w-80 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-700 rounded-lg p-4 shadow-xs text-center">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                  WMS Warehouse
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Online</span>
              </div>
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-1">
                Finished Goods, Lots & Returns
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Barcode scans, freezer sub-inventory, return staging.
              </div>

              {/* Hotspots 5, 6, 7 */}
              <div className="mt-3 pt-2.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400">Hotspots:</span>
                {[5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleInspect(num as HotspotNumber)}
                    className="w-5 h-5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white font-mono font-bold text-[10px] flex items-center justify-center transition-all shadow-xs"
                    title={`Inspect Hotspot #${num}: ${HOTSPOT_METADATA[num].title}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 8 Monitored Hotspots Interactive Grid */}
        <div className="mt-8 pt-5 border-t border-zinc-100 dark:border-zinc-800">
          <div className="text-xs font-bold text-zinc-900 dark:text-white font-display mb-3">
            Monitored Mismatch Hotspots & Failure Modes
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
              const meta = HOTSPOT_METADATA[n];
              const isSelected = activeInspectedHotspot === n;
              return (
                <div
                  key={n}
                  onClick={() => handleInspect(n as HotspotNumber)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-zinc-900 dark:border-white bg-zinc-100/80 dark:bg-zinc-800/80 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-mono font-bold text-[9px] flex items-center justify-center shrink-0">
                      {n}
                    </span>
                    <span className="font-semibold text-xs text-zinc-900 dark:text-white truncate">
                      {meta.title}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-normal line-clamp-2">
                    {meta.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive In-Place Hotspot Inspector Modal */}
      <AnimatePresence>
        {activeInspectedHotspot && inspectedMeta && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white dark:bg-[#111317] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-mono font-bold text-sm">
                    #{activeInspectedHotspot}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      {inspectedMeta.category}
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white font-display">
                      {inspectedMeta.title}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setActiveInspectedHotspot(null)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                  aria-label="Close inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div>
                  <div className="font-mono text-zinc-400 text-[10px] uppercase font-semibold">Underlying Root Cause</div>
                  <p className="mt-1 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {inspectedMeta.description}
                  </p>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <div className="font-mono text-zinc-400 text-[10px] uppercase font-semibold">Plant Floor Scenario</div>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                    "{inspectedMeta.realWorldExample}"
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 uppercase font-semibold">
                    <span>Active Discrepancies</span>
                    <span className="text-zinc-900 dark:text-white">{inspectedItems.length} Pending Approval</span>
                  </div>
                  {inspectedItems.length > 0 ? (
                    <div className="mt-2 space-y-1.5">
                      {inspectedItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-white font-mono">{item.sku}</div>
                            <div className="text-[11px] text-zinc-500">{item.skuName} · {item.plantLine}</div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-rose-600 dark:text-rose-400 font-bold">{item.varianceQty} units</div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Save {item.unnecessaryProductionRiskQty}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-zinc-500 dark:text-zinc-400 italic">
                      No active mismatches currently unapproved for this hotspot.
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setActiveInspectedHotspot(null)}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const num = activeInspectedHotspot;
                    setActiveInspectedHotspot(null);
                    onSelectHotspot(num);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white rounded-md transition-all shadow-xs"
                >
                  <span>Filter Queue by Hotspot #{activeInspectedHotspot}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
