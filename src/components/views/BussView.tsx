import React, { useState, useMemo } from 'react';
import { BussSalesOrder, DensityMode } from '../../types';
import {
  Search,
  Download,
  AlertCircle,
  CheckCircle2,
  Split,
  Building2,
  X,
  Sliders,
} from 'lucide-react';
import { exportToCSV } from '../../utils/formatters';

interface BussViewProps {
  orders: BussSalesOrder[];
  density?: DensityMode;
  onRebalanceOrderAllocation?: (orderId1: string, orderId2: string) => void;
  onSelectOrder?: (order: BussSalesOrder) => void;
}

export const BussView: React.FC<BussViewProps> = ({
  orders,
  density = 'comfortable',
  onRebalanceOrderAllocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'conflicts' | 'allocated'>('all');
  const [selectedOrder, setSelectedOrder] = useState<BussSalesOrder | null>(null);
  const [resolvedConflictOrders, setResolvedConflictOrders] = useState<string[]>([]);
  const [splitToLine1, setSplitToLine1] = useState<number>(1000); // 1,000 to SO, remainder (500) to SP

  const isCompact = density === 'compact';
  const totalAvailableInventory = 1500;
  const splitToLine2 = Math.max(0, totalAvailableInventory - splitToLine1);

  // Computed metrics
  const activeOrders = useMemo(() => {
    return orders.map((o) => {
      if (resolvedConflictOrders.includes(o.orderId)) {
        return {
          ...o,
          status: 'allocated' as const,
          conflictReason: undefined,
          allocatedQty: o.orderId === 'SO-9104' ? splitToLine1 : o.orderId === 'SP-4412' ? splitToLine2 : o.allocatedQty,
        };
      }
      return o;
    });
  }, [orders, resolvedConflictOrders, splitToLine1, splitToLine2]);

  const conflictsCount = useMemo(() => {
    return activeOrders.filter((o) => o.status === 'conflict_flagged' || o.status === 'pending_split').length;
  }, [activeOrders]);

  const totalDemandUnits = useMemo(() => {
    return activeOrders.reduce((acc, curr) => acc + curr.orderQty, 0);
  }, [activeOrders]);

  const totalAllocatedUnits = useMemo(() => {
    return activeOrders.reduce((acc, curr) => acc + curr.allocatedQty, 0);
  }, [activeOrders]);

  const filteredOrders = useMemo(() => {
    return activeOrders.filter((order) => {
      const matchesSearch =
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.skuName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterType === 'conflicts') return order.status === 'conflict_flagged' || order.status === 'pending_split';
      if (filterType === 'allocated') return order.status === 'allocated' || order.status === 'dispatched';
      return true;
    });
  }, [activeOrders, searchQuery, filterType]);

  const handleResolveVanillaConflict = () => {
    setResolvedConflictOrders((prev) => [...prev, 'SO-9104', 'SP-4412']);
    if (onRebalanceOrderAllocation) {
      onRebalanceOrderAllocation('SO-9104', 'SP-4412');
    }
  };

  const isVanillaConflictResolved = resolvedConflictOrders.includes('SO-9104');

  const handleExportCSV = () => {
    const data = activeOrders.map((o) => ({
      Order_ID: o.orderId,
      Customer: o.customer,
      SKU: o.sku,
      Product_Name: o.skuName,
      Order_Type: o.orderType,
      Order_Qty: o.orderQty,
      Allocated_Qty: o.allocatedQty,
      Scheduled_Line: o.scheduledLine,
      Ship_Date: o.shipDate,
      Status: o.status,
      Conflict_Note: o.conflictReason || 'None',
    }));
    exportToCSV(data, 'BUSS_Sales_Order_Schedule_Ledger');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/90 dark:border-[#1a2336]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>Enterprise Operations</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-200 font-medium">Order Scheduling & Allocation</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-950 dark:text-white tracking-tight mt-1">
            BUSS Demand Allocation & Sales Schedule
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Commercial order line reservations, customer priority dispatch dates, and multi-line SKU conflict arbitration.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#121724] border border-slate-200/90 dark:border-[#1e273a] rounded hover:bg-slate-50 dark:hover:bg-[#161e2e] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Order Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Committed Gross Demand</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
            {totalDemandUnits.toLocaleString()} <span className="text-xs text-slate-500 font-sans font-normal">units</span>
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Across 6 customer contracts</div>
        </div>

        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Line Allocation Conflicts</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
            {conflictsCount} Flagged
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {conflictsCount > 0 ? 'Requires demand re-distribution' : 'All order lines balanced'}
          </div>
        </div>

        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Net Allocated Inventory</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
            {totalAllocatedUnits.toLocaleString()} units
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {Math.round((totalAllocatedUnits / totalDemandUnits) * 100)}% of backlog filled
          </div>
        </div>

        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Schedule Adherence Rate</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            97.4% Nominal
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Within 24h ship dispatch SLA</div>
        </div>
      </div>

      {/* Featured Resolution Box: Multi-Order Lines Arbitrator (Hotspot #1) with Interactive Proportional Slider */}
      <div className="rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-[#1a2336]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Hotspot #1 Diagnosis</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300">SKU-74398 Family Pack</span>
            </div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white mt-0.5">
              Multi-Order Line Allocation Conflict: Walmart SO-9104 vs Target SP-4412
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              1,500 units on-hand inventory was greedily applied 100% to line 1 (SO-9104), leaving special-pack line 2
              (SP-4412, 2,000 req) with 0 units. Adjust the simulation slider to re-balance on-hand stock proportionally.
            </p>
          </div>

          <div className="shrink-0">
            {!isVanillaConflictResolved ? (
              <button
                onClick={handleResolveVanillaConflict}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 rounded transition-colors shadow-xs"
              >
                <Split className="w-4 h-4" />
                <span>Re-distribute Inventory Across Lines</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold px-3 py-1.5 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                <CheckCircle2 className="w-4 h-4" />
                <span>Allocation Re-balanced ({splitToLine1.toLocaleString()} SO / {splitToLine2.toLocaleString()} SP)</span>
              </div>
            )}
          </div>
        </div>

        {/* Proportional Split Slider Control */}
        <div className="mt-4 p-3.5 rounded bg-slate-50 dark:bg-[#111726] border border-slate-200/80 dark:border-[#1e273a]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Proportional Inventory Allocation Simulation (1,500 Total On-Hand):</span>
            </span>
            <div className="font-mono text-xs">
              <span className="text-slate-900 dark:text-white font-medium">SO-9104: {splitToLine1} units</span>
              <span className="mx-2 text-slate-400">·</span>
              <span className="text-slate-900 dark:text-white font-medium">SP-4412: {splitToLine2} units</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-500 w-16">0 units</span>
            <input
              type="range"
              min="0"
              max="1500"
              step="50"
              value={splitToLine1}
              onChange={(e) => setSplitToLine1(Number(e.target.value))}
              className="flex-1 accent-slate-900 dark:accent-white h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-500 w-16 text-right">1,500 units</span>
          </div>
        </div>

        {/* Visual comparison of the two lines */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded bg-slate-50/70 dark:bg-[#101522] border border-slate-200/80 dark:border-[#1e273a]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-500">Order Line 1 (SO-9104)</span>
              <span className="font-medium text-slate-900 dark:text-white">Walmart DC 6012</span>
            </div>
            <div className="mt-2 text-xs flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Order Quantity:</span>
              <span className="font-mono font-semibold text-slate-950 dark:text-white">1,000 units</span>
            </div>
            <div className="mt-1 text-xs flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Allocated Inventory:</span>
              <span className="font-mono font-semibold text-slate-950 dark:text-white">
                {splitToLine1.toLocaleString()} units ({Math.round((splitToLine1 / 1000) * 100)}%)
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Scheduled Line 2 · Net Required: {Math.max(0, 1000 - splitToLine1).toLocaleString()} units
            </div>
          </div>

          <div className="p-3.5 rounded bg-slate-50/70 dark:bg-[#101522] border border-slate-200/80 dark:border-[#1e273a]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-500">Order Line 2 (SP-4412)</span>
              <span className="font-medium text-slate-900 dark:text-white">Target Mid-Atlantic DC</span>
            </div>
            <div className="mt-2 text-xs flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Order Quantity:</span>
              <span className="font-mono font-semibold text-slate-950 dark:text-white">2,000 units</span>
            </div>
            <div className="mt-1 text-xs flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Allocated Inventory:</span>
              <span className="font-mono font-semibold text-slate-950 dark:text-white">
                {splitToLine2.toLocaleString()} units ({Math.round((splitToLine2 / 2000) * 100)}%)
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Scheduled Line 2 · Net Required: {Math.max(0, 2000 - splitToLine2).toLocaleString()} units
            </div>
          </div>
        </div>
      </div>

      {/* Sales Orders & Dispatch Matrix Table */}
      <div className="rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
        {/* Controls */}
        <div className="p-4 border-b border-slate-200/90 dark:border-[#1a2336] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">
              BUSS Commercial Backlog & Line Allocation Schedule
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active customer contracts, scheduled plant lines, and allocation status
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-[#121725] rounded border border-slate-200/80 dark:border-[#1a2336]">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-[#1c2438] text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Orders ({activeOrders.length})
              </button>
              <button
                onClick={() => setFilterType('conflicts')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  filterType === 'conflicts'
                    ? 'bg-white dark:bg-[#1c2438] text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Conflicts ({conflictsCount})
              </button>
              <button
                onClick={() => setFilterType('allocated')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  filterType === 'allocated'
                    ? 'bg-white dark:bg-[#1c2438] text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Balanced ({activeOrders.length - conflictsCount})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer / order..."
                className="pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-[#121725] border border-slate-200/90 dark:border-[#1a2336] rounded text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 dark:border-[#1a2336] bg-slate-50/60 dark:bg-[#0f1422] text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4 font-medium">Order Number</th>
                <th className="py-2.5 px-4 font-medium">Customer Account</th>
                <th className="py-2.5 px-4 font-medium">SKU / Product</th>
                <th className="py-2.5 px-4 font-medium text-right">Order Qty</th>
                <th className="py-2.5 px-4 font-medium text-right">Allocated Qty</th>
                <th className="py-2.5 px-4 font-medium">Scheduled Line & Date</th>
                <th className="py-2.5 px-4 font-medium">Allocation Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-[#172033]">
              {filteredOrders.map((order) => {
                const hasConflict = order.status === 'conflict_flagged' || order.status === 'pending_split';
                const cellPadding = isCompact ? 'py-2 px-3' : 'py-3 px-4';

                return (
                  <tr
                    key={order.orderId}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#111726] transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className={`${cellPadding} font-mono font-medium text-slate-900 dark:text-white`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#182132] text-slate-600 dark:text-slate-300">
                          {order.orderType}
                        </span>
                        <span>{order.orderId}</span>
                      </div>
                    </td>
                    <td className={cellPadding}>
                      <div className="font-medium text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.customer}</span>
                      </div>
                    </td>
                    <td className={cellPadding}>
                      <div className="font-medium text-slate-900 dark:text-slate-200">{order.skuName}</div>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">{order.sku}</div>
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-semibold tabular-nums text-slate-950 dark:text-white`}>
                      {order.orderQty.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-semibold tabular-nums text-slate-950 dark:text-white`}>
                      {order.allocatedQty.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} font-mono text-slate-600 dark:text-slate-400`}>
                      <div>{order.scheduledLine}</div>
                      <div className="text-[11px] text-slate-500">{order.shipDate}</div>
                    </td>
                    <td className={cellPadding}>
                      {hasConflict ? (
                        <div className="text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Conflict Flagged</span>
                        </div>
                      ) : (
                        <div className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{order.status === 'dispatched' ? 'Dispatched' : 'Allocated'}</span>
                        </div>
                      )}
                    </td>
                    <td className={`${cellPadding} text-right`} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Inspection Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1018] rounded-lg border border-slate-200 dark:border-[#1a2336] shadow-2xl max-w-lg w-full p-6 text-left relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              <span>BUSS Sales Order Specification</span>
              <span>·</span>
              <span>{selectedOrder.orderId}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
              {selectedOrder.customer}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{selectedOrder.skuName} ({selectedOrder.sku})</p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded bg-slate-50 dark:bg-[#121725] border border-slate-200/80 dark:border-[#1a2336]">
                <div className="text-slate-500 font-mono">Order Commitment</div>
                <div className="text-base font-semibold font-mono text-slate-950 dark:text-white mt-1">
                  {selectedOrder.orderQty.toLocaleString()} units
                </div>
              </div>
              <div className="p-3 rounded bg-slate-50 dark:bg-[#121725] border border-slate-200/80 dark:border-[#1a2336]">
                <div className="text-slate-500 font-mono">Allocated from Floor</div>
                <div className="text-base font-semibold font-mono text-slate-950 dark:text-white mt-1">
                  {selectedOrder.allocatedQty.toLocaleString()} units
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded bg-slate-50 dark:bg-[#121725] border border-slate-200/80 dark:border-[#1a2336] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Contract Type:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200">{selectedOrder.orderType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Plant Line:</span>
                <span className="text-slate-900 dark:text-slate-200">{selectedOrder.scheduledLine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Ship Date:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200">{selectedOrder.shipDate}</span>
              </div>
            </div>

            {selectedOrder.conflictReason && (
              <div className="mt-4 p-3 rounded bg-slate-50 dark:bg-[#121725] border border-slate-200/80 dark:border-[#1a2336] text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-slate-200">Allocation Conflict Diagnostics: </span>
                {selectedOrder.conflictReason}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
