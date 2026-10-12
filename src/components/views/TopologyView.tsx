import React, { useState } from 'react';
import { HotspotNumber, ReconciliationItem, AutomationPolicy } from '../../types';
import { HOTSPOT_METADATA } from '../../data/mockData';
import {
  AlertTriangle,
  Database,
  Server,
  Cpu,
  ArrowRight,
  X,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  DollarSign,
  Layers,
  ChevronRight,
  TrendingDown,
  Sparkles,
  HelpCircle,
  Activity,
  Bot,
  Sliders,
  Check,
  TrendingUp,
  FileCheck2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playTactileTick, playSuccessChime } from '../../utils/audio';

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
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(() => {
    try {
      return localStorage.getItem('plantops_hide_guide') !== 'true';
    } catch {
      return true;
    }
  });

  const [activePipelineStage, setActivePipelineStage] = useState<'source' | 'harmonize' | 'agent' | 'action'>('agent');
  const [automationPolicy, setAutomationPolicy] = useState<AutomationPolicy>('supervisor_approval');

  const handleDismissGuide = () => {
    playTactileTick();
    setShowWelcomeGuide(false);
    try {
      localStorage.setItem('plantops_hide_guide', 'true');
    } catch {}
  };

  const handleRestoreGuide = () => {
    playTactileTick();
    setShowWelcomeGuide(true);
    try {
      localStorage.removeItem('plantops_hide_guide');
    } catch {}
  };

  const pendingItems = items.filter((i) => i.status === 'pending_approval');
  const resolvedItems = items.filter((i) => i.status === 'approved_executed');
  const urgentItems = pendingItems.slice(0, 3);
  const totalAtRiskFinancial = pendingItems.reduce((acc, curr) => acc + curr.financialImpact, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Plant Operations Header & Autonomous Policy Control */}
      <div className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-zinc-900 dark:text-white font-display">Plant LV-04 (Lehigh Valley)</span>
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry Ingestion (12ms)
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              <span className="text-zinc-500 font-mono text-[11px]">Shift Lead: {currentSupervisor}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white tracking-tight">
              AI Inventory Reconciliation & Operations Hub
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-3xl">
              End-to-end multi-tier synchronization: harmonizing floor production schedules (MIPS), physical warehouse pallet scans (WMS), and enterprise financial ledgers (Oracle Cloud ERP).
            </p>
          </div>

          {/* Automation Policy Dial */}
          <div className="flex items-center gap-2 self-start lg:self-auto bg-zinc-50 dark:bg-zinc-900 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-zinc-500 px-2 flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
              <span>Agent Mode:</span>
            </span>
            <button
              onClick={() => {
                playTactileTick();
                setAutomationPolicy('supervisor_approval');
              }}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                automationPolicy === 'supervisor_approval'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Assisted (Lead Review)
            </button>
            <button
              onClick={() => {
                playTactileTick();
                setAutomationPolicy('auto_low_risk');
              }}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                automationPolicy === 'auto_low_risk'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Auto-Pilot (&lt;$1,000)
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Inventory Health & Open Variances */}
        <motion.div
          whileHover={{ y: -2 }}
          onClick={onNavigateToRecon}
          className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 shadow-xs cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Inventory Health Score</span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
              96.8% In Sync
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 dark:text-white">
              {unresolvedCount}
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
              Active Variances
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <span>${totalAtRiskFinancial.toLocaleString()} at risk</span>
            <span className="text-zinc-900 dark:text-white font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
              Review Queue <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* KPI 2: Unnecessary Production Prevented */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Overproduction Prevented</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 dark:text-white">
              48,200 <span className="text-sm font-normal text-zinc-500">units</span>
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <span>Prevented Scrap & Waste</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">+$112,400</span>
          </div>
        </motion.div>

        {/* KPI 3: Oracle Cloud Sync SLA */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Oracle Cloud ODI Sync</span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
              99.4% On-Time
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 dark:text-white">
              4.2 <span className="text-sm font-normal text-zinc-500">min</span>
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <span>SLA Target: &lt;10 min</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Delivered</span>
          </div>
        </motion.div>

        {/* KPI 4: Blast Freezer Sub-Inventory */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Cold Chain Blast Freezer</span>
            <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded">
              -18°C
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 dark:text-white">
              3 <span className="text-sm font-normal text-zinc-500">ghost lots</span>
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <span>Pending WMS Deduction</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">38,000 units</span>
          </div>
        </motion.div>
      </div>

      {/* Interactive AI Agent Solution Pipeline (Production-Grade Interactive Workflow) */}
      <div className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h2 className="text-base font-bold font-display text-zinc-900 dark:text-white">
                AI-Driven Reconciliation Pipeline
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Continuous 4-stage processing: Correct at Source ➔ Harmonize & Net ➔ Autonomous Agent Evaluation ➔ Actionable Execution.
            </p>
          </div>

          <div className="text-xs text-zinc-500">
            Click any stage to view active engine telemetry
          </div>
        </div>

        {/* 4 Connected Pipeline Stations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Stage 1: Correct at the Source */}
          <button
            onClick={() => {
              playTactileTick();
              setActivePipelineStage('source');
            }}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              activePipelineStage === 'source'
                ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800/60 shadow-xs'
                : 'border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                STAGE 1
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white">
              Correct at Source
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Ingests MIPS schedules, WMS barcode scans, and Oracle sales orders.
            </p>
            <div className="mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 flex justify-between">
              <span>MIPS · WMS · Oracle</span>
              <span className="text-emerald-600 font-semibold">Clean Inputs</span>
            </div>
          </button>

          {/* Stage 2: Harmonization & Netting */}
          <button
            onClick={() => {
              playTactileTick();
              setActivePipelineStage('harmonize');
            }}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              activePipelineStage === 'harmonize'
                ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800/60 shadow-xs'
                : 'border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                STAGE 2
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white">
              Data Harmonization & Netting
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Calculates True Net Requirement: Total Demand - Usable Stock - Output ± Returns.
            </p>
            <div className="mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 flex justify-between">
              <span>Standardize UOM & Lots</span>
              <span className="text-emerald-600 font-semibold">188 SKUs Net</span>
            </div>
          </button>

          {/* Stage 3: AI Reconciliation Agent */}
          <button
            onClick={() => {
              playTactileTick();
              setActivePipelineStage('agent');
            }}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              activePipelineStage === 'agent'
                ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800/60 shadow-xs'
                : 'border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                STAGE 3
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white">
              AI Reconciliation Agent
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Detects ghost lots, blind lines, and moved runs. Explains root cause & impact.
            </p>
            <div className="mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 flex justify-between">
              <span>Cross-System Matching</span>
              <span className="text-amber-600 font-semibold">{unresolvedCount} Flagged</span>
            </div>
          </button>

          {/* Stage 4: Actionable Results */}
          <button
            onClick={() => {
              playTactileTick();
              setActivePipelineStage('action');
            }}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              activePipelineStage === 'action'
                ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800/60 shadow-xs'
                : 'border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                STAGE 4
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white">
              Actionable Execution & Sync
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              1-click authorization executes WMS deduction, Oracle ODI batch, & audit trail.
            </p>
            <div className="mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 flex justify-between">
              <span>Automatic Carryover</span>
              <span className="text-emerald-600 font-semibold">100% Traceable</span>
            </div>
          </button>
        </div>

        {/* Selected Stage Detail Drawer */}
        <div className="mt-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
          {activePipelineStage === 'source' && (
            <div className="space-y-1">
              <strong className="text-zinc-900 dark:text-white block font-semibold">Stage 1 Telemetry · Source Data Ingestion:</strong>
              <p>MIPS (MES) streams production lines 1–5 batch schedules and worker assignments; WMS streams real-time pallet ticket scans and blast freezer tickets; Oracle Cloud provides confirmed sales order backlog and demand forecasts.</p>
            </div>
          )}
          {activePipelineStage === 'harmonize' && (
            <div className="space-y-1">
              <strong className="text-zinc-900 dark:text-white block font-semibold">Stage 2 Telemetry · Reconciled SKU Position Engine:</strong>
              <p>The netting engine standardizes dates and UOM across lines. Governing Equation: <code className="font-mono bg-zinc-200/60 dark:bg-zinc-800 px-1 py-0.5 rounded">Net Requirement = Total Valid Demand - Usable WMS Stock - Completed Production ± Returns</code>. This completely prevents scheduling duplicate batches.</p>
            </div>
          )}
          {activePipelineStage === 'agent' && (
            <div className="space-y-1">
              <strong className="text-zinc-900 dark:text-white block font-semibold">Stage 3 Telemetry · AI Autonomous Agent Intelligence:</strong>
              <p>The agent correlates physical pallet tickets across sales days to catch zero-quantity work order lines, unnetted dock returns, and orphaned freezer lots. It evaluates financial overproduction risk and generates human-readable root cause explanations for plant supervisors.</p>
            </div>
          )}
          {activePipelineStage === 'action' && (
            <div className="space-y-1">
              <strong className="text-zinc-900 dark:text-white block font-semibold">Stage 4 Telemetry · Enterprise Execution & Oracle Sync:</strong>
              <p>When an adjustment is authorized, the agent automatically executes WMS stock adjustments, clears the ghost lot reservation, updates MIPS net demand, and pushes the Oracle ODI transaction batch within the ~10 minute SLA.</p>
            </div>
          )}
        </div>
      </div>

      {/* Immediate Attention: High-Impact Variances Requiring Supervisor Action */}
      <div className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Priority Reconciliation Feed</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full">
                {pendingItems.length} Pending Sign-Off
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Review flagged items below. Authorizing applies corrections across MIPS, WMS, and Oracle Cloud in one step.
            </p>
          </div>

          <button
            onClick={onNavigateToRecon}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors self-start sm:self-auto"
          >
            <span>Open Full Queue ({items.length} records)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Priority Item Cards */}
        <div className="space-y-3.5">
          {urgentItems.length === 0 ? (
            <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">All Variances Reconciled!</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Zero active variances require supervisor action on shift {currentSupervisor}.
              </p>
            </div>
          ) : (
            urgentItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="p-4 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white bg-zinc-200/80 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      {item.id}
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.plantLine}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span className="text-zinc-500 font-mono">{item.sku}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                      Zone #{item.hotspotNumber}: {item.hotspotTitle}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-zinc-900 dark:text-white">
                    {item.skuName}
                  </div>

                  {/* AI Root Cause & Recommendation */}
                  <div className="p-3 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 text-xs">
                    <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                      AI Root Cause & Recommended Action:
                    </div>
                    <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                      "{item.aiRecommendation}"
                    </p>
                  </div>

                  {/* 3-Way System Quantity Comparison */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
                    <div className="bg-white dark:bg-zinc-950/60 p-2 rounded border border-zinc-200/70 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block font-sans">MIPS Scheduled</span>
                      <strong className="text-zinc-900 dark:text-white">{item.mipsQty.toLocaleString()} units</strong>
                    </div>
                    <div className="bg-white dark:bg-zinc-950/60 p-2 rounded border border-zinc-200/70 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block font-sans">WMS Floor Scan</span>
                      <strong className="text-zinc-900 dark:text-white">{item.wmsQty.toLocaleString()} units</strong>
                    </div>
                    <div className="bg-white dark:bg-zinc-950/60 p-2 rounded border border-zinc-200/70 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block font-sans">Net Variance</span>
                      <strong className={item.varianceQty < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
                        {item.varianceQty > 0 ? `+${item.varianceQty}` : item.varianceQty} units
                      </strong>
                    </div>
                    <div className="bg-white dark:bg-zinc-950/60 p-2 rounded border border-zinc-200/70 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block font-sans">Financial Risk</span>
                      <strong className="text-amber-600 dark:text-amber-400">${item.financialImpact.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Supervisor Action Buttons */}
                <div className="flex flex-row lg:flex-col items-stretch gap-2 shrink-0">
                  <button
                    onClick={() => {
                      if (onApproveItem) {
                        onApproveItem(item, currentSupervisor);
                      }
                    }}
                    className="flex-1 lg:flex-initial px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Sync</span>
                  </button>

                  <button
                    onClick={() => onSelectHotspot(item.hotspotNumber)}
                    className="px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Inspect Zone</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Business Value Realization Panel (From the Solution Architecture) */}
      <div className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-bold font-display text-zinc-900 dark:text-white">
              Demonstrated Plant Business Value & ROI
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Key operational outcomes delivered across the Lehigh Valley plant operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Waste Reduction</span>
            <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-1">48,200 units</div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Unnecessary production runs prevented.</p>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Labor Time Saved</span>
            <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-1">14.5 hrs / wk</div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Across 3 shifts and 11 plant supervisors.</p>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Working Capital</span>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">$112,400</div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Eliminated ghost inventory holding cost.</p>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Shift Alignment</span>
            <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-1">100% Logged</div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Replaced verbal handoffs with audit notes.</p>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Financial Close</span>
            <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-1">SLA Ready</div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Zero month-end Oracle reconciliation delay.</p>
          </div>
        </div>
      </div>

      {/* Operational Hotspots Reference (The 8 Root Causes) */}
      <div className="bg-white dark:bg-[#111317] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold font-display text-zinc-900 dark:text-white">
              Operational Hotspot Directory (8 Mismatch Scenarios)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              The 8 verified operational scenarios monitored by the AI agent. Click any card to filter the queue.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.values(HOTSPOT_METADATA) as typeof HOTSPOT_METADATA[1][]).map((meta) => {
            const countForHotspot = items.filter(
              (i) => i.hotspotNumber === meta.number && i.status === 'pending_approval'
            ).length;

            return (
              <motion.div
                key={meta.number}
                whileHover={{ y: -2 }}
                onClick={() => {
                  playTactileTick();
                  onSelectHotspot(meta.number);
                }}
                className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/20 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-zinc-800 font-mono font-bold text-[11px] flex items-center justify-center text-zinc-800 dark:text-zinc-200">
                      #{meta.number}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      {meta.category}
                    </span>
                  </div>
                  {countForHotspot > 0 ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      {countForHotspot} open
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400 font-medium">Synced</span>
                  )}
                </div>

                <div className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
                  {meta.title}
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {meta.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="text-[10px] text-zinc-400">Filter Queue</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
