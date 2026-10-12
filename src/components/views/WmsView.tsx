import React, { useState, useMemo } from 'react';
import { FreezerLot, WmsBayStatus, DensityMode } from '../../types';
import {
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Layers,
  RotateCw,
  X,
  Grid3X3,
  LayoutGrid,
} from 'lucide-react';
import { exportToCSV } from '../../utils/formatters';

interface WmsViewProps {
  lots: FreezerLot[];
  bays: WmsBayStatus[];
  density?: DensityMode;
  onDeductLot: (lotId: string) => void;
  onRefreshTelemetry?: () => void;
}

export const WmsView: React.FC<WmsViewProps> = ({
  lots,
  bays,
  density = 'comfortable',
  onDeductLot,
  onRefreshTelemetry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [lotStatusFilter, setLotStatusFilter] = useState<'all' | 'pending' | 'deducted'>('all');
  const [selectedLotForInspection, setSelectedLotForInspection] = useState<FreezerLot | null>(null);
  const [bayViewMode, setBayViewMode] = useState<'cards' | 'heatmap'>('cards');
  const [selectedHeatmapSlot, setSelectedHeatmapSlot] = useState<string | null>(null);

  const isCompact = density === 'compact';

  // Compute metrics
  const pendingLots = useMemo(() => {
    return lots.filter((l) => l.wmsStatus === 'Ghost - Pending Deduction');
  }, [lots]);

  const totalGhostUnits = useMemo(() => {
    return pendingLots.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [pendingLots]);

  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      const matchesSearch =
        lot.lotId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (lotStatusFilter === 'pending') return lot.wmsStatus === 'Ghost - Pending Deduction';
      if (lotStatusFilter === 'deducted') return lot.wmsStatus === 'Deducted';
      return true;
    });
  }, [lots, searchQuery, lotStatusFilter]);

  const handleExportCSV = () => {
    const data = lots.map((l) => ({
      Lot_ID: l.lotId,
      SKU: l.sku,
      Description: l.description,
      Quantity_Units: l.quantity,
      Used_Date: l.usedDate,
      Moved_From: l.movedFromLine,
      Moved_To: l.movedToLine,
      Status: l.wmsStatus,
      Impact_Notes: l.impactNote,
    }));
    exportToCSV(data, 'WMS_Inventory_Lots_Audit');
  };

  // Generate 24 physical pallet rack slots for Blast Freezer Bay F-14
  const freezerRackSlots = useMemo(() => {
    const rows = ['A', 'B', 'C', 'D'];
    const cols = [1, 2, 3, 4, 5, 6];
    const ghostLotIds = ['LV94', 'LV98', 'LV88'];
    let ghostIndex = 0;

    return rows.flatMap((row) =>
      cols.map((col) => {
        const slotId = `F14-${row}${col}`;
        const isGhost = (row === 'B' && col === 3) || (row === 'C' && col === 1) || (row === 'D' && col === 5);
        const isEmpty = (row === 'A' && col === 2) || (row === 'D' && col === 6);
        const assignedGhostLot = isGhost ? lots.find((l) => l.lotId === ghostLotIds[ghostIndex++ % ghostLotIds.length]) : undefined;

        return {
          slotId,
          isGhost,
          isEmpty,
          lot: assignedGhostLot,
          temp: '-18.4°F',
        };
      })
    );
  }, [lots]);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/90 dark:border-[#1a2336]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>Enterprise Operations</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-200 font-medium">Warehouse Management System</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-950 dark:text-white tracking-tight mt-1">
            WMS Physical & Cold Storage Console
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Real-time warehouse zone occupancy, blast freezer ghost lot reconciliation, and pallet scanning telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRefreshTelemetry && (
            <button
              onClick={onRefreshTelemetry}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#121724] border border-slate-200/90 dark:border-[#1e273a] rounded hover:bg-slate-50 dark:hover:bg-[#161e2e] transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Poll RF Scanners</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#121724] border border-slate-200/90 dark:border-[#1e273a] rounded hover:bg-slate-50 dark:hover:bg-[#161e2e] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export WMS Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Tracked Pallet Volume</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
            11,920 <span className="text-xs text-slate-500 font-sans font-normal">plts</span>
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Across 4 plant storage sectors
          </div>
        </div>

        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Pending Ghost Units</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
            {totalGhostUnits.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {pendingLots.length} ghost lots awaiting deduction
          </div>
        </div>

        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Cold Storage Sub-Inv</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums flex items-baseline gap-1.5">
            <Thermometer className="w-4 h-4 text-sky-500 shrink-0 self-center" />
            -18.4°F
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Bay F-14 Blast Freezer Nominal
          </div>
        </div>

        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Handheld RF Scanners</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            34 / 34 Online
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Zero dropped barcode packets
          </div>
        </div>
      </div>

      {/* Warehouse Zone & Sub-Inventory Capacity Grid with 2D Heatmap Toggle */}
      <div className="rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">Warehouse Zone Capacity & Rack Mapping</h2>
            <p className="text-xs text-slate-500 mt-0.5">Physical bay occupancy and sub-inventory rack status flags</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-[#121725] rounded border border-slate-200/80 dark:border-[#1a2336]">
              <button
                onClick={() => setBayViewMode('cards')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  bayViewMode === 'cards'
                    ? 'bg-white dark:bg-[#1c2438] text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Zone Cards</span>
              </button>
              <button
                onClick={() => setBayViewMode('heatmap')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  bayViewMode === 'heatmap'
                    ? 'bg-white dark:bg-[#1c2438] text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>2D Rack Heatmap</span>
              </button>
            </div>
          </div>
        </div>

        {bayViewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bays.map((bay) => {
              const utilizationPct = Math.round((bay.currentPallets / bay.capacityPallets) * 100);
              const hasIssue = bay.status === 'ghost_inventory_flagged';

              return (
                <div
                  key={bay.bayId}
                  className="p-3.5 rounded bg-slate-50/70 dark:bg-[#101522] border border-slate-200/80 dark:border-[#1e273a] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>{bay.bayId}</span>
                      {bay.temperature && (
                        <span className="text-sky-600 dark:text-sky-400 font-semibold">{bay.temperature}</span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                      {bay.zone}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Occupancy:</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
                        {bay.currentPallets.toLocaleString()} / {bay.capacityPallets.toLocaleString()} ({utilizationPct}%)
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 dark:bg-[#1a2336] h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          hasIssue ? 'bg-slate-600 dark:bg-slate-400' : 'bg-slate-800 dark:bg-slate-300'
                        }`}
                        style={{ width: `${utilizationPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-[#1a2336]/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Status</span>
                    {hasIssue ? (
                      <span className="text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        3 Ghost Lots Flagged
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Nominal
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 2D Physical Rack Heatmap for Cold Storage Bay F-14 */
          <div className="p-4 rounded bg-slate-50/70 dark:bg-[#101522] border border-slate-200/80 dark:border-[#1e273a]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-[#1e273a] text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white">Cold Storage Bay F-14 Rack Layout</span>
                <span className="text-slate-400">·</span>
                <span className="font-mono text-slate-500">4 Racks × 6 Tier Bins</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600/80" />
                  <span className="text-slate-600 dark:text-slate-400">Occupied Stock</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-600" />
                  <span className="text-slate-600 dark:text-slate-400">Ghost Lot Flagged</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-700" />
                  <span className="text-slate-600 dark:text-slate-400">Available Slot</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2.5 mt-3">
              {freezerRackSlots.map((slot) => (
                <button
                  key={slot.slotId}
                  onClick={() => {
                    setSelectedHeatmapSlot(slot.slotId);
                    if (slot.lot) setSelectedLotForInspection(slot.lot);
                  }}
                  className={`p-2.5 rounded border text-left transition-all ${
                    slot.isGhost
                      ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 hover:scale-[1.02]'
                      : slot.isEmpty
                      ? 'bg-slate-100/50 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700 text-slate-400'
                      : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-semibold">{slot.slotId}</span>
                    <span className="text-[10px] text-slate-400">{slot.temp}</span>
                  </div>
                  <div className="text-[11px] mt-1 font-medium truncate">
                    {slot.isGhost ? (
                      <span className="text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {slot.lot?.lotId || 'Ghost Lot'}
                      </span>
                    ) : slot.isEmpty ? (
                      'Empty Bin'
                    ) : (
                      'Stored Pallet'
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ghost Lot Reconciliation Section (Hotspot #7) */}
      <div className="rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-200/90 dark:border-[#1a2336] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white flex items-center gap-2">
                <span>Freezer Ghost Lots & Inventory Deduction Ledger</span>
                <span className="text-xs font-mono text-slate-500 font-normal">(Hotspot #7)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical batches consumed during line shift changes that remain unconsumed in WMS master ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter segments */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-[#121725] rounded border border-slate-200/80 dark:border-[#1a2336]">
              <button
                onClick={() => setLotStatusFilter('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  lotStatusFilter === 'all'
                    ? 'bg-white dark:bg-[#1c2438] text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Lots ({lots.length})
              </button>
              <button
                onClick={() => setLotStatusFilter('pending')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  lotStatusFilter === 'pending'
                    ? 'bg-white dark:bg-[#1c2438] text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pending ({pendingLots.length})
              </button>
              <button
                onClick={() => setLotStatusFilter('deducted')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  lotStatusFilter === 'deducted'
                    ? 'bg-white dark:bg-[#1c2438] text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Reconciled ({lots.length - pendingLots.length})
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter lot / SKU..."
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
                <th className="py-2.5 px-4 font-medium">Lot Identifier</th>
                <th className="py-2.5 px-4 font-medium">SKU & Product Name</th>
                <th className="py-2.5 px-4 font-medium text-right">Ghost Qty (Units)</th>
                <th className="py-2.5 px-4 font-medium">Physical Line Movement</th>
                <th className="py-2.5 px-4 font-medium">Status & Impact</th>
                <th className="py-2.5 px-4 font-medium text-right">Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-[#172033]">
              {filteredLots.map((lot) => {
                const isPending = lot.wmsStatus === 'Ghost - Pending Deduction';
                const cellPadding = isCompact ? 'py-2 px-3' : 'py-3 px-4';

                return (
                  <tr
                    key={lot.lotId}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#111726] transition-colors group cursor-pointer"
                    onClick={() => setSelectedLotForInspection(lot)}
                  >
                    <td className={`${cellPadding} font-mono font-medium text-slate-900 dark:text-white`}>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lot.lotId}</span>
                      </div>
                    </td>
                    <td className={cellPadding}>
                      <div className="font-medium text-slate-900 dark:text-slate-200">{lot.description}</div>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">{lot.sku}</div>
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-semibold tabular-nums text-slate-950 dark:text-white`}>
                      {lot.quantity.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} font-mono text-slate-600 dark:text-slate-400`}>
                      <span className="text-slate-900 dark:text-slate-200">{lot.movedFromLine}</span>
                      <span className="mx-1 text-slate-400">→</span>
                      <span className="text-slate-900 dark:text-slate-200">{lot.movedToLine}</span>
                      <div className="text-[11px] text-slate-500">Run shift {lot.usedDate}</div>
                    </td>
                    <td className={cellPadding}>
                      {isPending ? (
                        <div>
                          <div className="text-slate-900 dark:text-slate-200 font-medium">Ghost - Pending Deduction</div>
                          <div className="text-slate-500 text-[11px] truncate max-w-xs">{lot.impactNote}</div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Deducted & Cleared</span>
                        </div>
                      )}
                    </td>
                    <td className={`${cellPadding} text-right`} onClick={(e) => e.stopPropagation()}>
                      {isPending ? (
                        <button
                          onClick={() => onDeductLot(lot.lotId)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-900 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-[#1a2336] dark:hover:bg-[#232f48] border border-slate-300 dark:border-[#2a3852] rounded transition-colors shadow-xs"
                        >
                          Execute Deduction
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400">Ledger Balanced</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lot Inspection Drawer */}
      {selectedLotForInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1018] rounded-lg border border-slate-200 dark:border-[#1a2336] shadow-2xl max-w-lg w-full p-6 text-left relative">
            <button
              onClick={() => setSelectedLotForInspection(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              <span>WMS Sub-Inventory Detail</span>
              <span>·</span>
              <span>{selectedLotForInspection.lotId}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
              {selectedLotForInspection.description}
            </h3>
            <p className="text-xs font-mono text-slate-500 mt-0.5">{selectedLotForInspection.sku}</p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded bg-slate-50 dark:bg-[#121725] border border-slate-200/80 dark:border-[#1a2336]">
                <div className="text-slate-500 font-mono">Quantity on Record</div>
                <div className="text-base font-semibold font-mono text-slate-950 dark:text-white mt-1">
                  {selectedLotForInspection.quantity.toLocaleString()} units
                </div>
              </div>
              <div className="p-3 rounded bg-slate-50 dark:bg-[#121725] border border-slate-200/80 dark:border-[#1a2336]">
                <div className="text-slate-500 font-mono">Operational Status</div>
                <div className="text-base font-semibold text-slate-950 dark:text-white mt-1">
                  {selectedLotForInspection.wmsStatus}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded bg-slate-50 dark:bg-[#121725] border border-slate-200/80 dark:border-[#1a2336] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Run Switchover Date:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200">{selectedLotForInspection.usedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Moved From:</span>
                <span className="text-slate-900 dark:text-slate-200">{selectedLotForInspection.movedFromLine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Moved To:</span>
                <span className="text-slate-900 dark:text-slate-200">{selectedLotForInspection.movedToLine}</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-slate-200">Incident Analysis: </span>
              {selectedLotForInspection.impactNote}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedLotForInspection(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Close
              </button>
              {selectedLotForInspection.wmsStatus === 'Ghost - Pending Deduction' && (
                <button
                  onClick={() => {
                    onDeductLot(selectedLotForInspection.lotId);
                    setSelectedLotForInspection(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-950 rounded hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  Confirm & Deduct Lot
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
