import React, { useState, useMemo } from 'react';
import { ReconciliationItem, HotspotNumber } from '../../types';
import { HOTSPOT_METADATA } from '../../data/mockData';
import { Check, X, ShieldAlert, Cpu, AlertTriangle, ArrowRight, UserCheck, Filter, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { exportToCSV } from '../../utils/formatters';
import { playTactileTick, playSuccessChime } from '../../utils/audio';

interface ReconciliationQueueViewProps {
  items: ReconciliationItem[];
  selectedHotspotFilter: HotspotNumber | 'all';
  onSetHotspotFilter: (h: HotspotNumber | 'all') => void;
  onApproveItem: (id: string, supervisorName: string, shift: string) => void;
  onDismissItem: (id: string) => void;
  currentSupervisor: string;
  currentShift: string;
}

export const ReconciliationQueueView: React.FC<ReconciliationQueueViewProps> = ({
  items,
  selectedHotspotFilter,
  onSetHotspotFilter,
  onApproveItem,
  onDismissItem,
  currentSupervisor,
  currentShift,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_approval' | 'approved_executed'>('pending_approval');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchHotspot = selectedHotspotFilter === 'all' || item.hotspotNumber === selectedHotspotFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchSearch =
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.skuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.workOrder.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.runNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchHotspot && matchStatus && matchSearch;
    });
  }, [items, selectedHotspotFilter, statusFilter, searchQuery]);

  const pendingCount = items.filter((i) => i.status === 'pending_approval').length;
  const approvedCount = items.filter((i) => i.status === 'approved_executed').length;
  const totalUnitsSaved = items
    .filter((i) => i.status === 'approved_executed')
    .reduce((acc, i) => acc + i.unnecessaryProductionRiskQty, 0);

  const handleExportCSV = () => {
    playTactileTick();
    exportToCSV(
      filteredItems.map((i) => ({
        ID: i.id,
        Hotspot: `#${i.hotspotNumber} - ${i.hotspotTitle}`,
        SKU: i.sku,
        SKU_Name: i.skuName,
        Line: i.plantLine,
        Run: i.runNumber,
        WO: i.workOrder,
        MIPS_Qty: i.mipsQty,
        WMS_Qty: i.wmsQty,
        Variance: i.varianceQty,
        Unnecessary_Production_Saved: i.unnecessaryProductionRiskQty,
        Status: i.status,
        Recommendation: i.aiRecommendation,
        Approved_By: i.approvedBy || '',
        Shift: i.approvedShift || '',
      })),
      'lehigh-valley-reconciliation-queue'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Plant KPI Strip with Staggered Scroll-In-View Transition */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            label: 'Pending Supervisor Approvals',
            value: pendingCount.toString(),
            sub: 'Requires sign-off before shift close',
            color: 'text-zinc-900 dark:text-zinc-50',
            subColor: 'text-amber-600 dark:text-amber-400 font-medium',
          },
          {
            label: 'Overproduction Prevented',
            value: `${totalUnitsSaved.toLocaleString()} units`,
            sub: 'Across 3 shifts today',
            color: 'text-emerald-600 dark:text-emerald-400',
            subColor: 'text-zinc-400 dark:text-zinc-500',
          },
          {
            label: 'Current Active Shift',
            value: currentShift,
            sub: `Lead on Duty: ${currentSupervisor}`,
            color: 'text-zinc-900 dark:text-white truncate text-base font-bold',
            subColor: 'text-zinc-500 font-mono',
          },
          {
            label: 'Oracle Posting Gap Risk',
            value: '1 Batch',
            sub: 'Hotspot #8 delayed 46m (SLA 10m)',
            color: 'text-zinc-900 dark:text-zinc-50',
            subColor: 'text-rose-600 dark:text-rose-400 font-medium',
          },
        ].map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10px' }}
            transition={{ duration: 0.28, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white dark:bg-[#111317] border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-xs"
          >
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{kpi.label}</div>
            <div className={`mt-2 font-mono tabular-nums ${kpi.color} ${kpi.value.length > 15 ? 'text-base font-bold' : 'text-2xl font-bold'}`}>
              {kpi.value}
            </div>
            <div className={`mt-1 text-xs ${kpi.subColor}`}>
              {kpi.sub}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Control Header & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-[#111317] border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold font-display text-zinc-900 dark:text-white">
              AI Mismatch Detection & Supervisor Approval Ledger
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Review AI recommendations, prevent rework, and execute multi-system corrections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Segments */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-md border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  playTactileTick();
                  setStatusFilter('pending_approval');
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === 'pending_approval'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => {
                  playTactileTick();
                  setStatusFilter('approved_executed');
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === 'approved_executed'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => {
                  playTactileTick();
                  setStatusFilter('all');
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                All Records
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1 text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter by Hotspots Segment Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-mono text-zinc-400 mr-1">Hotspot:</span>
          <button
            onClick={() => {
              playTactileTick();
              onSetHotspotFilter('all');
            }}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
              selectedHotspotFilter === 'all'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            All Hotspots
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
            const isSelected = selectedHotspotFilter === num;
            return (
              <button
                key={num}
                onClick={() => {
                  playTactileTick();
                  onSetHotspotFilter(num as HotspotNumber);
                }}
                className={`px-2 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-colors ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <span className="font-bold">#{num}</span>
                <span className="hidden md:inline">{HOTSPOT_METADATA[num].title.split(',')[0].slice(0, 16)}</span>
              </button>
            );
          })}
        </div>

        {/* Mismatch Cards List with Staggered Scroll-In-View and Physics Transitions */}
        <div className="mt-6 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
              No mismatches matching the current filter.
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.28, delay: Math.min(idx * 0.04, 0.25), ease: [0.16, 1, 0.3, 1] }}
                className="bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-2xs"
              >
                {/* Top Card Bar - Zero-pill clean unboxed metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      Hotspot #{item.hotspotNumber}
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {item.hotspotTitle}
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span className="text-zinc-500 font-mono">{item.id}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400 font-mono text-[11px]">Detected {item.detectedAt}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                      {item.plantLine}
                    </span>
                  </div>
                </div>

                {/* Plain-Language AI Recommendation Banner (Architectural Zinc, Anti-Slop) */}
                <div className="mt-3 p-3 rounded-md bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Cpu className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 font-display">
                        Agent Recommendation for Supervisor Approval:
                      </div>
                      <div className="text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed font-sans font-medium">
                        "{item.aiRecommendation}"
                      </div>
                    </div>
                  </div>
                </div>

                {/* SKU Details & Quantity Comparison Strip */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800/80 rounded-md text-xs font-mono tabular-nums">
                  <div>
                    <div className="text-[10px] text-zinc-400">SKU & Item</div>
                    <div className="font-bold text-zinc-900 dark:text-white mt-0.5 truncate">{item.sku}</div>
                    <div className="text-[10px] text-zinc-500 truncate font-sans">{item.skuName}</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-zinc-400">Run & Work Order</div>
                    <div className="text-zinc-800 dark:text-zinc-200 font-medium mt-0.5">{item.runNumber}</div>
                    <div className="text-[10px] text-zinc-500">{item.workOrder}</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-zinc-400">MIPS Scheduled</div>
                    <div className="text-zinc-900 dark:text-white font-bold mt-0.5">{item.mipsQty.toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-500">units</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-zinc-400">WMS On-Hand / Scan</div>
                    <div className="text-zinc-900 dark:text-white font-bold mt-0.5">{item.wmsQty.toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-500">units</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-zinc-400">Overproduction Risk</div>
                    <div className="text-rose-600 dark:text-rose-400 font-bold mt-0.5">
                      {item.unnecessaryProductionRiskQty > 0 ? `${item.unnecessaryProductionRiskQty.toLocaleString()} units` : 'Synced'}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-sans">
                      ${item.financialImpact.toLocaleString()} impact
                    </div>
                  </div>
                </div>

                {/* Supervisor Action Bar */}
                <div className="mt-4 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <span className="font-mono text-[11px]">Systems impacted:</span>
                    {item.affectedSystems.map((sys) => (
                      <span
                        key={sys}
                        className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[10px]"
                      >
                        {sys}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'pending_approval' ? (
                      <>
                        <button
                          onClick={() => onDismissItem(item.id)}
                          className="px-3 py-1.5 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => onApproveItem(item.id, currentSupervisor, currentShift)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white font-medium transition-all shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Execute Fix</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Check className="w-4 h-4" />
                        <span>Executed by {item.approvedBy} ({item.approvedShift})</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
