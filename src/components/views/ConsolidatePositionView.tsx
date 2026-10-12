import React, { useState, useMemo } from 'react';
import { ConsolidatedPosition } from '../../types';
import { Calculator, CheckCircle2, AlertTriangle, ArrowRight, Download, Search, Info, HelpCircle, Sliders, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { exportToCSV } from '../../utils/formatters';
import { playTactileTick, playSuccessChime } from '../../utils/audio';

interface ConsolidatePositionViewProps {
  positions: ConsolidatedPosition[];
}

export const ConsolidatePositionView: React.FC<ConsolidatePositionViewProps> = ({ positions }) => {
  const [selectedSku, setSelectedSku] = useState<ConsolidatedPosition>(positions[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormulaExplainer, setShowFormulaExplainer] = useState(false);
  
  // Interactive Simulation state
  const [simReturnDelta, setSimReturnDelta] = useState(0);
  const [simUsableDelta, setSimUsableDelta] = useState(0);

  const filteredPositions = useMemo(() => {
    return positions.filter(
      (p) =>
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.plantLine.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [positions, searchQuery]);

  const totalOverproductionPrevented = positions.reduce((acc, p) => acc + p.overproductionPrevented, 0);

  const handleExportCSV = () => {
    playTactileTick();
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
      'plantops-consolidated-positions'
    );
  };

  const handleSelectRow = (p: ConsolidatedPosition) => {
    playTactileTick();
    setSelectedSku(p);
    setSimReturnDelta(0);
    setSimUsableDelta(0);
  };

  // Simulated calculation
  const simUsable = selectedSku ? selectedSku.usableInventory + simUsableDelta : 0;
  const simReturns = selectedSku ? selectedSku.returnsAdjustments + simReturnDelta : 0;
  const simulatedNet = selectedSku
    ? Math.max(0, selectedSku.totalValidDemand - simUsable - selectedSku.completedProduction + simReturns)
    : 0;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
                <Calculator className="w-4 h-4" />
              </div>
              <h1 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
                Reconciled SKU Position Ledger & Netting Engine
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Consolidates single true position per SKU across sales days, eliminating duplicate order scheduling and blind work orders.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] text-zinc-500 block">Total Prevented Overproduction</span>
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {totalOverproductionPrevented.toLocaleString()} units
              </span>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/80 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Clean Equation Strip */}
        <div className="mt-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Governing Plant Netting Equation (Single Source of Truth)
            </span>
            <button
              onClick={() => {
                playTactileTick();
                setShowFormulaExplainer((p) => !p);
              }}
              className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showFormulaExplainer ? 'Hide explanation' : 'How does this work?'}</span>
            </button>
          </div>

          <div className="font-mono text-xs sm:text-sm font-semibold flex flex-wrap items-center gap-2 text-zinc-900 dark:text-white">
            <span className="font-bold underline decoration-zinc-400">Net Requirement</span>
            <span className="text-zinc-400">=</span>
            <span>Total Valid Demand</span>
            <span className="text-zinc-400">-</span>
            <span className="text-emerald-600 dark:text-emerald-400">Usable Inventory</span>
            <span className="text-zinc-400">-</span>
            <span className="text-sky-600 dark:text-sky-400">Completed Production</span>
            <span className="text-zinc-400">±</span>
            <span className="text-amber-600 dark:text-amber-400">Valid Returns / Adjustments</span>
          </div>

          {/* Collapsible Explainer for New Users */}
          <AnimatePresence>
            {showFormulaExplainer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-1.5"
              >
                <p>
                  <strong>Why this matters:</strong> Floor scheduling systems (MIPS) often allocate inventory to the first sales order line rather than combined SKU demand. When pallets are returned or produced in advance, operators can be instructed to run redundant batches.
                </p>
                <p>
                  By evaluating total SKU balance against real-time WMS on-hand stock and actual completed pallet tags, the engine establishes a single unified requirement that synchronizes with Oracle General Ledger.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected SKU Spotlight & Interactive What-If Simulator */}
        {selectedSku && (
          <div className="mt-4 p-4 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-zinc-200/80 dark:border-zinc-700/60 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 dark:text-white">
                  Interactive Evaluation: {selectedSku.sku} · {selectedSku.description}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-200 dark:bg-zinc-700 font-mono">
                  {selectedSku.plantLine}
                </span>
              </div>

              {(simReturnDelta !== 0 || simUsableDelta !== 0) && (
                <button
                  onClick={() => {
                    playTactileTick();
                    setSimReturnDelta(0);
                    setSimUsableDelta(0);
                  }}
                  className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 font-mono"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Simulation</span>
                </button>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">1. Total Valid Demand</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  {selectedSku.totalValidDemand.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">2. Usable Stock (WMS)</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  - {simUsable.toLocaleString()}
                </span>
                {simUsableDelta !== 0 && (
                  <span className="text-[10px] text-emerald-500 block">({simUsableDelta > 0 ? `+${simUsableDelta}` : simUsableDelta} sim)</span>
                )}
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">3. Completed Production</span>
                <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
                  - {selectedSku.completedProduction.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">4. Returns / Adjustments</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {simReturns >= 0 ? `+${simReturns}` : simReturns}
                </span>
                {simReturnDelta !== 0 && (
                  <span className="text-[10px] text-amber-500 block">({simReturnDelta > 0 ? `+${simReturnDelta}` : simReturnDelta} sim)</span>
                )}
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-bold text-zinc-900 dark:text-white">5. True Net Requirement</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  = {simulatedNet.toLocaleString()} units
                </span>
                <span className="text-[10px] text-rose-500 block">
                  (MIPS was requesting {selectedSku.mipsDisplayRequirement.toLocaleString()})
                </span>
              </div>
            </div>

            {/* Quick What-If Test Buttons */}
            <div className="mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-700/60 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] text-zinc-500 font-sans font-medium">Test What-If Scenarios:</span>
              <button
                onClick={() => {
                  playTactileTick();
                  setSimReturnDelta((p) => p + 204);
                }}
                className="px-2 py-1 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 text-[11px]"
              >
                +204 returned pallet from dock
              </button>
              <button
                onClick={() => {
                  playTactileTick();
                  setSimUsableDelta((p) => p + 500);
                }}
                className="px-2 py-1 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 text-[11px]"
              >
                +500 usable units found in staging
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search SKU or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none"
            />
          </div>
          <span className="text-xs text-zinc-500">
            Showing {filteredPositions.length} of {positions.length} items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-4 py-3">SKU & Description</th>
                <th className="px-4 py-3">Plant Line</th>
                <th className="px-4 py-3 text-right">Total Demand</th>
                <th className="px-4 py-3 text-right">Usable Inventory</th>
                <th className="px-4 py-3 text-right">Completed</th>
                <th className="px-4 py-3 text-right">True Net Req</th>
                <th className="px-4 py-3 text-right">Prevented Rework</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredPositions.map((pos) => {
                const isSelected = selectedSku?.sku === pos.sku;
                return (
                  <tr
                    key={pos.sku}
                    onClick={() => handleSelectRow(pos)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-zinc-100/90 dark:bg-zinc-800/70 font-medium'
                        : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-zinc-900 dark:text-white">{pos.sku}</div>
                      <div className="text-[11px] text-zinc-500">{pos.description}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                      {pos.plantLine}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      {pos.totalValidDemand.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      {pos.usableInventory.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sky-600 dark:text-sky-400 font-medium">
                      {pos.completedProduction.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {pos.netRequirement.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      +{pos.overproductionPrevented.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {pos.status === 'reconciled' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Reconciled
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          Mismatch Flagged
                        </span>
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
