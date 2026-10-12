import React, { useState, useMemo } from 'react';
import { ConsolidatedPosition } from '../../types';
import { Download, Search, X } from 'lucide-react';
import { exportToCSV } from '../../utils/formatters';

interface ConsolidatePositionViewProps {
  positions: ConsolidatedPosition[];
}

export const ConsolidatePositionView: React.FC<ConsolidatePositionViewProps> = ({ positions }) => {
  const [selectedSku, setSelectedSku] = useState<ConsolidatedPosition | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lineFilter, setLineFilter] = useState<string>('all');

  const filteredPositions = useMemo(() => {
    return positions.filter((p) => {
      const matchSearch =
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLine = lineFilter === 'all' || p.plantLine.includes(lineFilter);
      return matchSearch && matchLine;
    });
  }, [positions, searchQuery, lineFilter]);

  const totalOverproductionPrevented = positions.reduce((acc, p) => acc + p.overproductionPrevented, 0);
  const totalNetRequirement = positions.reduce((acc, p) => acc + p.netRequirement, 0);
  const totalDemand = positions.reduce((acc, p) => acc + p.totalValidDemand, 0);

  const handleExportCSV = () => {
    exportToCSV(
      positions.map((p) => ({
        SKU: p.sku,
        Description: p.description,
        Line: p.plantLine,
        Sales_Date: p.salesDate,
        Total_Valid_Demand: p.totalValidDemand,
        Usable_Inventory: p.usableInventory,
        Completed_Production: p.completedProduction,
        Returns_Adjustments: p.returnsAdjustments,
        Net_True_Requirement: p.netRequirement,
        MIPS_Display_Requirement: p.mipsDisplayRequirement,
        Overproduction_Prevented: p.overproductionPrevented,
        Status: p.status,
      })),
      'plantops-inventory-netting-ledger'
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(255,255,255,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              <span>Plant LV-04</span>
              <span>/</span>
              <span>Netting Engine</span>
              <span>/</span>
              <span>Single Source of Truth</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white mt-1">
              SKU Netting & Consolidated Inventory Ledger
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Net Requirement Equation: Demand - Usable WMS Stock - Completed Production ± Valid Returns. Eliminates multi-day duplicate order scheduling.
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
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Gross Demand</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
              {totalDemand.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">True Net Requirement</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
              {totalNetRequirement.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Averted Overproduction</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
              +{totalOverproductionPrevented.toLocaleString()} units
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Active Lines Tracked</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
              5 Lines (188 SKUs)
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(255,255,255,0.03)]">
        {/* Table Controls */}
        <div className="p-3.5 border-b border-slate-100 dark:border-[#1a2336] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by SKU or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1 text-xs rounded border border-slate-200/90 dark:border-[#1a2336] bg-slate-50 dark:bg-[#121725] text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
              />
            </div>

            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="text-xs py-1 px-2.5 rounded border border-slate-200/90 dark:border-[#1a2336] bg-slate-50 dark:bg-[#121725] text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Lines</option>
              <option value="Line 1">Line 1 (Bulk Tub)</option>
              <option value="Line 2">Line 2 (Filling)</option>
              <option value="Line 3">Line 3 (Novelty)</option>
              <option value="Line 4">Line 4 (Cups & Cones)</option>
              <option value="Line 5">Line 5 (Pints)</option>
            </select>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Showing {filteredPositions.length} of {positions.length} records
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/90 dark:bg-[#101522] border-b border-slate-200/90 dark:border-[#1a2336] text-slate-500 font-mono text-[10px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-2.5">SKU & Product</th>
                <th className="px-4 py-2.5">Line</th>
                <th className="px-4 py-2.5 text-right">Gross Demand</th>
                <th className="px-4 py-2.5 text-right">Usable WMS</th>
                <th className="px-4 py-2.5 text-right">Completed</th>
                <th className="px-4 py-2.5 text-right">Returns</th>
                <th className="px-4 py-2.5 text-right">True Net Req</th>
                <th className="px-4 py-2.5 text-right">Averted Units</th>
                <th className="px-4 py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2336]">
              {filteredPositions.map((pos) => (
                <tr
                  key={pos.sku}
                  onClick={() => setSelectedSku(pos)}
                  className="hover:bg-slate-50/80 dark:hover:bg-[#111624] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-slate-950 dark:text-white font-mono">{pos.sku}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[220px]">{pos.description}</div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    {pos.plantLine}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-900 dark:text-white font-medium">
                    {pos.totalValidDemand.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {pos.usableInventory.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {pos.completedProduction.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {pos.returnsAdjustments >= 0 ? `+${pos.returnsAdjustments}` : pos.returnsAdjustments}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums font-semibold text-slate-950 dark:text-white">
                    {pos.netRequirement.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold">
                    +{pos.overproductionPrevented.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono text-[11px]">
                    {pos.status === 'reconciled' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20">
                        Reconciled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-[#151c2c] text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-[#222e47]">
                        Flagged
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SKU Netting Detail Modal/Drawer */}
      {selectedSku && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] rounded-lg shadow-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1a2336]">
              <div>
                <span className="text-[11px] font-mono text-slate-400">SKU Netting Calculation Audit</span>
                <h3 className="text-base font-semibold text-slate-950 dark:text-white font-mono">
                  {selectedSku.sku} · {selectedSku.description}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSku(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#1a2336]">
                <span className="text-slate-500">1. Total Confirmed Demand:</span>
                <span className="font-semibold text-slate-950 dark:text-white tabular-nums">{selectedSku.totalValidDemand.toLocaleString()} units</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#1a2336]">
                <span className="text-slate-500">2. Less: Usable WMS On-Hand:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">-{selectedSku.usableInventory.toLocaleString()} units</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#1a2336]">
                <span className="text-slate-500">3. Less: Completed Floor Output:</span>
                <span className="text-slate-700 dark:text-slate-300 tabular-nums">-{selectedSku.completedProduction.toLocaleString()} units</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#1a2336]">
                <span className="text-slate-500">4. Plus: Valid Staging Returns:</span>
                <span className="text-slate-800 dark:text-slate-200 tabular-nums">+{selectedSku.returnsAdjustments.toLocaleString()} units</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-semibold bg-slate-50 dark:bg-[#121725] border border-slate-200/80 dark:border-[#1a2336] px-3 rounded">
                <span className="text-slate-900 dark:text-white">Authoritative Net Requirement:</span>
                <span className="text-slate-950 dark:text-white tabular-nums">{selectedSku.netRequirement.toLocaleString()} units</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50/80 dark:bg-[#111726] p-3 rounded border border-slate-200/70 dark:border-[#182133] leading-relaxed">
              MIPS unnetted view was requesting <strong>{selectedSku.mipsDisplayRequirement.toLocaleString()} units</strong>. By recognizing verified warehouse stock, the system averted <strong>{selectedSku.overproductionPrevented.toLocaleString()} units</strong> of unnecessary overproduction.
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-[#1a2336]">
              <button
                onClick={() => setSelectedSku(null)}
                className="px-3.5 py-1.5 text-xs bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded font-medium shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
