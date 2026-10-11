import React from 'react';
import { OdiTransaction } from '../../types';
import { RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Clock, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { playTactileTick } from '../../utils/audio';

interface OdiInterfaceMonitorViewProps {
  transactions: OdiTransaction[];
  onRetryTransaction: (id: string) => void;
}

export const OdiInterfaceMonitorView: React.FC<OdiInterfaceMonitorViewProps> = ({
  transactions,
  onRetryTransaction,
}) => {
  const failedOrLagging = transactions.filter((t) => t.oracleStatus !== 'delivered').length;

  const handleRetry = (id: string) => {
    playTactileTick();
    onRetryTransaction(id);
  };

  return (
    <div className="space-y-6">
      {/* Header with Scroll-In-View Transition */}
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
              <Database className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white">
                Hotspot #8 · WMS → Oracle Cloud (ODI Interface ~10 min SLA)
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Monitors WMS barcode scan payloads transferring downstream into Oracle General Ledger before period close.
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono text-zinc-400">Transactions Exceeding 10m SLA</div>
            <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
              {failedOrLagging} Items
            </div>
          </div>
        </div>

        {/* SLA Architecture Explainer */}
        <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-zinc-900 dark:text-white">The ~10 Minute ODI SLA:</span> WMS pallet issues and finished goods receipts are batched through Oracle Data Integrator (ODI). When batches stall or lock, Oracle inventory becomes understated relative to physical WMS inventory, triggering emergency reconciliations during month-end financial close.
          </div>
        </div>
      </motion.div>

      {/* Transactions Queue with Scroll-In-View Transition */}
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
              Live ODI Transaction Transfer Stream
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Inspect transmission latency and re-dispatch failed payloads.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                <th className="py-2.5 pl-2 font-medium">Txn ID</th>
                <th className="py-2.5 font-medium">Ticket #</th>
                <th className="py-2.5 font-medium">SKU</th>
                <th className="py-2.5 font-medium text-right">Scanned Qty</th>
                <th className="py-2.5 font-medium">WMS Scanned At</th>
                <th className="py-2.5 font-medium text-center">Transfer Latency</th>
                <th className="py-2.5 font-medium">Oracle Status</th>
                <th className="py-2.5 pr-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 font-mono tabular-nums">
              {transactions.map((tx) => {
                const isOverSla = tx.latencyMinutes > 10;
                return (
                  <motion.tr
                    key={tx.id}
                    layout
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                  >
                    <td className="py-3 pl-2 font-bold text-zinc-900 dark:text-white">
                      {tx.id}
                    </td>
                    <td className="py-3 text-zinc-600 dark:text-zinc-400">
                      {tx.ticketNumber}
                    </td>
                    <td className="py-3 font-semibold text-zinc-900 dark:text-white">
                      {tx.sku}
                    </td>
                    <td className="py-3 text-right">
                      {tx.qty.toLocaleString()}
                    </td>
                    <td className="py-3 text-zinc-500">
                      {tx.scannedAtWms}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`font-bold ${isOverSla ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {tx.latencyMinutes}m
                      </span>
                    </td>
                    <td className="py-3 font-sans">
                      <span
                        className={`text-[11px] font-semibold ${
                          tx.oracleStatus === 'delivered'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.oracleStatus}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      {tx.oracleStatus !== 'delivered' ? (
                        <button
                          onClick={() => handleRetry(tx.id)}
                          className="px-2.5 py-1 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white rounded transition-colors shadow-2xs"
                        >
                          Re-push ODI
                        </button>
                      ) : (
                        <span className="text-[11px] text-zinc-400 font-sans">Delivered</span>
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
