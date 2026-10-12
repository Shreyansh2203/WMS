import React, { useState, useMemo } from 'react';
import { ReconciliationItem, HotspotNumber } from '../../types';
import { HOTSPOT_METADATA } from '../../data/mockData';
import {
  Check,
  X,
  Search,
  Download,
  CheckCircle2,
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
} from 'lucide-react';
import { exportToCSV } from '../../utils/formatters';

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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
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
        item.plantLine.toLowerCase().includes(searchQuery.toLowerCase());
      return matchHotspot && matchStatus && matchSearch;
    });
  }, [items, selectedHotspotFilter, statusFilter, searchQuery]);

  const pendingCount = items.filter((i) => i.status === 'pending_approval').length;
  const approvedCount = items.filter((i) => i.status === 'approved_executed').length;
  const pendingExposure = items
    .filter((i) => i.status === 'pending_approval')
    .reduce((acc, i) => acc + i.financialImpact, 0);

  const handleExportCSV = () => {
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
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-[#1e293b] rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              <span>Plant LV-04</span>
              <span>/</span>
              <span>Variance Triage</span>
              <span>/</span>
              <span>Three-Way Balance</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white mt-1">
              Production Discrepancy & Reconciliation Queue
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Audits production work orders against warehouse physical counts to prevent duplicate runs and ledger divergence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-50 dark:bg-[#141a27] border border-slate-200 dark:border-[#1e293b] rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-[#1e293b]">
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Pending Sign-off</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-slate-900 dark:text-white tabular-nums">
              {pendingCount} items
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Pending Exposure</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-slate-900 dark:text-white tabular-nums">
              ${pendingExposure.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Approved & Synced</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
              {approvedCount} records
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Active Shift Lead</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-slate-900 dark:text-white">
              {currentSupervisor}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar & Content */}
      <div className="bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-[#1e293b] rounded-lg overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 dark:border-[#1e293b] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Segmented Filter */}
          <div className="inline-flex bg-slate-100 dark:bg-[#141a27] p-0.5 rounded border border-slate-200 dark:border-[#1e293b] text-xs">
            <button
              onClick={() => setStatusFilter('pending_approval')}
              className={`px-3 py-1 rounded transition-colors ${
                statusFilter === 'pending_approval'
                  ? 'bg-white dark:bg-[#1e293b] text-slate-950 dark:text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Needs Review ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('approved_executed')}
              className={`px-3 py-1 rounded transition-colors ${
                statusFilter === 'approved_executed'
                  ? 'bg-white dark:bg-[#1e293b] text-slate-950 dark:text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-[#1e293b] text-slate-950 dark:text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({items.length})
            </button>
          </div>

          {/* Search, Zone Dropdown & Layout Mode */}
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search SKU, work order, line..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1 text-xs rounded border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#141a27] text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <select
              value={selectedHotspotFilter}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : (Number(e.target.value) as HotspotNumber);
                onSetHotspotFilter(val);
              }}
              className="text-xs py-1 px-2.5 rounded border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#141a27] text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Zones</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  Zone {n}: {HOTSPOT_METADATA[n].title.slice(0, 20)}...
                </option>
              ))}
            </select>

            <div className="flex items-center bg-slate-100 dark:bg-[#141a27] p-0.5 rounded border border-slate-200 dark:border-[#1e293b]">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1 rounded ${viewMode === 'table' ? 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-xs' : 'text-slate-400'}`}
                title="Table view"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1 rounded ${viewMode === 'cards' ? 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-xs' : 'text-slate-400'}`}
                title="Card view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            No records found matching criteria.
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-[#141a27] border-b border-slate-200 dark:border-[#1e293b] text-slate-500 font-mono text-[10px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Record ID / Zone</th>
                  <th className="px-4 py-2.5">SKU & Product</th>
                  <th className="px-4 py-2.5">Work Order / Line</th>
                  <th className="px-4 py-2.5 text-right">MIPS</th>
                  <th className="px-4 py-2.5 text-right">WMS</th>
                  <th className="px-4 py-2.5 text-right">Discrepancy</th>
                  <th className="px-4 py-2.5 text-right">Exposure</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e293b]">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#141a27] transition-colors"
                  >
                    <td className="px-4 py-2.5 font-mono">
                      <div className="font-semibold text-slate-900 dark:text-white">{item.id}</div>
                      <div className="text-[10px] text-slate-400">Zone {item.hotspotNumber}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-900 dark:text-white font-mono">{item.sku}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{item.skuName}</div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px]">
                      <div className="text-slate-800 dark:text-slate-200">{item.workOrder}</div>
                      <div className="text-slate-400">{item.plantLine}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-900 dark:text-white">
                      {item.mipsQty.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-900 dark:text-white">
                      {item.wmsQty.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums font-semibold">
                      <span className={item.varianceQty < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
                        {item.varianceQty > 0 ? `+${item.varianceQty}` : item.varianceQty}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      ${item.financialImpact.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono text-[11px]">
                      {item.status === 'approved_executed' ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">Reconciled</span>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400 font-medium">Pending Review</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectedItem(item)}
                          className="px-2 py-0.8 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                          Audit
                        </button>
                        {item.status === 'pending_approval' && (
                          <button
                            onClick={() => onApproveItem(item.id, currentSupervisor, currentShift)}
                            className="px-2.5 py-0.8 text-xs bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 font-medium rounded hover:bg-slate-800 dark:hover:bg-white"
                          >
                            Authorize
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 dark:border-[#1e293b] rounded-lg p-4 bg-white dark:bg-[#0e131f] space-y-3"
              >
                <div className="flex justify-between items-baseline text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-950 dark:text-white">{item.id}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono text-slate-500">{item.sku}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">Zone {item.hotspotNumber}</span>
                </div>

                <div>
                  <div className="font-medium text-sm text-slate-900 dark:text-white">{item.skuName}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {item.workOrder} · {item.plantLine}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#141a27] p-2 rounded text-xs text-slate-700 dark:text-slate-300">
                  {item.aiRecommendation}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono py-1 border-y border-slate-100 dark:border-[#1e293b]">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">MIPS</span>
                    <span className="text-slate-900 dark:text-white tabular-nums">{item.mipsQty.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">WMS</span>
                    <span className="text-slate-900 dark:text-white tabular-nums">{item.wmsQty.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Discrepancy</span>
                    <span className={`tabular-nums font-semibold ${item.varianceQty < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {item.varianceQty > 0 ? `+${item.varianceQty}` : item.varianceQty}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono font-semibold text-xs text-slate-900 dark:text-white">
                    ${item.financialImpact.toLocaleString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectedItem(item)}
                      className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      Audit
                    </button>
                    {item.status === 'pending_approval' && (
                      <button
                        onClick={() => onApproveItem(item.id, currentSupervisor, currentShift)}
                        className="px-3 py-1 text-xs bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 font-medium rounded"
                      >
                        Authorize
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Detail Inspector Drawer */}
      {inspectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-[#1e293b] rounded-lg shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e293b]">
              <div>
                <span className="text-[11px] font-mono text-slate-400">Three-Way Ledger Comparison</span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white font-mono">
                  {inspectedItem.id} · {inspectedItem.sku}
                </h3>
              </div>
              <button
                onClick={() => setInspectedItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-[#141a27] rounded border border-slate-200/60 dark:border-[#1e293b]">
                <div className="font-semibold text-slate-900 dark:text-white mb-1">Diagnostic Root Cause</div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {inspectedItem.aiRecommendation}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2 border border-slate-200 dark:border-[#1e293b] rounded">
                  <span className="text-[10px] text-slate-400 block font-sans">MIPS Scheduled</span>
                  <strong className="text-sm text-slate-900 dark:text-white tabular-nums">{inspectedItem.mipsQty.toLocaleString()}</strong>
                </div>
                <div className="p-2 border border-slate-200 dark:border-[#1e293b] rounded">
                  <span className="text-[10px] text-slate-400 block font-sans">WMS Scan</span>
                  <strong className="text-sm text-slate-900 dark:text-white tabular-nums">{inspectedItem.wmsQty.toLocaleString()}</strong>
                </div>
                <div className="p-2 border border-slate-200 dark:border-[#1e293b] rounded">
                  <span className="text-[10px] text-slate-400 block font-sans">Exposure</span>
                  <strong className="text-sm text-amber-700 dark:text-amber-400 tabular-nums">${inspectedItem.financialImpact.toLocaleString()}</strong>
                </div>
              </div>

              <div className="p-3 border border-slate-200 dark:border-[#1e293b] rounded text-slate-700 dark:text-slate-300">
                <span className="text-[11px] font-mono text-slate-400 block uppercase mb-1">Proposed Corrective Action</span>
                <p className="font-medium">{inspectedItem.proposedAction}</p>
                <div className="mt-2 text-[11px] font-mono text-slate-400">
                  Target Systems: {inspectedItem.affectedSystems.join(', ')}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setInspectedItem(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                Close
              </button>
              {inspectedItem.status === 'pending_approval' && (
                <button
                  onClick={() => {
                    onApproveItem(inspectedItem.id, currentSupervisor, currentShift);
                    setInspectedItem(null);
                  }}
                  className="px-3.5 py-1.5 text-xs bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 rounded font-medium"
                >
                  Authorize Adjustment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
