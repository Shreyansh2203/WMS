import React from 'react';
import { FreezerLot } from '../../types';
import { Snowflake, CheckCircle2, AlertTriangle, ArrowRight, Trash2, Check, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { playTactileTick, playSuccessChime } from '../../utils/audio';

interface FreezerLotTrackerViewProps {
  lots: FreezerLot[];
  onDeductLot: (lotId: string) => void;
}

export const FreezerLotTrackerView: React.FC<FreezerLotTrackerViewProps> = ({ lots, onDeductLot }) => {
  const ghostUnitsTotal = lots
    .filter((l) => l.wmsStatus === 'Ghost - Pending Deduction')
    .reduce((acc, l) => acc + l.quantity, 0);

  const pendingCount = lots.filter((l) => l.wmsStatus === 'Ghost - Pending Deduction').length;

  const handleDeduct = (lotId: string) => {
    playSuccessChime();
    onDeductLot(lotId);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Snowflake className="w-4 h-4" />
              </div>
              <h1 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
                Cold Storage & Blast Freezer Lot Tracker
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Tracks consumed blast-freezer pallets and reconciles ghost reservations with warehouse sub-inventory.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-zinc-500 block">Virtual Ghost Units Awaiting Deduction</span>
            <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {ghostUnitsTotal.toLocaleString()} units
            </span>
          </div>
        </div>

        {/* Friendly explanation card */}
        <div className="mt-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-zinc-900 dark:text-white">What is a "Ghost Lot"?</strong> When ice cream or ingredient batches move between processing lines (e.g., Line 1 to Line 2), pallets are physically consumed by hoppers, but warehouse scanning guns sometimes miss issuing them out of the blast freezer sub-inventory. Authorizing the deduction clears the orphaned record and balances inventory.
          </div>
        </div>
      </div>

      {/* Lot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lots.map((lot) => {
          const isPending = lot.wmsStatus === 'Ghost - Pending Deduction';

          return (
            <motion.div
              key={lot.lotId}
              layout
              className={`bg-white dark:bg-[#111317] border rounded-xl p-5 shadow-xs transition-all ${
                isPending
                  ? 'border-amber-200/90 dark:border-amber-950/60'
                  : 'border-zinc-200/80 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="font-mono font-bold text-xs text-zinc-900 dark:text-white">
                  Lot {lot.lotId}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isPending
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}
                >
                  {isPending ? 'Ghost · Needs Deduction' : 'Deducted & Clean'}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-sm font-bold text-zinc-900 dark:text-white font-display">
                  {lot.description}
                </div>
                <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                  SKU: {lot.sku} · Consumed: {lot.usedDate}
                </div>
              </div>

              <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Line Transfer:</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {lot.movedFromLine} → {lot.movedToLine}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-zinc-600 dark:text-zinc-400">
                  <span>Unissued Quantity:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {lot.quantity.toLocaleString()} units
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {lot.impactNote}
              </p>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                {isPending ? (
                  <button
                    onClick={() => handleDeduct(lot.lotId)}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Deduct from WMS</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold py-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Inventory Deducted</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
