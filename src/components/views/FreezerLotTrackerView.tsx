import React from 'react';
import { FreezerLot } from '../../types';
import { Download } from 'lucide-react';
import { exportToCSV } from '../../utils/formatters';

interface FreezerLotTrackerViewProps {
  lots: FreezerLot[];
  onDeductLot: (lotId: string) => void;
}

export const FreezerLotTrackerView: React.FC<FreezerLotTrackerViewProps> = ({ lots, onDeductLot }) => {
  const ghostUnitsTotal = lots
    .filter((l) => l.wmsStatus === 'Ghost - Pending Deduction')
    .reduce((acc, l) => acc + l.quantity, 0);

  const pendingCount = lots.filter((l) => l.wmsStatus === 'Ghost - Pending Deduction').length;

  const handleExportCSV = () => {
    exportToCSV(
      lots.map((l) => ({
        Lot_ID: l.lotId,
        SKU: l.sku,
        Description: l.description,
        Quantity: l.quantity,
        Used_Date: l.usedDate,
        Route: `${l.movedFromLine} -> ${l.movedToLine}`,
        Status: l.wmsStatus,
      })),
      'plantops-freezer-subinventory-lots'
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(255,255,255,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              <span>Plant LV-04</span>
              <span>/</span>
              <span>Cold Chain Sub-Inventory</span>
              <span>/</span>
              <span>-18°C Blast Freezer</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white mt-1">
              Blast Freezer Sub-Inventory & Ghost Lot Reconciliation
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Tracks consumed ingredient and ice cream pallets to reconcile unissued physical warehouse stock.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-50 dark:bg-[#121725] border border-slate-200/90 dark:border-[#1a2336] rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-[#1a2336]">
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Pending Ghost Units</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-rose-700 dark:text-rose-400 tabular-nums">
              {ghostUnitsTotal.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Ghost Lots Requiring Action</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
              {pendingCount} lots
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Storage Temperature</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-blue-700 dark:text-blue-400">
              -18°C Nominal
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Sub-Inventory Code</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white">
              FREEZER_SUB_02
            </div>
          </div>
        </div>
      </div>

      {/* Lot Table */}
      <div className="bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(255,255,255,0.03)]">
        <div className="p-3.5 border-b border-slate-100 dark:border-[#1a2336] flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-950 dark:text-white">
            Monitored Pallet Lots in Cold Storage
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {lots.length} active records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/90 dark:bg-[#101522] border-b border-slate-200/90 dark:border-[#1a2336] text-slate-500 font-mono text-[10px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-2.5">Lot ID</th>
                <th className="px-4 py-2.5">SKU & Product</th>
                <th className="px-4 py-2.5">Inter-Line Transfer Route</th>
                <th className="px-4 py-2.5">Date Consumed</th>
                <th className="px-4 py-2.5 text-right">Units</th>
                <th className="px-4 py-2.5 text-center">WMS Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2336]">
              {lots.map((lot) => {
                const isPending = lot.wmsStatus === 'Ghost - Pending Deduction';
                return (
                  <tr key={lot.lotId} className="hover:bg-slate-50/80 dark:hover:bg-[#111624] transition-colors">
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-950 dark:text-white">
                      {lot.lotId}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-900 dark:text-white font-mono">{lot.sku}</div>
                      <div className="text-[11px] text-slate-500">{lot.description}</div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-700 dark:text-slate-300">
                      {lot.movedFromLine} → {lot.movedToLine}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-500 text-[11px]">
                      {lot.usedDate}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums font-semibold text-slate-950 dark:text-white">
                      {lot.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono text-[11px]">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-[#151c2c] text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-[#222e47]">
                          Pending Deduction
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20">
                          Reconciled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {isPending ? (
                        <button
                          onClick={() => onDeductLot(lot.lotId)}
                          className="px-3 py-1 text-xs bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-medium rounded hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xs transition-colors"
                        >
                          Deduct from WMS
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400">Zero Balance</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
