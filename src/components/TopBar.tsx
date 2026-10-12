import React, { useState } from 'react';
import { DashboardView, Theme } from '../types';
import {
  LayoutDashboard,
  Layers,
  Archive,
  Snowflake,
  RefreshCw,
  ClipboardList,
  Search,
  Plus,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Menu,
  X,
  User,
  Radio,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toggleAcousticFeedback, playTactileTick } from '../utils/audio';

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
  onToggleLiveStream,
  lastSyncTime,
  isSyncing,
  onRefresh,
}) => {
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupervisorMenuOpen, setIsSupervisorMenuOpen] = useState(false);

  const handleAudioToggle = () => {
    const newState = toggleAcousticFeedback();
    setIsAudioActive(newState);
    if (newState) playTactileTick();
  };

  const navItems: { id: DashboardView; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'topology', label: 'Overview', icon: LayoutDashboard },
    { id: 'reconciliation', label: 'Queue', icon: Layers, badge: unresolvedCount },
    { id: 'consolidate', label: 'Inventory Ledger', icon: Archive },
    { id: 'freezer', label: 'Cold Storage', icon: Snowflake },
    { id: 'odi_sync', label: 'Sync Pipeline', icon: RefreshCw },
    { id: 'handoff', label: 'Shift Handover', icon: ClipboardList },
  ];

  const shifts = [
    { id: 'Shift 1 (06:00 - 14:00)', label: 'Shift 1 (Day 06-14)', lead: 'Dave Miller' },
    { id: 'Shift 2 (14:00 - 22:00)', label: 'Shift 2 (Eve 14-22)', lead: 'Sarah Chen' },
    { id: 'Shift 3 (22:00 - 06:00)', label: 'Shift 3 (Night 22-06)', lead: 'Marcus Brody' },
  ];

  const handleNavClick = (viewId: DashboardView) => {
    playTactileTick();
    onSelectView(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c0d12]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Plant Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('topology')}
              className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
              title="Return to Plant Overview"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm shadow-xs transition-transform group-hover:scale-105">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white font-display leading-none">
                  PlantOps Hub
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-tight flex items-center gap-1 mt-0.5">
                  LV-04 <span className="text-zinc-300 dark:text-zinc-600">·</span> Lehigh Valley
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-zinc-100/70 dark:bg-zinc-900/60 p-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 shadow-xs font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-tight ${
                        isActive
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live Telemetry Pulse & Quick Sync */}
            <div className="hidden sm:flex items-center gap-1 text-xs">
              <button
                onClick={() => {
                  playTactileTick();
                  onToggleLiveStream();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                  isLiveStreaming
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                }`}
                title={isLiveStreaming ? 'Live Stream Active (Syncing every 8s)' : 'Live Stream Paused'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                <span className="hidden md:inline">{isLiveStreaming ? 'Live Sync' : 'Paused'}</span>
              </button>

              <button
                onClick={() => {
                  playTactileTick();
                  onRefresh();
                }}
                disabled={isSyncing}
                className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                title={`Sync Now (Last: ${lastSyncTime})`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Shift & Supervisor Quick Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsSupervisorMenuOpen((p) => !p)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-zinc-700 dark:text-zinc-300"
              >
                <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-200">
                  {currentSupervisor.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{currentSupervisor}</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{currentShift.split(' ')[0]}</span>
                </div>
              </button>

              {/* Supervisor Dropdown */}
              <AnimatePresence>
                {isSupervisorMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg py-1.5 z-50 text-xs"
                  >
                    <div className="px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800 font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                      Select Active Supervisor & Shift
                    </div>
                    {shifts.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          playTactileTick();
                          onSelectShift(s.id);
                          onSelectSupervisor(s.lead);
                          setIsSupervisorMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                          currentShift === s.id
                            ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-950 dark:text-white font-semibold'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{s.lead}</div>
                          <div className="text-[11px] text-zinc-400 dark:text-zinc-500">{s.label}</div>
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

            {/* Quick Search Shortcut */}
            <button
              onClick={() => {
                playTactileTick();
                onOpenCommandPalette();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              title="Search SKUs, lots, or commands (⌘K / Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Search</span>
              <kbd className="hidden sm:inline text-[10px] font-mono text-zinc-400 bg-zinc-200/60 dark:bg-zinc-800 px-1 rounded">⌘K</kbd>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleAudioToggle}
              className="p-2 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={isAudioActive ? 'Sound Feedback: ON (Click to Mute)' : 'Sound Feedback: OFF (Click to Enable)'}
              aria-label="Toggle sound feedback"
            >
              {isAudioActive ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                playTactileTick();
                onToggleTheme();
              }}
              className="p-2 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Primary Action Button: New Scan */}
            <button
              onClick={() => {
                playTactileTick();
                onOpenNewScanModal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Scan</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen((p) => !p)}
              className="lg:hidden p-2 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0d12] px-4 py-3 space-y-1"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Mobile Shift Info */}
            <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <span>On Duty: <strong className="text-zinc-800 dark:text-zinc-200">{currentSupervisor}</strong></span>
              <span>{currentShift.split(' ')[0]}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
