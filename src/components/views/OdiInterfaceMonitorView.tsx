import React from 'react';
import { OdiTransaction } from '../../types';
import { Server, Cpu, Database } from 'lucide-react';

interface OdiInterfaceMonitorViewProps {
  transactions: OdiTransaction[];
  onRetryTransaction: (id: string) => void;
}

export const OdiInterfaceMonitorView: React.FC<OdiInterfaceMonitorViewProps> = ({
  transactions,
  onRetryTransaction,
}) => {
  const failedOrLagging = transactions.filter((t) => t.oracleStatus !== 'delivered').length;
  const avgLatency = (
    transactions.reduce((acc, t) => acc + t.latencyMinutes, 0) / (transactions.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(255,255,255,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              <span>Plant LV-04</span>
              <span>/</span>
              <span>Downstream Interface</span>
              <span>/</span>
              <span>Oracle ODI Data Pipeline</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white mt-1">
              Enterprise Data Pipeline & Oracle ODI Sync Console
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Tracks warehouse barcode scan payloads transferred into Oracle General Ledger before fiscal period close.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Batches Exceeding 10m SLA</span>
            <span className="text-xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
              {failedOrLagging} Items Flagged
            </span>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-[#1a2336]">
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Average Transfer Latency</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
              {avgLatency}m
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Target SLA</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white">
              &lt;10.0m
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Active Socket Ping</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-emerald-700 dark:text-emerald-400">
              14ms (Healthy)
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Target Ledger</div>
            <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white">
              Oracle Cloud GL
            </div>
          </div>
        </div>
      </div>

      {/* Subsystem Health Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white dark:bg-[#0c1018] rounded-lg border border-slate-200/90 dark:border-[#1a2336] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <div>
              <div className="text-xs font-semibold text-slate-950 dark:text-white">MIPS Plant Floor MES</div>
              <div className="text-[10px] text-slate-500 font-mono">12ms socket latency</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20">
            Connected
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#0c1018] rounded-lg border border-slate-200/90 dark:border-[#1a2336] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <div>
              <div className="text-xs font-semibold text-slate-950 dark:text-white">WMS Warehouse Core</div>
              <div className="text-[10px] text-slate-500 font-mono">48ms ping latency</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20">
            In Sync
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#0c1018] rounded-lg border border-slate-200/90 dark:border-[#1a2336] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <div>
              <div className="text-xs font-semibold text-slate-950 dark:text-white">Oracle Cloud ODI</div>
              <div className="text-[10px] text-slate-500 font-mono">Avg sync: 4.2m</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-500/20">
            SLA Nominal
          </span>
        </div>
      </div>

      {/* Transaction Batches Table */}
      <div className="bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(255,255,255,0.03)]">
        <div className="p-3.5 border-b border-slate-100 dark:border-[#1a2336]">
          <h2 className="text-xs font-semibold text-slate-950 dark:text-white">
            Recent Batch Sync Activity & Latency Monitor
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/90 dark:bg-[#101522] border-b border-slate-200/90 dark:border-[#1a2336] text-slate-500 font-mono text-[10px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-2.5">Batch ID / Ticket</th>
                <th className="px-4 py-2.5">SKU</th>
                <th className="px-4 py-2.5 text-right">Quantity</th>
                <th className="px-4 py-2.5">Scanned Time</th>
                <th className="px-4 py-2.5 text-right">Latency</th>
                <th className="px-4 py-2.5 text-center">Oracle Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2336]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-[#111624] transition-colors">
                  <td className="px-4 py-2.5 font-mono font-medium text-slate-950 dark:text-white">
                    <div>{tx.id}</div>
                    <div className="text-[10px] text-slate-400 font-sans">{tx.ticketNumber}</div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-700 dark:text-slate-300">{tx.sku}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-medium text-slate-900 dark:text-white tabular-nums">
                    {tx.qty.toLocaleString()} units
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">{tx.scannedAtWms}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold tabular-nums">
                    <span className={tx.latencyMinutes > 10 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}>
                      {tx.latencyMinutes}m
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono">
                    {tx.oracleStatus === 'delivered' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20">
                        Delivered
                      </span>
                    ) : tx.oracleStatus === 'lagging_sla' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-[#151c2c] text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-[#222e47]">
                        Lagging SLA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-500/20">
                        Interface Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {tx.oracleStatus !== 'delivered' ? (
                      <button
                        onClick={() => onRetryTransaction(tx.id)}
                        className="px-3 py-1 text-xs font-medium text-white bg-slate-950 dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 rounded shadow-xs transition-colors"
                      >
                        Push Now
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">Synced</span>
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
