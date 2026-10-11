import React from 'react';
import { FreezerLot } from '../../types';
import { Snowflake, CheckCircle2, AlertTriangle, ArrowRight, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { playTactileTick } from '../../utils/audio';

interface FreezerLotTrackerViewProps {
  lots: FreezerLot[];
  onDeductLot: (lotId: string) => void;
}

export const FreezerLotTrackerView: React.FC<FreezerLotTrackerViewProps> = ({ lots, onDeductLot }) => {
  const ghostUnitsTotal = lots
    .filter((l) => l.wmsStatus === 'Ghost - Pending Deduction')
    .reduce((acc, l) => acc + l.quantity, 0);

  const handleDeduct = (lotId: string) => {
    playTactileTick();
    onDeductLot(lotId);
  };

  return (
    <div className="space-y-6">
      {/* Banner with Scroll-In-View Transition */}
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
              <Snowflake className="w-4 h-4 text-sky-500" />
              <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white">
                Hotspot #7 · Blast Freezer Phantom Inventory Reconciler
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Tracks consumed freezer lots that remain in WMS after line switches (~300,000 units cleared manually after July 4).
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono text-zinc-400">Total Virtual Ghost Inventory in WMS</div>
            <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
              {ghostUnitsTotal.toLocaleString()} units
            </div>
          </div>
        </div>

        {/* Operational Context Strip */}
        <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Root Cause Hotspot #7:</span> When runs move (e.g. Line 1 → Line 2), physical pallets are dumped and consumed into hopper, but the WMS inventory reservation fails to issue the pallet out of the freezer sub-inventory. The AI agent matches completed production work orders against orphaned lot receipts and automates deduction approvals.
          </div>
        </div>
      </motion.div>

      {/* Lots Grid & Management Table with Scroll-In-View Transition */}
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
              Lehigh Valley Sub-Inventory B Freezer Ledger
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Review orphaned lots and execute bulk or single-lot WMS deductions.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                <th className="py-2.5 pl-2 font-medium">Freezer Lot #</th>
                <th className="py-2.5 font-medium">SKU & Item</th>
                <th className="py-2.5 font-medium text-right">Orphaned Qty</th>
                <th className="py-2.5 font-medium">Original Run Date</th>
                <th className="py-2.5 font-medium">Line Movement</th>
                <th className="py-2.5 font-medium">WMS Status</th>
                <th className="py-2.5 pr-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 font-mono tabular-nums">
              {lots.map((lot) => {
                const isGhost = lot.wmsStatus === 'Ghost - Pending Deduction';
                return (
                  <motion.tr
                    key={lot.lotId}
                    layout
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                  >
                    <td className="py-3 pl-2 font-bold text-zinc-900 dark:text-white">
                      Lot {lot.lotId}
                    </td>
                    <td className="py-3 font-sans">
                      <div className="font-bold text-zinc-900 dark:text-white font-mono">{lot.sku}</div>
                      <div className="text-[11px] text-zinc-500">{lot.description}</div>
                    </td>
                    <td className="py-3 text-right font-bold text-zinc-900 dark:text-white">
                      {lot.quantity.toLocaleString()} units
                    </td>
                    <td className="py-3 text-zinc-600 dark:text-zinc-400">
                      {lot.usedDate}
                    </td>
                    <td className="py-3 text-zinc-700 dark:text-zinc-300">
                      {lot.movedFromLine} → {lot.movedToLine}
                    </td>
                    <td className="py-3 font-sans">
                      <span
                        className={`text-[11px] font-semibold ${
                          isGhost
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {lot.wmsStatus}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      {isGhost ? (
                        <button
                          onClick={() => handleDeduct(lot.lotId)}
                          className="px-2.5 py-1 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white rounded transition-colors shadow-2xs"
                        >
                          Deduct from WMS
                        </button>
                      ) : (
                        <span className="text-[11px] text-zinc-400 font-sans">Reconciled</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
