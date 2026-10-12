import React, { useState, useMemo } from 'react';
import { OdiTransaction, OdiPipelineStage, DensityMode } from '../../types';
import {
  Database,
  Search,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCw,
  X,
  Copy,
  Check,
  Split,
  FileCode,
} from 'lucide-react';
import { exportToCSV } from '../../utils/formatters';

interface OracleCloudOdiViewProps {
  transactions: OdiTransaction[];
  pipelineStages: OdiPipelineStage[];
  density?: DensityMode;
  onRetryTransaction: (id: string) => void;
  onTriggerFullPipelineSync?: () => void;
}

export const OracleCloudOdiView: React.FC<OracleCloudOdiViewProps> = ({
  transactions,
  pipelineStages,
  density = 'comfortable',
  onRetryTransaction,
  onTriggerFullPipelineSync,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lagging_failed' | 'delivered'>('all');
  const [selectedTransactionForPayload, setSelectedTransactionForPayload] = useState<OdiTransaction | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'diff' | 'raw'>('diff');
  const [isCopied, setIsCopied] = useState(false);
  const [isSyncingPipeline, setIsSyncingPipeline] = useState(false);

  const isCompact = density === 'compact';

  // Computed metrics
  const laggingOrFailed = useMemo(() => {
    return transactions.filter((t) => t.oracleStatus !== 'delivered');
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.errorDetail && t.errorDetail.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;
      if (statusFilter === 'lagging_failed') return t.oracleStatus !== 'delivered';
      if (statusFilter === 'delivered') return t.oracleStatus === 'delivered';
      return true;
    });
  }, [transactions, searchQuery, statusFilter]);

  const handleManualSync = () => {
    setIsSyncingPipeline(true);
    if (onTriggerFullPipelineSync) onTriggerFullPipelineSync();
    setTimeout(() => {
      setIsSyncingPipeline(false);
    }, 1200);
  };

  const handleCopyPayload = (tx: OdiTransaction) => {
    const payload = {
      staging: tx.stagingPayload,
      erp: tx.erpPayload,
      meta: {
        id: tx.id,
        ticket: tx.ticketNumber,
        latency: tx.latencyMinutes,
        error: tx.errorDetail,
      },
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const data = transactions.map((t) => ({
      Transaction_ID: t.id,
      Ticket_Number: t.ticketNumber,
      SKU: t.sku,
      Quantity: t.qty,
      Scanned_At: t.scannedAtWms,
      Oracle_Status: t.oracleStatus,
      Latency_Minutes: t.latencyMinutes,
      Error_Detail: t.errorDetail || 'None',
    }));
    exportToCSV(data, 'Oracle_Cloud_ODI_Interface_Audit');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/90 dark:border-[#1a2336]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>Enterprise Operations</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-200 font-medium">Enterprise ERP & Integration</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-950 dark:text-white tracking-tight mt-1">
            Oracle Cloud ERP & ODI Integration Monitor
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Real-time Oracle Data Integrator (ODI) pipelines, downstream transactions SLA, and interface staging tables.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleManualSync}
            disabled={isSyncingPipeline}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#121724] border border-slate-200/90 dark:border-[#1e273a] rounded hover:bg-slate-50 dark:hover:bg-[#161e2e] transition-colors shadow-xs disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncingPipeline ? 'animate-spin' : ''}`} />
            <span>{isSyncingPipeline ? 'Triggering ODI Agent...' : 'Trigger ODI Delta Sync'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#121724] border border-slate-200/90 dark:border-[#1e273a] rounded hover:bg-slate-50 dark:hover:bg-[#161e2e] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Interface Log</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">ODI Pipeline Adherence</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            99.4% Nominal
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Target &lt; 10 min transfer SLA</div>
        </div>

        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Average Transfer Latency</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
            6.2 <span className="text-xs text-slate-500 font-sans font-normal">minutes</span>
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Subsystem socket ping 28ms</div>
        </div>

        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Lagging / Failed Batches</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
            {laggingOrFailed.length} Batches
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {laggingOrFailed.length > 0 ? 'Requires priority retry override' : 'All transactions delivered'}
          </div>
        </div>

        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Oracle Cloud ERP Connection</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            Connected
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">US-EAST-1 Pod Active</div>
        </div>
      </div>

      {/* Subsystem Pipeline Stages Architecture */}
      <div className="rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">
              End-to-End ODI Pipeline Execution Stages
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Change Data Capture (CDC), Staging Table loaders, and Oracle Cloud ERP interfaces
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500">Agent: ODI_RUNTIME_01 (PID: 4912)</div>
        </div>

        <div className="space-y-3">
          {pipelineStages.map((stage, idx) => {
            const isLagging = stage.status === 'lagging';
            const isFailed = stage.status === 'failed';

            return (
              <div
                key={stage.stageId}
                className="p-3.5 rounded bg-slate-50/70 dark:bg-[#101522] border border-slate-200/80 dark:border-[#1e273a] flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-slate-200 dark:bg-[#192236] text-slate-700 dark:text-slate-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-950 dark:text-white flex items-center gap-2">
                      <span>{stage.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">({stage.stageId})</span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      <span>{stage.sourceSystem}</span>
                      <span className="mx-1.5 text-slate-400">→</span>
                      <span>{stage.targetSystem}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs font-mono">
                  <div>
                    <span className="text-slate-500">Processed: </span>
                    <span className="text-slate-900 dark:text-slate-200 font-medium">
                      {stage.recordsProcessed.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Latency: </span>
                    <span
                      className={`font-medium ${
                        isLagging || isFailed
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-900 dark:text-slate-200'
                      }`}
                    >
                      {stage.latencySec > 60 ? `${Math.round(stage.latencySec / 60)}m` : `${stage.latencySec}s`}
                    </span>
                  </div>
                  <div>
                    {isFailed ? (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Failed (1 Exception)
                      </span>
                    ) : isLagging ? (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Lagging SLA (46m)
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active Nominal
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Downstream Transactions Table (Hotspot #8) */}
      <div className="rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-200/90 dark:border-[#1a2336] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white flex items-center gap-2">
              <span>Downstream Inventory Transactions & SLA Queue</span>
              <span className="text-xs font-mono text-slate-500 font-normal">(Hotspot #8)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              WMS pallet scans transferring to Oracle Cloud ERP inventory interface tables
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-[#121725] rounded border border-slate-200/80 dark:border-[#1a2336]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-[#1c2438] text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setStatusFilter('lagging_failed')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === 'lagging_failed'
                    ? 'bg-white dark:bg-[#1c2438] text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Lagging / Errors ({laggingOrFailed.length})
              </button>
              <button
                onClick={() => setStatusFilter('delivered')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === 'delivered'
                    ? 'bg-white dark:bg-[#1c2438] text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Delivered ({transactions.length - laggingOrFailed.length})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket / SKU..."
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
                <th className="py-2.5 px-4 font-medium">Batch Transaction</th>
                <th className="py-2.5 px-4 font-medium">Pallet Ticket & SKU</th>
                <th className="py-2.5 px-4 font-medium text-right">Batch Qty</th>
                <th className="py-2.5 px-4 font-medium text-right">Transfer Latency</th>
                <th className="py-2.5 px-4 font-medium">Oracle Cloud State & Diagnostics</th>
                <th className="py-2.5 px-4 font-medium text-right">Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-[#172033]">
              {filteredTransactions.map((tx) => {
                const isDelivered = tx.oracleStatus === 'delivered';
                const isFailed = tx.oracleStatus === 'interface_failed';
                const isLagging = tx.oracleStatus === 'lagging_sla';
                const cellPadding = isCompact ? 'py-2 px-3' : 'py-3 px-4';

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#111726] transition-colors group cursor-pointer"
                    onClick={() => setSelectedTransactionForPayload(tx)}
                  >
                    <td className={`${cellPadding} font-mono font-medium text-slate-900 dark:text-white`}>
                      <div className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-slate-400" />
                        <span>{tx.id}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal">{tx.scannedAtWms}</div>
                    </td>
                    <td className={cellPadding}>
                      <div className="font-medium text-slate-900 dark:text-slate-200">{tx.ticketNumber}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{tx.sku}</div>
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-semibold tabular-nums text-slate-950 dark:text-white`}>
                      {tx.qty.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-semibold tabular-nums`}>
                      <span className={tx.latencyMinutes > 10 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-200'}>
                        {tx.latencyMinutes} min
                      </span>
                    </td>
                    <td className={cellPadding}>
                      {isDelivered && (
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Delivered to Oracle GL</span>
                        </div>
                      )}
                      {isLagging && (
                        <div>
                          <div className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Lagging SLA (&gt; 10 min)</span>
                          </div>
                          <div className="text-slate-500 text-[11px] truncate max-w-xs">{tx.errorDetail}</div>
                        </div>
                      )}
                      {isFailed && (
                        <div>
                          <div className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Interface Failure</span>
                          </div>
                          <div className="text-slate-500 text-[11px] truncate max-w-xs">{tx.errorDetail}</div>
                        </div>
                      )}
                    </td>
                    <td className={`${cellPadding} text-right`} onClick={(e) => e.stopPropagation()}>
                      {!isDelivered ? (
                        <button
                          onClick={() => onRetryTransaction(tx.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 rounded transition-colors shadow-xs"
                        >
                          Repush Batch
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedTransactionForPayload(tx)}
                          className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium"
                        >
                          View Diff
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Payload Diff Inspector Modal */}
      {selectedTransactionForPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1018] rounded-lg border border-slate-200 dark:border-[#1a2336] shadow-2xl max-w-3xl w-full p-6 text-left relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedTransactionForPayload(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-[#1a2336]">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
                  <span>Interface Diff Inspector</span>
                  <span>·</span>
                  <span>{selectedTransactionForPayload.id}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white mt-0.5">
                  Pallet Scan {selectedTransactionForPayload.ticketNumber} · {selectedTransactionForPayload.sku}
                </h3>
              </div>

              {/* Inspector View Tabs */}
              <div className="flex items-center gap-2 mr-8">
                <div className="flex items-center p-0.5 bg-slate-100 dark:bg-[#121725] rounded border border-slate-200/80 dark:border-[#1a2336]">
                  <button
                    onClick={() => setInspectorTab('diff')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                      inspectorTab === 'diff'
                        ? 'bg-white dark:bg-[#1c2438] text-slate-950 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Side-by-Side Diff</span>
                  </button>
                  <button
                    onClick={() => setInspectorTab('raw')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                      inspectorTab === 'raw'
                        ? 'bg-white dark:bg-[#1c2438] text-slate-950 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Raw JSON</span>
                  </button>
                </div>

                <button
                  onClick={() => handleCopyPayload(selectedTransactionForPayload)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#121724] border border-slate-200/80 dark:border-[#1e273a] rounded hover:bg-slate-100 dark:hover:bg-[#161e2e] transition-colors"
                  title="Copy full payload JSON"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="mt-4 flex-1 overflow-y-auto">
              {inspectorTab === 'diff' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded bg-slate-100/70 dark:bg-[#111726] border border-slate-200/80 dark:border-[#1c253a] font-semibold text-slate-900 dark:text-slate-100">
                      WMS Source Staging (WMS_INVENTORY_STG)
                    </div>
                    <div className="p-2.5 rounded bg-slate-100/70 dark:bg-[#111726] border border-slate-200/80 dark:border-[#1c253a] font-semibold text-slate-900 dark:text-slate-100">
                      Oracle Cloud ERP (INV_TRANSACTIONS_INTERFACE)
                    </div>
                  </div>

                  {/* Field-by-Field Diff Comparison Rows */}
                  {selectedTransactionForPayload.stagingPayload && (
                    <div className="divide-y divide-slate-200/70 dark:divide-[#172033] border border-slate-200/80 dark:border-[#1a2336] rounded text-xs font-mono">
                      {Object.keys(selectedTransactionForPayload.stagingPayload).map((key) => {
                        const val1 = selectedTransactionForPayload.stagingPayload?.[key];
                        const val2 = selectedTransactionForPayload.erpPayload?.[key];
                        const isMatch = val1 === val2;

                        return (
                          <div
                            key={key}
                            className={`grid grid-cols-2 p-2.5 gap-3 ${
                              !isMatch
                                ? 'bg-rose-50/70 dark:bg-rose-950/20'
                                : 'hover:bg-slate-50/50 dark:hover:bg-[#101625]'
                            }`}
                          >
                            <div>
                              <div className="text-[10px] text-slate-400">{key}</div>
                              <div className="text-slate-900 dark:text-slate-200 font-medium break-all">{String(val1)}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400">{key}</div>
                              <div
                                className={`font-medium break-all ${
                                  !isMatch
                                    ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                    : 'text-slate-900 dark:text-slate-200'
                                }`}
                              >
                                {val2 !== undefined ? String(val2) : '<NULL / MISSING>'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedTransactionForPayload.errorDetail && (
                    <div className="p-3 rounded bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300">
                      <span className="font-semibold">Root Cause Exception: </span>
                      {selectedTransactionForPayload.errorDetail}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                  <pre className="text-[11px] leading-relaxed">
{JSON.stringify(
  {
    transactionId: selectedTransactionForPayload.id,
    ticketNumber: selectedTransactionForPayload.ticketNumber,
    sku: selectedTransactionForPayload.sku,
    quantityUnits: selectedTransactionForPayload.qty,
    scannedAt: selectedTransactionForPayload.scannedAtWms,
    oracleStatus: selectedTransactionForPayload.oracleStatus,
    latencyMinutes: selectedTransactionForPayload.latencyMinutes,
    targetInterfaceTable: 'INV_TRANSACTIONS_INTERFACE',
    oracleInventoryOrgId: 'LV_ORGANIZATION_04',
    stagingPayload: selectedTransactionForPayload.stagingPayload,
    erpPayload: selectedTransactionForPayload.erpPayload,
    errorDiagnostics: selectedTransactionForPayload.errorDetail || 'NONE_OK',
  },
  null,
  2
)}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200/80 dark:border-[#1a2336] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedTransactionForPayload(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Close
              </button>
              {selectedTransactionForPayload.oracleStatus !== 'delivered' && (
                <button
                  onClick={() => {
                    onRetryTransaction(selectedTransactionForPayload.id);
                    setSelectedTransactionForPayload(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-950 rounded hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
                >
                  Force Repush to Oracle Cloud
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
