import React, { useState } from 'react';
import { DashboardView, Theme } from '../types';
import { Plus, Sun, Moon, Volume2, VolumeX, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toggleAcousticFeedback, playTactileTick } from '../utils/audio';

interface TopBarProps {
  currentView: DashboardView;
  onSelectView: (view: DashboardView) => void;
  onOpenNewScanModal: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  unresolvedCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onSelectView,
  onOpenNewScanModal,
  theme,
  onToggleTheme,
  unresolvedCount,
}) => {
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAudioToggle = () => {
    const newState = toggleAcousticFeedback();
    setIsAudioActive(newState);
    if (newState) playTactileTick();
  };

  const navItems: { id: DashboardView; label: string; badge?: number }[] = [
    { id: 'topology', label: 'Architecture & Hotspots' },
    { id: 'reconciliation', label: 'Recon Queue', badge: unresolvedCount },
    { id: 'consolidate', label: 'Net Position Formula' },
    { id: 'freezer', label: 'Freezer Ghost Lots' },
    { id: 'odi_sync', label: 'Oracle ODI (~10m SLA)' },
    { id: 'handoff', label: 'Shift Handoff (11 Leads)' },
  ];

  const handleNavClick = (viewId: DashboardView) => {
    playTactileTick();
    onSelectView(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0c0d10]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Single text element wordmark + Zero-pill clean unboxed metadata */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('topology')}
            className="text-sm sm:text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display whitespace-nowrap hover:opacity-85 transition-opacity flex items-center gap-2 focus-visible:outline-none"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 dark:bg-white inline-block animate-pulse" />
            <span>MIPS–WMS Recon</span>
          </button>
          <span className="hidden sm:inline-block text-zinc-300 dark:text-zinc-700" aria-hidden="true">·</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 dark:text-zinc-400">
            <span>Plant LV-04</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
          </span>
        </div>

        {/* Zone 2: Fluid desktop nav links (lg screens and up) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs font-medium tracking-normal overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`whitespace-nowrap shrink-0 py-1.5 relative transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-zinc-950 dark:text-white font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    [{item.badge}]
                  </span>
                )}
                {isActive && (
                  <motion.span
                    layoutId="topbar-nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 dark:bg-white rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions + Audio Feedback + Theme Toggle + Mobile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleAudioToggle}
            className={`p-1.5 rounded-md transition-colors ${
              isAudioActive
                ? 'text-zinc-900 bg-zinc-100 dark:text-zinc-100 dark:bg-zinc-800'
                : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
            title={isAudioActive ? 'Plant acoustic feedback enabled' : 'Enable tactile audio chimes'}
            aria-label="Toggle acoustic tactile feedback"
          >
            {isAudioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onToggleTheme}
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme (Key: T)`}
            aria-label="Toggle visual theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onOpenNewScanModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:text-zinc-900 dark:bg-zinc-100 dark:hover:bg-white transition-all rounded-md shadow-xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Manual Ticket Issue</span>
            <span className="sm:hidden">Issue</span>
          </motion.button>

          {/* Mobile / Tablet Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Open view navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Responsive Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 overflow-hidden"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center justify-between px-3 py-2 text-xs rounded-md text-left transition-colors ${
                  currentView === item.id
                    ? 'bg-zinc-100 dark:bg-zinc-800/80 font-bold text-zinc-950 dark:text-white'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="font-mono text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                    {item.badge} pending
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
