import React from 'react';
import { DashboardView } from '../types';
import { Search, RefreshCw, Clock, Radio } from 'lucide-react';
import { motion } from 'motion/react';
import { playTactileTick } from '../utils/audio';

interface WorkspaceToolbarProps {
  currentView: DashboardView;
  onOpenCommandPalette: () => void;
  isSyncing: boolean;
  onRefresh: () => void;
  lastSyncTime: string;
  currentShift: string;
  onSelectShift: (shift: string) => void;
  currentSupervisor: string;
  isLiveStreaming: boolean;
  onToggleLiveStream: () => void;
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  currentView,
  onOpenCommandPalette,
  isSyncing,
  onRefresh,
  lastSyncTime,
  currentShift,
  onSelectShift,
  currentSupervisor,
  isLiveStreaming,
  onToggleLiveStream,
}) => {
  const viewTitles: Record<DashboardView, string> = {
    topology: 'Architecture & Hotspot Topology',
    reconciliation: 'Mismatch Queue & Supervisor Approvals',
    consolidate: 'Position Netting & Balance Formula',
    freezer: 'Blast Freezer Ghost Lots Tracker',
    odi_sync: 'WMS → Oracle ODI ~10m SLA Prober',
    handoff: 'Shift Handoff (3 Shifts · 11 Supervisors)',
  };

  const shifts = [
    { id: 'Shift 1 (06:00 - 14:00)', label: 'Shift 1 (Day)' },
    { id: 'Shift 2 (14:00 - 22:00)', label: 'Shift 2 (Eve)' },
    { id: 'Shift 3 (22:00 - 06:00)', label: 'Shift 3 (Night)' },
  ];

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#0f1115]/70 backdrop-blur-sm px-4 sm:px-6 py-2 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs truncate">
          <span className="text-zinc-500 font-medium">Lehigh Valley</span>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">LV-04</span>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-zinc-900 dark:text-zinc-200 font-bold truncate">{viewTitles[currentView]}</span>
        </div>

        {/* Action Controls & Shift Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live Telemetry Stream Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playTactileTick();
              onToggleLiveStream();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-colors shadow-2xs font-mono ${
              isLiveStreaming
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title="Toggle live telemetry streaming from MIPS & WMS"
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'animate-pulse text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
            <span>{isLiveStreaming ? 'Live Stream Active' : 'Live Stream Paused'}</span>
          </motion.button>

          {/* Command Palette Trigger */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              playTactileTick();
              onOpenCommandPalette();
            }}
            className="flex items-center gap-2 px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md transition-colors shadow-2xs"
            title="Open command palette (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Search SKU / Hotspot</span>
            <kbd className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded font-mono border border-zinc-200 dark:border-zinc-700">
              ⌘K
            </kbd>
          </motion.button>

          {/* Shift Segmented Control */}
          <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-0.5 rounded-md shadow-2xs">
            <span className="pl-2 pr-1 text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
            </span>
            {shifts.map((s) => {
              const isSelected = currentShift === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    playTactileTick();
                    onSelectShift(s.id);
                  }}
                  className={`relative px-2.5 py-0.5 text-xs font-medium rounded transition-colors whitespace-nowrap z-10 ${
                    isSelected
                      ? 'text-white dark:text-zinc-900 font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="relative z-10">{s.label}</span>
                  {isSelected && (
                    <motion.span
                      layoutId="activeShiftPill"
                      className="absolute inset-0 bg-zinc-900 dark:bg-zinc-100 rounded shadow-xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Supervisor Identity Tag */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-600 dark:text-zinc-300 font-mono">
            <span className="text-zinc-400">Lead:</span>
            <span className="font-bold text-zinc-900 dark:text-white">{currentSupervisor}</span>
          </div>

          {/* Pipeline Sync Button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playTactileTick();
              onRefresh();
            }}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md transition-colors disabled:opacity-50 shadow-2xs"
            title={`Last synchronized: ${lastSyncTime}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isSyncing ? 'animate-spin text-zinc-800 dark:text-zinc-200' : ''}`} />
            <span className="hidden xl:inline tabular-nums font-mono text-[11px] text-zinc-500">
              Synced {lastSyncTime}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
