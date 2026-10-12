import React, { useState } from 'react';
import { DashboardView, Theme, DensityMode } from '../types';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TopBarProps {
  currentView: DashboardView;
  onSelectView: (view: DashboardView) => void;
  onOpenNewScanModal: () => void;
  onOpenCommandPalette: () => void;
  onOpenSimulation?: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  density: DensityMode;
  onToggleDensity: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHelp: () => void;
  unresolvedCount: number;
  currentShift: string;
  onSelectShift: (shift: string) => void;
  currentSupervisor: string;
  onSelectSupervisor: (name: string) => void;
  isLiveStreaming: boolean;
  onToggleLiveStream: () => void;
  lastSyncTime: string;
  isSyncing: boolean;
  onRefresh: () => void;
  ghostLotCount?: number;
  bussConflictCount?: number;
  mipsAlertCount?: number;
  odiLaggingCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onSelectView,
  onOpenNewScanModal,
  onOpenCommandPalette,
  onOpenSimulation,
  theme,
  onToggleTheme,
  density,
  onToggleDensity,
  isSoundEnabled,
  onToggleSound,
  onOpenHelp,
  unresolvedCount,
  currentShift,
  onSelectShift,
  currentSupervisor,
  onSelectSupervisor,
  lastSyncTime,
  ghostLotCount = 3,
  bussConflictCount = 2,
  mipsAlertCount = 1,
  odiLaggingCount = 2,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupervisorMenuOpen, setIsSupervisorMenuOpen] = useState(false);

  // The 4 Core Enterprise IT Tabs requested by user
  const primaryTabs: { id: DashboardView; label: string; count?: number }[] = [
    { id: 'wms', label: 'WMS', count: ghostLotCount },
    { id: 'buss', label: 'BUSS', count: bussConflictCount },
    { id: 'mips', label: 'MIPS', count: mipsAlertCount },
    { id: 'oracle_odi', label: 'Oracle Cloud + ODI', count: odiLaggingCount },
  ];

  // Secondary Cross-Plant Tools
  const secondaryTabs: { id: DashboardView; label: string; count?: number }[] = [
    { id: 'topology', label: 'Topology' },
    { id: 'reconciliation', label: 'Incident Queue', count: unresolvedCount },
    { id: 'handoff', label: 'Shift Handover' },
  ];

  const shifts = [
    { id: 'Shift 1 (06:00 - 14:00)', label: 'Shift 1 (Day)', lead: 'Dave Miller' },
    { id: 'Shift 2 (14:00 - 22:00)', label: 'Shift 2 (Evening)', lead: 'Sarah Chen' },
    { id: 'Shift 3 (22:00 - 06:00)', label: 'Shift 3 (Night)', lead: 'Marcus Brody' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#0b0e17] border-b border-slate-200/90 dark:border-[#1a2336] text-slate-900 dark:text-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(255,255,255,0.03)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-6">
          {/* Brand & Context */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => onSelectView('wms')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-6 h-6 rounded bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-100 dark:to-slate-300 text-white dark:text-slate-950 flex items-center justify-center font-bold text-xs tracking-tighter shadow-xs border border-slate-800/80 dark:border-white/20">
                IT
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm tracking-tight text-slate-950 dark:text-white font-display">
                  Operations Console
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
                  LV-04 / Lehigh Valley
                </span>
              </div>
            </button>
          </div>

          {/* 4 Centralized IT Operations Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100/80 dark:bg-[#101625] rounded-md border border-slate-200/80 dark:border-[#1a2336]">
              {primaryTabs.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    className={`relative px-3 py-1.5 text-xs font-medium rounded transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-white dark:bg-[#1a2337] text-slate-950 dark:text-white font-semibold shadow-xs border border-slate-200 dark:border-[#263550]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-[#151c2e]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-slate-200 dark:bg-[#25324c] text-slate-700 dark:text-slate-300">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="w-[1px] h-5 bg-slate-200 dark:bg-[#1a2336] mx-1.5" />

            {/* Secondary plant-wide utilities */}
            <div className="flex items-center gap-0.5">
              {secondaryTabs.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    className={`px-2.5 py-1 text-xs rounded transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-100 dark:bg-[#151c2c] text-slate-950 dark:text-white font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#111724]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="ml-1 text-[10px] font-mono text-slate-500">
                        ({item.count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Telemetry Status */}
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 mr-2 border-r border-slate-200/80 dark:border-[#1a2336] pr-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
              <span>Synced {lastSyncTime}</span>
            </div>

            {/* Global Search Button */}
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-50 dark:bg-[#121725] hover:bg-slate-100 dark:hover:bg-[#182033] rounded border border-slate-200/90 dark:border-[#1a2336] transition-colors"
              title="Quick Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-500">Search</span>
              <kbd className="font-mono text-[9px] bg-white dark:bg-[#0b0e17] px-1 py-0.2 rounded border border-slate-200 dark:border-[#1a2336] text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Density Toggle */}
            <button
              onClick={onToggleDensity}
              className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-50 dark:bg-[#121725] rounded border border-slate-200/90 dark:border-[#1a2336] transition-colors"
              title={`Switch density mode (Current: ${density})`}
            >
              {density === 'compact' ? (
                <>
                  <Maximize2 className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px]">Comfort</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px]">Compact</span>
                </>
              )}
            </button>

            {/* Audio Feedback Toggle */}
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#121725] transition-colors"
              title={isSoundEnabled ? 'Audio Chimes Enabled' : 'Audio Muted'}
            >
              {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-50" />}
            </button>

            {/* Hotkeys Cheatsheet */}
            <button
              onClick={onOpenHelp}
              className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#121725] transition-colors"
              title="Keyboard Shortcuts (?)"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {/* Shift & Supervisor Switcher */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsSupervisorMenuOpen((p) => !p)}
                className="flex items-center gap-2 px-2.5 py-1 text-xs bg-slate-50 dark:bg-[#121725] border border-slate-200/90 dark:border-[#1a2336] rounded hover:bg-slate-100 dark:hover:bg-[#182033] transition-colors text-slate-700 dark:text-slate-300"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-900 dark:text-white">{currentSupervisor}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{currentShift.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              <AnimatePresence>
                {isSupervisorMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 mt-1 w-56 bg-white dark:bg-[#0c1018] border border-slate-200 dark:border-[#1a2336] rounded shadow-lg py-1 z-50 text-xs"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-100 dark:border-[#1a2336]">
                      Shift Handoff Leads
                    </div>
                    {shifts.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onSelectShift(s.id);
                          onSelectSupervisor(s.lead);
                          setIsSupervisorMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#131926] ${
                          currentShift === s.id ? 'bg-slate-50 dark:bg-[#151d2d] font-semibold text-slate-950 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{s.label}</div>
                          <div className="text-[11px] text-slate-400">{s.lead}</div>
                        </div>
                        {currentShift === s.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stress Test Simulation Sandbox Action */}
            {onOpenSimulation && (
              <button
                onClick={onOpenSimulation}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/40 rounded shadow-xs hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors whitespace-nowrap"
                title="Open Plant Operational Stress Simulator (S)"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Stress Test</span>
              </button>
            )}

            {/* Log Discrepancy Primary Action */}
            <button
              onClick={onOpenNewScanModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-slate-950 dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 rounded shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Incident</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#121725] transition-colors"
              title={`Toggle theme (${theme})`}
              aria-label="Toggle theme mode"
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setIsMobileMenuOpen((p) => !p)}
              className="lg:hidden p-1.5 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 dark:border-[#1a2336] bg-white dark:bg-[#0b0e17] px-4 py-2 space-y-1"
          >
            <div className="text-[10px] font-mono text-slate-400 px-3 pt-1 uppercase">Primary IT Systems</div>
            {primaryTabs.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs text-left ${
                  currentView === item.id
                    ? 'bg-slate-100 dark:bg-[#151c2c] font-semibold text-slate-950 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {item.count}
                  </span>
                )}
              </button>
            ))}

            <div className="text-[10px] font-mono text-slate-400 px-3 pt-2 uppercase">Cross-Plant Consoles</div>
            {secondaryTabs.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs text-left ${
                  currentView === item.id
                    ? 'bg-slate-100 dark:bg-[#151c2c] font-semibold text-slate-950 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {item.count}
                  </span>
                )}
              </button>
            ))}

            <div className="pt-2 border-t border-slate-200 dark:border-[#1a2336] flex items-center justify-between px-3 py-1 text-xs">
              <span className="text-slate-500">Density Mode</span>
              <button
                onClick={onToggleDensity}
                className="font-medium text-slate-900 dark:text-white font-mono"
              >
                {density.toUpperCase()}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
