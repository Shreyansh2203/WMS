import React, { useState } from 'react';
import { HotspotNumber, ReconciliationItem, AutomationPolicy } from '../../types';
import { HOTSPOT_METADATA } from '../../data/mockData';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Check,
  AlertCircle,
  Database,
  Cpu,
  Server,
  Snowflake,
} from 'lucide-react';

interface TopologyViewProps {
  onSelectHotspot: (hotspot: HotspotNumber) => void;
  onNavigateToRecon: () => void;
  onApproveItem?: (item: ReconciliationItem, supervisorName: string) => void;
  unresolvedCount: number;
  items: ReconciliationItem[];
  currentSupervisor?: string;
}

export const TopologyView: React.FC<TopologyViewProps> = ({
  onSelectHotspot,
  onNavigateToRecon,
  onApproveItem,
  unresolvedCount,
  items,
  currentSupervisor = 'Dave Miller',
}) => {
  const [automationPolicy, setAutomationPolicy] = useState<AutomationPolicy>('supervisor_approval');

  const pendingItems = items.filter((i) => i.status === 'pending_approval');
  const urgentItems = pendingItems.slice(0, 3);
  const totalAtRiskFinancial = pendingItems.reduce((acc, curr) => acc + curr.financialImpact, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Enterprise Facility Context Header */}
      <div className="bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-[#1e293b] rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              <span>Plant LV-04</span>
              <span>/</span>
              <span>Lehigh Valley Operations</span>
              <span>/</span>
              <span>Lines 1–5 Active</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white mt-1">
              Production & Inventory Reconciliation Operations
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Harmonizing plant MES work orders, warehouse physical pallet scans, and enterprise general ledger batches.
            </p>
          </div>

          {/* Remediation Policy */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-mono text-slate-500">Auto-Remediation:</span>
            <div className="inline-flex bg-slate-100 dark:bg-[#141a27] p-0.5 rounded border border-slate-200 dark:border-[#1e293b]">
              <button
                onClick={() => setAutomationPolicy('supervisor_approval')}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  automationPolicy === 'supervisor_approval'
                    ? 'bg-white dark:bg-[#1f293d] text-slate-900 dark:text-white font-medium shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Lead Sign-Off
              </button>
              <button
                onClick={() => setAutomationPolicy('auto_low_risk')}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  automationPolicy === 'auto_low_risk'
                    ? 'bg-white dark:bg-[#1f293d] text-slate-900 dark:text-white font-medium shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Auto-Remediate (&lt;$1,000)
              </button>
            </div>
          </div>
        </div>

        {/* Compact KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-[#1e293b]">
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider font-mono">
              Active Discrepancies
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold font-mono text-slate-900 dark:text-white tabular-nums">
                {unresolvedCount}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                (${totalAtRiskFinancial.toLocaleString()} at risk)
              </span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider font-mono">
              Overproduction Averted
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold font-mono text-slate-900 dark:text-white tabular-nums">
                48,200
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                +$112,400 saved
              </span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider font-mono">
              Ledger Alignment Rate
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold font-mono text-slate-900 dark:text-white tabular-nums">
                96.8%
              </span>
              <span className="text-xs text-slate-500 font-mono">Target: &gt;95%</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider font-mono">
              Oracle Sync Latency
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold font-mono text-slate-900 dark:text-white tabular-nums">
                4.2m
              </span>
              <span className="text-xs text-slate-500 font-mono">SLA &lt;10m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Split: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Priority Exceptions Triage */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-[#1e293b] rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e293b]">
              <div>
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                  Priority Discrepancies Requiring Authorization
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-exposure variances flagged across production runs.
                </p>
              </div>

              <button
                onClick={onNavigateToRecon}
                className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-1"
              >
                <span>View All ({items.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of high-priority exceptions */}
            <div className="divide-y divide-slate-100 dark:divide-[#1e293b]">
              {urgentItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  All variances reconciled for shift {currentSupervisor}.
                </div>
              ) : (
                urgentItems.map((item) => (
                  <div key={item.id} className="py-4 space-y-2.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-950 dark:text-white">{item.id}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-700 dark:text-slate-300">{item.plantLine}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono text-slate-500">{item.sku}</span>
                      </div>
                      <span className="font-mono text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                        Zone {item.hotspotNumber}: {item.hotspotTitle}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-slate-900 dark:text-white">
                        {item.skuName}
                      </div>
                      <div className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                        ${item.financialImpact.toLocaleString()}
                      </div>
                    </div>

                    {/* Diagnostic Context */}
                    <div className="bg-slate-50 dark:bg-[#141a27] border border-slate-200/60 dark:border-[#1e293b] rounded p-2.5 text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                      {item.aiRecommendation}
                    </div>

                    {/* Data Comparison Strip */}
                    <div className="grid grid-cols-4 gap-2 text-xs font-mono bg-white dark:bg-[#0e131f] border border-slate-200/60 dark:border-[#1e293b] rounded p-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">MIPS Scheduled</span>
                        <span className="text-slate-900 dark:text-white tabular-nums">{item.mipsQty.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">WMS Scan</span>
                        <span className="text-slate-900 dark:text-white tabular-nums">{item.wmsQty.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Discrepancy</span>
                        <span className={`tabular-nums font-semibold ${item.varianceQty < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {item.varianceQty > 0 ? `+${item.varianceQty}` : item.varianceQty}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Work Order</span>
                        <span className="text-slate-700 dark:text-slate-300">{item.workOrder}</span>
                      </div>
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-mono text-slate-500">
                        Target Systems: {item.affectedSystems.join(', ')}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={onNavigateToRecon}
                          className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                          Audit Details
                        </button>
                        <button
                          onClick={() => onApproveItem && onApproveItem(item, currentSupervisor)}
                          className="px-3 py-1 text-xs font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-white rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Authorize Adjustment</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Subsystem Telemetry & Zone Matrix */}
        <div className="space-y-4">
          {/* Subsystems Health */}
          <div className="bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-[#1e293b] rounded-lg p-5">
            <h2 className="text-sm font-semibold text-slate-950 dark:text-white mb-3">
              Subsystem Telemetry
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded border border-slate-200/80 dark:border-[#1e293b] bg-slate-50 dark:bg-[#141a27] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">MIPS Plant Floor MES</div>
                    <div className="text-[10px] text-slate-500 font-mono">Lines 1–5 streaming</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">Nominal</span>
              </div>

              <div className="p-2.5 rounded border border-slate-200/80 dark:border-[#1e293b] bg-slate-50 dark:bg-[#141a27] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">WMS Warehouse Engine</div>
                    <div className="text-[10px] text-slate-500 font-mono">Handheld scanners linked</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">Nominal</span>
              </div>

              <div className="p-2.5 rounded border border-slate-200/80 dark:border-[#1e293b] bg-slate-50 dark:bg-[#141a27] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Oracle Cloud ODI</div>
                    <div className="text-[10px] text-slate-500 font-mono">General Ledger batches</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">SLA 4.2m</span>
              </div>

              <div className="p-2.5 rounded border border-slate-200/80 dark:border-[#1e293b] bg-slate-50 dark:bg-[#141a27] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Snowflake className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Blast Freezer Sub-Inventory</div>
                    <div className="text-[10px] text-slate-500 font-mono">-18°C · 3 Ghost lots pending</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-medium">Action Req</span>
              </div>
            </div>
          </div>

          {/* Operational Risk Zones Matrix (Clean table list, not cartoon cards) */}
          <div className="bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-[#1e293b] rounded-lg p-5">
            <h2 className="text-sm font-semibold text-slate-950 dark:text-white mb-2">
              Operational Hotspot Matrix (Zones 1–8)
            </h2>
            <p className="text-[11px] text-slate-500 mb-3">
              MIPS vs WMS alignment status across plant lines.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-[#1e293b] text-xs">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const hotspot = HOTSPOT_METADATA[num as HotspotNumber];
                const zoneItems = items.filter((i) => i.hotspotNumber === num);
                const zoneUnresolved = zoneItems.filter((i) => i.status === 'pending_approval').length;

                return (
                  <button
                    key={num}
                    onClick={() => onSelectHotspot(num as HotspotNumber)}
                    className="w-full py-2 flex items-center justify-between text-left hover:text-slate-950 dark:hover:text-white transition-colors group"
                  >
                    <div>
                      <div className="font-mono text-[11px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                        Zone {num}
                      </div>
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[190px]">
                        {hotspot.title}
                      </div>
                    </div>

                    <div className="text-right font-mono text-[11px]">
                      {zoneUnresolved > 0 ? (
                        <span className="text-amber-700 dark:text-amber-400 font-semibold">{zoneUnresolved} pending</span>
                      ) : (
                        <span className="text-slate-400 font-normal">Aligned</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
