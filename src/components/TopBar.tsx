import React, { useState } from 'react';
import { DashboardView, Theme } from '../types';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TopBarProps {
  currentView: DashboardView;
  onSelectView: (view: DashboardView) => void;
  onOpenNewScanModal: () => void;
  onOpenCommandPalette: () => void;
  theme: Theme;
  onToggleTheme: () => void;
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
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onSelectView,
  onOpenNewScanModal,
  onOpenCommandPalette,
  theme,
  onToggleTheme,
  unresolvedCount,
  currentShift,
  onSelectShift,
  currentSupervisor,
  onSelectSupervisor,
  isLiveStreaming,
  lastSyncTime,
  isSyncing,
  onRefresh,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupervisorMenuOpen, setIsSupervisorMenuOpen] = useState(false);

  const navItems: { id: DashboardView; label: string; count?: number }[] = [
    { id: 'topology', label: 'Overview' },
    { id: 'reconciliation', label: 'Reconciliation Queue', count: unresolvedCount },
    { id: 'consolidate', label: 'Inventory Ledger' },
    { id: 'freezer', label: 'Cold Storage' },
    { id: 'odi_sync', label: 'ERP Interface' },
    { id: 'handoff', label: 'Shift Handover' },
  ];

  const shifts = [
    { id: 'Shift 1 (06:00 - 14:00)', label: 'Shift 1 (Day)', lead: 'Dave Miller' },
    { id: 'Shift 2 (14:00 - 22:00)', label: 'Shift 2 (Evening)', lead: 'Sarah Chen' },
    { id: 'Shift 3 (22:00 - 06:00)', label: 'Shift 3 (Night)', lead: 'Marcus Brody' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#0e131f] border-b border-slate-200 dark:border-[#1e293b] text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-6">
          {/* Brand & Context */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => onSelectView('topology')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-6 h-6 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs tracking-tighter">
                PL
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm tracking-tight text-slate-950 dark:text-white font-display">
                  PlantOps
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  LV-04 / Lehigh Valley
                </span>
              </div>
            </button>
          </div>

          {/* Clean Enterprise Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`relative px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-100 dark:bg-[#1a2234] text-slate-950 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#151c2c]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="ml-1.5 text-[10px] font-mono font-semibold text-amber-700 dark:text-amber-400">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Telemetry Status */}
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 mr-2 border-r border-slate-200 dark:border-[#1e293b] pr-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              <span>Synced {lastSyncTime}</span>
            </div>

            {/* Global Search Button */}
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-50 dark:bg-[#141a27] hover:bg-slate-100 dark:hover:bg-[#1b2335] rounded border border-slate-200 dark:border-[#1e293b] transition-colors"
              title="Quick Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-500">Search</span>
              <kbd className="font-mono text-[9px] bg-white dark:bg-[#0e131f] px-1 py-0.2 rounded border border-slate-200 dark:border-[#1e293b] text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Shift & Supervisor Switcher */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsSupervisorMenuOpen((p) => !p)}
                className="flex items-center gap-2 px-2.5 py-1 text-xs bg-slate-50 dark:bg-[#141a27] border border-slate-200 dark:border-[#1e293b] rounded hover:bg-slate-100 dark:hover:bg-[#1b2335] transition-colors text-slate-700 dark:text-slate-300"
              >
                <div className="flex items-baseline gap-1 text-[11px]">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{currentSupervisor}</span>
                  <span className="text-slate-400 font-mono">({currentShift.split(' ')[0]})</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <AnimatePresence>
                {isSupervisorMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 mt-1 w-56 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-[#1e293b] rounded shadow-lg py-1 z-50 text-xs"
                  >
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-100 dark:border-[#1e293b]">
                      Active Plant Lead
                    </div>
                    {shifts.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onSelectShift(s.id);
                          onSelectSupervisor(s.lead);
                          setIsSupervisorMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between transition-colors ${
                          currentShift === s.id
                            ? 'bg-slate-100 dark:bg-[#1a2234] text-slate-950 dark:text-white font-medium'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#141a27]'
                        }`}
                      >
                        <div>
                          <div>{s.lead}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.label}</div>
                        </div>
                        {currentShift === s.id && (
                          <span className="text-[10px] font-mono text-emerald-600 font-semibold">Active</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Log Discrepancy Primary Action */}
            <button
              onClick={onOpenNewScanModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-white rounded transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Discrepancy</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141a27] transition-colors"
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
            className="lg:hidden border-t border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0e131f] px-4 py-2 space-y-1"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs text-left ${
                  currentView === item.id
                    ? 'bg-slate-100 dark:bg-[#1a2234] font-semibold text-slate-950 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="font-mono text-xs text-amber-600 font-semibold">{item.count}</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
