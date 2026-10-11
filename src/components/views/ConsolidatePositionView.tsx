import React, { useState } from 'react';
import { ConsolidatedPosition } from '../../types';
import { Calculator, CheckCircle2, AlertTriangle, ArrowRight, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { exportToCSV } from '../../utils/formatters';
import { playTactileTick } from '../../utils/audio';

interface ConsolidatePositionViewProps {
  positions: ConsolidatedPosition[];
}

export const ConsolidatePositionView: React.FC<ConsolidatePositionViewProps> = ({ positions }) => {
  const [selectedSku, setSelectedSku] = useState<ConsolidatedPosition>(positions[0]);

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
      'lehigh-valley-consolidated-positions'
    );
  };

  const handleSelectRow = (p: ConsolidatedPosition) => {
    playTactileTick();
    setSelectedSku(p);
  };

  return (
    <div className="space-y-6">
      {/* Mathematical Reconciliation Formula Banner with Scroll-In-View */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-[#111317] border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white">
                Step 2 · Consolidated Net Position Engine
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Consolidates one unified position per SKU · sales date · period to eliminate Hotspots #1, #2, and #4.
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono text-zinc-400">Total Unnecessary Run Units Prevented</div>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {totalOverproductionPrevented.toLocaleString()} units
            </div>
          </div>
        </div>

        {/* Formula Representation */}
        <div className="mt-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 font-mono text-xs">
          <div className="text-zinc-400 text-[10px] uppercase tracking-wider mb-1 font-semibold">
            Governing Plant Netting Equation
          </div>
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex flex-wrap items-center gap-2">
            <span className="text-zinc-900 dark:text-white font-extrabold underline decoration-zinc-400">Net requirement</span>
            <span>=</span>
            <span className="text-zinc-700 dark:text-zinc-300">Total valid demand</span>
            <span>-</span>
            <span className="text-emerald-600 dark:text-emerald-400">Usable inventory</span>
            <span>-</span>
            <span className="text-sky-600 dark:text-sky-400">Completed production</span>
            <span>±</span>
            <span className="text-amber-600 dark:text-amber-400">Valid returns / adjustments</span>
          </div>
        </div>

        {/* Live Interactive Evaluation for Selected SKU */}
        {selectedSku && (
          <motion.div
            key={selectedSku.sku}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 p-4 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-900/60 text-xs font-mono"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="font-bold text-zinc-900 dark:text-white">
                Evaluation for {selectedSku.sku} ({selectedSku.description})
              </span>
              <span className="text-zinc-500 font-normal">{selectedSku.plantLine} · Sales Date {selectedSku.salesDate}</span>
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3 tabular-nums">
              <div>
                <div className="text-[10px] text-zinc-500">Total Valid Demand</div>
                <div className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
                  {selectedSku.totalValidDemand.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Usable Inventory (WMS)</div>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  - {selectedSku.usableInventory.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Completed FG Output</div>
                <div className="text-base font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                  - {selectedSku.completedProduction.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Returns & Adjustments</div>
                <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {selectedSku.returnsAdjustments >= 0 ? `+${selectedSku.returnsAdjustments}` : selectedSku.returnsAdjustments}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 font-bold">True Net Requirement</div>
                <div className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
                  = {selectedSku.netRequirement.toLocaleString()} units
                </div>
                <div className="text-[10px] text-rose-500">
                  (MIPS displayed {selectedSku.mipsDisplayRequirement.toLocaleString()})
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Full Positions Table with Scroll-In-View Transition */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-[#111317] border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold font-display text-zinc-900 dark:text-white">
              Daily Master Net Requirements Table
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Click any SKU row to simulate and review the underlying balance sheet components.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export Table CSV</span>
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                <th className="py-2.5 pl-2 font-medium">SKU / Item</th>
                <th className="py-2.5 font-medium">Line</th>
                <th className="py-2.5 font-medium text-right">Valid Demand</th>
                <th className="py-2.5 font-medium text-right">Usable Inv</th>
                <th className="py-2.5 font-medium text-right">Completed FG</th>
                <th className="py-2.5 font-medium text-right">Adj / Returns</th>
                <th className="py-2.5 font-medium text-right">True Net Req</th>
                <th className="py-2.5 font-medium text-right">MIPS Display</th>
                <th className="py-2.5 pr-2 font-medium text-center">Overproduction Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 font-mono tabular-nums">
              {positions.map((p) => {
                const isSelected = selectedSku?.sku === p.sku;
                return (
                  <tr
                    key={p.sku}
                    onClick={() => handleSelectRow(p)}
                    className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer ${
                      isSelected ? 'bg-zinc-100/90 dark:bg-zinc-800/80 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 pl-2">
                      <div className="font-bold text-zinc-900 dark:text-white">{p.sku}</div>
                      <div className="text-[11px] text-zinc-500 font-sans truncate max-w-xs">{p.description}</div>
                    </td>
                    <td className="py-3 text-zinc-600 dark:text-zinc-400">{p.plantLine}</td>
                    <td className="py-3 text-right font-medium text-zinc-900 dark:text-white">
                      {p.totalValidDemand.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-emerald-600 dark:text-emerald-400">
                      {p.usableInventory.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-sky-600 dark:text-sky-400">
                      {p.completedProduction.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-amber-600 dark:text-amber-400">
                      {p.returnsAdjustments !== 0 ? p.returnsAdjustments.toLocaleString() : '0'}
                    </td>
                    <td className="py-3 text-right font-bold text-zinc-900 dark:text-white">
                      {p.netRequirement.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-zinc-500">
                      {p.mipsDisplayRequirement.toLocaleString()}
                    </td>
                    <td className="py-3 pr-2 text-center">
                      {p.overproductionPrevented > 0 ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          +{p.overproductionPrevented.toLocaleString()} units
                        </span>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
