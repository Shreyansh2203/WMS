import React from 'react';
import { OdiTransaction } from '../../types';
import { RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Clock, Database, Server, Cpu } from 'lucide-react';
import { motion } from 'motion/react';
import { playTactileTick, playSuccessChime } from '../../utils/audio';

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
    playSuccessChime();
    onRetryTransaction(id);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h1 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
                Enterprise Data Pipeline & Oracle ODI Sync
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Monitors WMS barcode scan payloads transferring downstream into Oracle General Ledger before period close.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-zinc-500 block">Transactions Exceeding 10m SLA</span>
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {failedOrLagging} Items Flagged
            </span>
          </div>
        </div>

        {/* 3 Pipeline Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <div>
                <div className="text-xs font-semibold text-zinc-900 dark:text-white">MIPS Plant Floor</div>
                <div className="text-[10px] text-zinc-500 font-mono">12ms socket ping</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Connected
            </span>
          </div>

          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <div>
                <div className="text-xs font-semibold text-zinc-900 dark:text-white">WMS Warehouse Core</div>
                <div className="text-[10px] text-zinc-500 font-mono">48ms latency</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              In Sync
            </span>
          </div>

          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-sky-500" />
              <div>
                <div className="text-xs font-semibold text-zinc-900 dark:text-white">Oracle Cloud ODI</div>
                <div className="text-[10px] text-zinc-500 font-mono">Avg sync: 4.2 min</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              SLA &lt;10m
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Batches Table */}
      <div className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white font-display">
            Recent Batch Sync Activity & Latency Monitor
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            WMS scans must reach Oracle within ~10 minutes to maintain ledger balance.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-4 py-3">Batch ID / Ticket</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3">Scanned Time</th>
                <th className="px-4 py-3 text-right">Latency</th>
                <th className="px-4 py-3 text-center">Oracle Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-zinc-900 dark:text-white">
                    <div>{tx.id}</div>
                    <div className="text-[10px] text-zinc-400 font-sans">{tx.ticketNumber}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-700 dark:text-zinc-300">{tx.sku}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-zinc-900 dark:text-white">
                    {tx.qty.toLocaleString()} units
                  </td>
                  <td className="px-4 py-3 text-zinc-500 font-mono text-[11px]">{tx.scannedAtWms}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold">
                    <span className={tx.latencyMinutes > 10 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                      {tx.latencyMinutes}m
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {tx.oracleStatus === 'delivered' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Delivered
                      </span>
                    ) : tx.oracleStatus === 'lagging_sla' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        Lagging SLA
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                        Interface Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {tx.oracleStatus !== 'delivered' ? (
                      <button
                        onClick={() => handleRetry(tx.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 rounded shadow-2xs"
                      >
                        Push Now
                      </button>
                    ) : (
                      <span className="text-[11px] text-zinc-400">Synced</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
