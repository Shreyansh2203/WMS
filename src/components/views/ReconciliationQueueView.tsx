import React, { useState, useMemo } from 'react';
import { ReconciliationItem, HotspotNumber } from '../../types';
import { HOTSPOT_METADATA } from '../../data/mockData';
import {
  Check,
  X,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  ChevronDown,
  LayoutGrid,
  Table as TableIcon,
  ShieldCheck,
  Clock,
  Sparkles,
  Server,
  Database,
} from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState<'pending_approval' | 'approved_executed' | 'all'>('pending_approval');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [inspectedItem, setInspectedItem] = useState<ReconciliationItem | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchHotspot = selectedHotspotFilter === 'all' || item.hotspotNumber === selectedHotspotFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchSearch =
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.skuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.workOrder.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.runNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.plantLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hotspotTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchHotspot && matchStatus && matchSearch;
    });
  }, [items, selectedHotspotFilter, statusFilter, searchQuery]);

  const pendingCount = items.filter((i) => i.status === 'pending_approval').length;
  const approvedCount = items.filter((i) => i.status === 'approved_executed').length;

  const handleExportCSV = () => {
    playTactileTick();
    exportToCSV(
      filteredItems.map((i) => ({
        ID: i.id,
        Zone: `#${i.hotspotNumber} - ${i.hotspotTitle}`,
        SKU: i.sku,
        SKU_Name: i.skuName,
        Line: i.plantLine,
        Run: i.runNumber,
        Work_Order: i.workOrder,
        MIPS_Quantity: i.mipsQty,
        WMS_Quantity: i.wmsQty,
        Variance: i.varianceQty,
        Financial_Risk: i.financialImpact,
        Status: i.status,
        Recommendation: i.aiRecommendation,
        Approved_By: i.approvedBy || '',
        Approved_Shift: i.approvedShift || '',
      })),
      'plantops-reconciliation-queue'
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Top Header & Search Controls */}
      <div className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Reconciliation Queue & Triage</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-full">
                {pendingCount} Pending Sign-Off
              </span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Multi-system 3-way balance: compare MIPS scheduled work orders against WMS physical barcode counts and Oracle ERP ledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => {
                  playTactileTick();
                  setViewMode('cards');
                }}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
                title="Visual Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  playTactileTick();
                  setViewMode('table');
                }}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
                title="Compact Table Grid"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/80 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200/80 dark:border-zinc-800 self-start">
            <button
              onClick={() => {
                playTactileTick();
                setStatusFilter('pending_approval');
              }}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                statusFilter === 'pending_approval'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Needs Review ({pendingCount})
            </button>
            <button
              onClick={() => {
                playTactileTick();
                setStatusFilter('approved_executed');
              }}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                statusFilter === 'approved_executed'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Approved & Synced ({approvedCount})
            </button>
            <button
              onClick={() => {
                playTactileTick();
                setStatusFilter('all');
              }}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              All Records ({items.length})
            </button>
          </div>

          {/* Search & Zone Dropdown */}
          <div className="flex flex-1 max-w-lg items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search SKU, product name, line, or run..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Zone Filter Select */}
            <select
              value={selectedHotspotFilter}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : (Number(e.target.value) as HotspotNumber);
                playTactileTick();
                onSetHotspotFilter(val);
              }}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="all">All Operational Zones (1–8)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  Zone #{n} · {HOTSPOT_METADATA[n].title.slice(0, 26)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items Content: Card View vs Table View */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-[#111317] border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">No items found</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            {searchQuery
              ? `No variances match "${searchQuery}". Try clearing your search term or zone filter.`
              : 'All variances in this category have been resolved. The reconciliation engine is running clean.'}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Visual Cards View */
        <div className="space-y-4">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.2) }}
              className={`bg-white dark:bg-[#111317] border rounded-xl p-5 shadow-xs transition-all ${
                item.status === 'approved_executed'
                  ? 'border-emerald-200 dark:border-emerald-950/50 bg-emerald-50/10 dark:bg-emerald-950/10'
                  : 'border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              {/* Header row: ID, Line, Status badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-zinc-900 dark:text-white px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                    {item.id}
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.plantLine}</span>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <span className="text-zinc-500 dark:text-zinc-400 font-mono">{item.sku}</span>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <span className="text-zinc-500 text-[11px]">Zone #{item.hotspotNumber}: {item.hotspotTitle}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'approved_executed' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                      <Check className="w-3.5 h-3.5" />
                      <span>Approved by {item.approvedBy || currentSupervisor}</span>
                    </span>
                  ) : item.status === 'dismissed' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      Dismissed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Sign-off</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Human Summary */}
              <div className="mt-3">
                <div className="text-base font-bold text-zinc-900 dark:text-white font-display">
                  {item.skuName}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Run: <strong className="font-mono text-zinc-700 dark:text-zinc-300">{item.runNumber}</strong> · Work Order: <strong className="font-mono text-zinc-700 dark:text-zinc-300">{item.workOrder}</strong> · Target Date: {item.salesDate}
                </div>
              </div>

              {/* Recommendation Callout */}
              <div className="mt-3 p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-start gap-3 text-xs">
                <div className="w-6 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 text-zinc-700 dark:text-zinc-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-zinc-900 dark:text-white">
                    Root Cause & Recommended Action:
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                    {item.aiRecommendation}
                  </p>
                </div>
              </div>

              {/* 3-Way System Balance Comparison Strip */}
              <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-semibold font-sans">1. MIPS Scheduled</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">
                    {item.mipsQty.toLocaleString()} units
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-semibold font-sans">2. WMS Floor Count</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">
                    {item.wmsQty.toLocaleString()} units
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-semibold font-sans">3. Net Variance</span>
                  <span className={`text-sm font-bold ${item.varianceQty < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {item.varianceQty > 0 ? `+${item.varianceQty}` : item.varianceQty} units
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-semibold font-sans">Financial Impact</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    ${item.financialImpact.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <span className="text-[11px]">Systems Synchronized:</span>
                  {item.affectedSystems.map((s) => (
                    <span key={s} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded font-mono text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playTactileTick();
                      setInspectedItem(item);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                  >
                    3-Way Audit Inspector
                  </button>

                  {item.status === 'pending_approval' && (
                    <>
                      <button
                        onClick={() => {
                          playTactileTick();
                          onDismissItem(item.id);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-md transition-colors"
                      >
                        Dismiss
                      </button>

                      <button
                        onClick={() => {
                          playSuccessChime();
                          onApproveItem(item.id, currentSupervisor, currentShift);
                        }}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Sync</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Compact Table View */
        <div className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-3">ID / Zone</th>
                  <th className="px-4 py-3">SKU & Product</th>
                  <th className="px-4 py-3">Line & Run</th>
                  <th className="px-4 py-3 text-right">MIPS</th>
                  <th className="px-4 py-3 text-right">WMS</th>
                  <th className="px-4 py-3 text-right">Variance</th>
                  <th className="px-4 py-3 text-right">Impact</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-zinc-900 dark:text-white">
                      <div>{item.id}</div>
                      <div className="text-[10px] text-zinc-400 font-sans">Zone #{item.hotspotNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-900 dark:text-white max-w-[200px] truncate">{item.skuName}</div>
                      <div className="text-[10px] font-mono text-zinc-400">{item.sku}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      <div>{item.plantLine}</div>
                      <div className="text-[10px] font-mono text-zinc-400">{item.runNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-zinc-800 dark:text-zinc-200">
                      {item.mipsQty.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-zinc-800 dark:text-zinc-200">
                      {item.wmsQty.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span className={item.varianceQty < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
                        {item.varianceQty > 0 ? `+${item.varianceQty}` : item.varianceQty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-white">
                      ${item.financialImpact.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.status === 'approved_executed' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === 'pending_approval' ? (
                        <button
                          onClick={() => {
                            playSuccessChime();
                            onApproveItem(item.id, currentSupervisor, currentShift);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 rounded shadow-2xs"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => setInspectedItem(item)}
                          className="px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                        >
                          Audit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3-Way System Audit Inspector Modal / Drawer */}
      <AnimatePresence>
        {inspectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-[#111317] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-xl w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
                    {inspectedItem.id} · 3-Way System Audit Inspector
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white font-display">
                    {inspectedItem.skuName}
                  </h3>
                </div>
                <button
                  onClick={() => setInspectedItem(null)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="font-semibold text-zinc-900 dark:text-white mb-1">Root Cause Explanation</div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {inspectedItem.aiRecommendation}
                  </p>
                </div>

                {/* 3-Way Status Inspection Cards */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <span className="text-[10px] text-zinc-400 block font-semibold">MIPS (MES)</span>
                    <strong className="font-mono text-sm text-zinc-900 dark:text-white">{inspectedItem.mipsQty.toLocaleString()}</strong>
                    <div className="text-[10px] text-zinc-500">Scheduled demand</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <span className="text-[10px] text-zinc-400 block font-semibold">WMS (Floor)</span>
                    <strong className="font-mono text-sm text-zinc-900 dark:text-white">{inspectedItem.wmsQty.toLocaleString()}</strong>
                    <div className="text-[10px] text-zinc-500">Physical scans</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <span className="text-[10px] text-zinc-400 block font-semibold">Variance Impact</span>
                    <strong className="font-mono text-sm text-rose-600 dark:text-rose-400">{inspectedItem.varianceQty > 0 ? `+${inspectedItem.varianceQty}` : inspectedItem.varianceQty}</strong>
                    <div className="text-[10px] text-zinc-500">${inspectedItem.financialImpact.toLocaleString()} at risk</div>
                  </div>
                </div>

                <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-1.5">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold">Recommended Automated Fix</span>
                  <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                    {inspectedItem.proposedAction}
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-zinc-400 text-[11px]">
                    <span>Systems to update:</span>
                    {inspectedItem.affectedSystems.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  onClick={() => setInspectedItem(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900"
                >
                  Close
                </button>
                {inspectedItem.status === 'pending_approval' && (
                  <button
                    onClick={() => {
                      playSuccessChime();
                      onApproveItem(inspectedItem.id, currentSupervisor, currentShift);
                      setInspectedItem(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-md"
                  >
                    Authorize & Sync Multi-System Fix
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
