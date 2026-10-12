import React, { useState, useMemo } from 'react';
import { MipsLineStatus, DensityMode } from '../../types';
import {
  Search,
  Download,
  AlertCircle,
  CheckCircle2,
  Zap,
  Radio,
  X,
  TrendingUp,
} from 'lucide-react';
import { exportToCSV } from '../../utils/formatters';

interface MipsViewProps {
  lines: MipsLineStatus[];
  density?: DensityMode;
  onReconcileBlindLine?: (lineId: string) => void;
  onSyncWorkstation?: (lineId: string) => void;
}

export const MipsView: React.FC<MipsViewProps> = ({
  lines,
  density = 'comfortable',
  onReconcileBlindLine,
  onSyncWorkstation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLineForDetail, setSelectedLineForDetail] = useState<MipsLineStatus | null>(null);
  const [reconciledLines, setReconciledLines] = useState<string[]>([]);
  const [syncedWorkstations, setSyncedWorkstations] = useState<string[]>([]);

  const isCompact = density === 'compact';

  // Computed line statuses
  const displayLines = useMemo(() => {
    return lines.map((l) => {
      const current = { ...l };
      if (reconciledLines.includes(l.lineId)) {
        current.status = 'running';
        current.activeAlert = undefined;
        current.blindUnits = 0;
      }
      if (syncedWorkstations.includes(l.lineId)) {
        current.workstationSyncStatus = 'synced';
      }
      return current;
    });
  }, [lines, reconciledLines, syncedWorkstations]);

  const plantAverageOEE = useMemo(() => {
    const total = displayLines.reduce((acc, curr) => acc + curr.oee, 0);
    return (total / displayLines.length).toFixed(1);
  }, [displayLines]);

  const blindUnitsTotal = useMemo(() => {
    return displayLines.reduce((acc, curr) => acc + (curr.blindUnits || 0), 0);
  }, [displayLines]);

  const filteredLines = useMemo(() => {
    return displayLines.filter((line) => {
      return (
        line.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        line.currentSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        line.currentSkuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        line.currentRun.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [displayLines, searchQuery]);

  const handleResolveBlindLine = (lineId: string) => {
    setReconciledLines((prev) => [...prev, lineId]);
    if (onReconcileBlindLine) onReconcileBlindLine(lineId);
  };

  const handleResyncWorkstation = (lineId: string) => {
    setSyncedWorkstations((prev) => [...prev, lineId]);
    if (onSyncWorkstation) onSyncWorkstation(lineId);
  };

  const handleExportCSV = () => {
    const data = displayLines.map((l) => ({
      Line_ID: l.lineId,
      Line_Name: l.name,
      Product_Type: l.productType,
      Current_Run: l.currentRun,
      Current_SKU: l.currentSku,
      SKU_Description: l.currentSkuName,
      Planned_Qty: l.plannedQty,
      Actual_Produced: l.actualProduced,
      Target_Rate_Hr: l.targetRatePerHour,
      Actual_Rate_Hr: l.actualRatePerHour,
      OEE_Pct: l.oee,
      Line_Status: l.status,
      Workstation_Sync: l.workstationSyncStatus,
    }));
    exportToCSV(data, 'MIPS_ShopFloor_Production_Ledger');
  };

  const renderSparkline = (data?: number[], target?: number) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 84;
    const height = 22;
    const points = data
      .map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const isNominal = target ? data[data.length - 1] >= target * 0.94 : true;

    return (
      <div className="flex items-center gap-1.5" title={`Yield trend over last 10 batches (Latest: ${data[data.length - 1]}/hr)`}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="overflow-visible shrink-0"
        >
          <polyline
            fill="none"
            stroke={isNominal ? '#10b981' : '#f43f5e'}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/90 dark:border-[#1a2336]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>Enterprise Operations</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-200 font-medium">Shop Floor Execution & MES</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-950 dark:text-white tracking-tight mt-1">
            MIPS Manufacturing & Line Telemetry
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Real-time batch work orders, blind line detection, workstation screen sync, and line yield monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#121724] border border-slate-200/90 dark:border-[#1e273a] rounded hover:bg-slate-50 dark:hover:bg-[#161e2e] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Line Telemetry</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Plant Operational OEE</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {plantAverageOEE}% Nominal
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">All 4 production lines active</div>
        </div>

        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Blind Line Inventory</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
            {blindUnitsTotal > 0 ? `${blindUnitsTotal.toLocaleString()} units` : 'Balanced'}
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {blindUnitsTotal > 0 ? 'Stranded on zero-qty planning line' : 'No stranded blind inventory'}
          </div>
        </div>

        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Active Shop Floor Batches</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
            4 Lines Running
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Daily yield target on schedule</div>
        </div>

        <div className="p-4 rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Workstation Terminal Sync</div>
          <div className="mt-1 text-2xl font-semibold font-mono text-slate-950 dark:text-white tabular-nums">
            {displayLines.filter((l) => l.workstationSyncStatus === 'synced').length} / {displayLines.length} Synced
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {displayLines.some((l) => l.workstationSyncStatus === 'stale_detected')
              ? '1 terminal lagging WebSocket feed'
              : 'All terminals real-time'}
          </div>
        </div>
      </div>

      {/* Featured Diagnostic Box: Blind Line / Zero-Qty Line Arbitrator (Hotspot #2) */}
      <div className="rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-[#1a2336]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Hotspot #2 Diagnosis</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300">Line 2 (Filling) · RUN-4412</span>
            </div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white mt-0.5">
              Zero-Quantity / "Blind" Line MIPS Inventory Stranding Flag
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              1,200 usable finished goods units are attached to a zero-quantity ghost planning line in MIPS. The active
              sales demand line still shows a full 2,000 unit requirement, threatening redundant production.
            </p>
          </div>

          <div className="shrink-0">
            {!reconciledLines.includes('LINE-02') ? (
              <button
                onClick={() => handleResolveBlindLine('LINE-02')}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 rounded transition-colors shadow-xs"
              >
                <Zap className="w-4 h-4" />
                <span>Re-apply 1,200 Units & Downscale Run to 800</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold px-3 py-1.5 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                <CheckCircle2 className="w-4 h-4" />
                <span>Line 2 Re-aligned: 1,200 Net Applied · WO Downscaled to 800</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded bg-slate-50/70 dark:bg-[#101522] border border-slate-200/80 dark:border-[#1e273a]">
            <span className="text-slate-500 font-mono">Blind Planning Line</span>
            <div className="mt-1 font-semibold text-slate-950 dark:text-white">Line 2 Ghost Staging</div>
            <div className="mt-2 text-slate-600 dark:text-slate-400 flex justify-between">
              <span>Stranded On-Hand:</span>
              <span className="font-mono font-semibold text-slate-950 dark:text-white">1,200 units</span>
            </div>
          </div>

          <div className="p-3 rounded bg-slate-50/70 dark:bg-[#101522] border border-slate-200/80 dark:border-[#1e273a]">
            <span className="text-slate-500 font-mono">Active Demand Line</span>
            <div className="mt-1 font-semibold text-slate-950 dark:text-white">SO-9104 (Vanilla 48oz)</div>
            <div className="mt-2 text-slate-600 dark:text-slate-400 flex justify-between">
              <span>Scheduled Run Target:</span>
              <span className="font-mono font-semibold text-slate-950 dark:text-white">
                {reconciledLines.includes('LINE-02') ? '800 units (Net)' : '2,000 units (Gross)'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded bg-slate-50/70 dark:bg-[#101522] border border-slate-200/80 dark:border-[#1e273a]">
            <span className="text-slate-500 font-mono">Financial Exposure Averted</span>
            <div className="mt-1 font-semibold text-slate-950 dark:text-white">$4,680 Overproduction Savings</div>
            <div className="mt-2 text-slate-600 dark:text-slate-400 flex justify-between">
              <span>WMS Inventory Sync:</span>
              <span className="font-mono font-semibold text-slate-950 dark:text-white">100% Reconciled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Production Lines Telemetry Board */}
      <div className="rounded bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs">
        <div className="p-4 border-b border-slate-200/90 dark:border-[#1a2336] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white flex items-center gap-2">
              <span>Plant Line Operations & Workstation Sync Console</span>
              <span className="text-xs font-mono text-slate-500 font-normal">({displayLines.length} Production Lines)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live line throughput, hourly micro-sparklines, run progression, and operator terminal WebSocket telemetry
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter line / run / SKU..."
              className="pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-[#121725] border border-slate-200/90 dark:border-[#1a2336] rounded text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 dark:border-[#1a2336] bg-slate-50/60 dark:bg-[#0f1422] text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                <th className={`py-2 px-3 font-medium`}>Plant Line</th>
                <th className={`py-2 px-3 font-medium`}>Current Run & SKU</th>
                <th className={`py-2 px-3 font-medium text-right`}>Yield Progress</th>
                <th className={`py-2 px-3 font-medium text-center`}>Throughput Curve</th>
                <th className={`py-2 px-3 font-medium text-right`}>Hourly Rate</th>
                <th className={`py-2 px-3 font-medium text-right`}>OEE</th>
                <th className={`py-2 px-3 font-medium`}>Workstation Terminal</th>
                <th className={`py-2 px-3 font-medium`}>Status & Alerts</th>
                <th className={`py-2 px-3 font-medium text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-[#172033]">
              {filteredLines.map((line) => {
                const progressPct = Math.round((line.actualProduced / line.plannedQty) * 100);
                const hasBlindAlert = line.status === 'blind_line_alert';
                const isStaleWorkstation = line.workstationSyncStatus === 'stale_detected';
                const cellPadding = isCompact ? 'py-2 px-3' : 'py-3.5 px-4';

                return (
                  <tr
                    key={line.lineId}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#111726] transition-colors group cursor-pointer"
                    onClick={() => setSelectedLineForDetail(line)}
                  >
                    <td className={`${cellPadding} font-mono font-medium text-slate-900 dark:text-white`}>
                      <div className="font-semibold text-slate-950 dark:text-white">{line.name}</div>
                      <div className="text-slate-500 text-[11px]">{line.productType}</div>
                    </td>
                    <td className={cellPadding}>
                      <div className="font-medium text-slate-900 dark:text-slate-200">{line.currentSkuName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        {line.currentRun} · {line.currentSku}
                      </div>
                    </td>
                    <td className={`${cellPadding} text-right font-mono`}>
                      <div className="font-semibold text-slate-950 dark:text-white tabular-nums">
                        {line.actualProduced.toLocaleString()} / {line.plannedQty.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-500">{progressPct}% Complete</div>
                    </td>
                    {/* SVG Micro Sparkline Column */}
                    <td className={`${cellPadding} text-center`}>
                      <div className="flex justify-center">
                        {renderSparkline(line.sparkline, line.targetRatePerHour)}
                      </div>
                    </td>
                    <td className={`${cellPadding} text-right font-mono tabular-nums`}>
                      <div className="font-medium text-slate-900 dark:text-slate-200">{line.actualRatePerHour} / hr</div>
                      <div className="text-[11px] text-slate-500">Target: {line.targetRatePerHour}</div>
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-semibold tabular-nums text-slate-950 dark:text-white`}>
                      {line.oee}%
                    </td>
                    <td className={cellPadding}>
                      {isStaleWorkstation ? (
                        <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[11px] font-medium">
                          <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                          <span>Stale Sync Flagged</span>
                        </div>
                      ) : (
                        <div className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 text-[11px] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Terminal Synced</span>
                        </div>
                      )}
                    </td>
                    <td className={cellPadding}>
                      {hasBlindAlert ? (
                        <div className="text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1 text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Blind Line Alert</span>
                        </div>
                      ) : (
                        <div className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Running Nominal</span>
                        </div>
                      )}
                    </td>
                    <td className={`${cellPadding} text-right`} onClick={(e) => e.stopPropagation()}>
                      {isStaleWorkstation && (
                        <button
                          onClick={() => handleResyncWorkstation(line.lineId)}
                          className="px-2 py-1 text-xs font-medium text-slate-900 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-[#1a2336] dark:hover:bg-[#232f48] border border-slate-300 dark:border-[#2a3852] rounded transition-colors shadow-xs"
                        >
                          Sync Terminal
                        </button>
                      )}
                      {!isStaleWorkstation && (
                        <button
                          onClick={() => setSelectedLineForDetail(line)}
                          className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium"
                        >
                          Inspect
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

      {/* Line Details Modal */}
      {selectedLineForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1018] rounded-lg border border-slate-200 dark:border-[#1a2336] shadow-2xl max-w-lg w-full p-6 text-left relative">
            <button
              onClick={() => setSelectedLineForDetail(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              <span>MIPS Shop Floor Terminal Spec</span>
              <span>·</span>
              <span>{selectedLineForDetail.lineId}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
              {selectedLineForDetail.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Active Run: {selectedLineForDetail.currentRun} · {selectedLineForDetail.currentSkuName}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded bg-slate-50 dark:bg-[#121725] border border-slate-200/80 dark:border-[#1a2336]">
                <div className="text-slate-500 font-mono">Current Run Target</div>
                <div className="text-base font-semibold font-mono text-slate-950 dark:text-white mt-1">
                  {selectedLineForDetail.plannedQty.toLocaleString()} units
                </div>
              </div>
              <div className="p-3 rounded bg-slate-50 dark:bg-[#121725] border border-slate-200/80 dark:border-[#1a2336]">
                <div className="text-slate-500 font-mono">Actual Produced</div>
                <div className="text-base font-semibold font-mono text-slate-950 dark:text-white mt-1">
                  {selectedLineForDetail.actualProduced.toLocaleString()} units
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded bg-slate-50 dark:bg-[#121725] border border-slate-200/80 dark:border-[#1a2336] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Hourly Throughput:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200">
                  {selectedLineForDetail.actualRatePerHour} / hr (Target: {selectedLineForDetail.targetRatePerHour})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Overall Equipment Efficiency (OEE):</span>
                <span className="font-mono text-slate-900 dark:text-slate-200">{selectedLineForDetail.oee}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Workstation Sync:</span>
                <span className="text-slate-900 dark:text-slate-200">{selectedLineForDetail.workstationSyncStatus}</span>
              </div>
            </div>

            {selectedLineForDetail.activeAlert && (
              <div className="mt-4 p-3 rounded bg-slate-50 dark:bg-[#121725] border border-slate-200/80 dark:border-[#1a2336] text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-slate-200">Alert Diagnostics: </span>
                {selectedLineForDetail.activeAlert}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedLineForDetail(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
