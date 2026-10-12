import React, { useState, useEffect, useCallback } from 'react';
import {
  Theme,
  DashboardView,
  HotspotNumber,
  ReconciliationItem,
  ConsolidatedPosition,
  FreezerLot,
  OdiTransaction,
  Supervisor,
  ShiftHandoffLog,
} from './types';
import {
  INITIAL_RECONCILIATION_ITEMS,
  CONSOLIDATED_POSITIONS,
  FREEZER_GHOST_LOTS,
  ODI_TRANSACTIONS,
  SUPERVISORS_ROSTER,
  SHIFT_HANDOFF_LOGS,
} from './data/mockData';
import { TopBar } from './components/TopBar';
import { TopologyView } from './components/views/TopologyView';
import { ReconciliationQueueView } from './components/views/ReconciliationQueueView';
import { ConsolidatePositionView } from './components/views/ConsolidatePositionView';
import { FreezerLotTrackerView } from './components/views/FreezerLotTrackerView';
import { OdiInterfaceMonitorView } from './components/views/OdiInterfaceMonitorView';
import { ShiftHandoffView } from './components/views/ShiftHandoffView';
import { CommandPalette } from './components/CommandPalette';
import { NewEntryModal } from './components/NewEntryModal';
import { ArrowUp, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { playSuccessChime, playTactileTick } from './utils/audio';

export default function App() {
  const [currentView, setCurrentView] = useState<DashboardView>('topology');
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('strata_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  // Plant Data State
  const [reconciliationItems, setReconciliationItems] = useState<ReconciliationItem[]>(INITIAL_RECONCILIATION_ITEMS);
  const [positions, setPositions] = useState<ConsolidatedPosition[]>(CONSOLIDATED_POSITIONS);
  const [freezerLots, setFreezerLots] = useState<FreezerLot[]>(FREEZER_GHOST_LOTS);
  const [odiTransactions, setOdiTransactions] = useState<OdiTransaction[]>(ODI_TRANSACTIONS);
  const [supervisors, setSupervisors] = useState<Supervisor[]>(SUPERVISORS_ROSTER);
  const [handoffLogs, setHandoffLogs] = useState<ShiftHandoffLog[]>(SHIFT_HANDOFF_LOGS);

  // Active Supervisory Session (3 shifts · 11 leads)
  const [currentSupervisor, setCurrentSupervisor] = useState<string>('Dave Miller');
  const [currentShift, setCurrentShift] = useState<string>('Shift 1 (06:00 - 14:00)');
  const [selectedHotspotFilter, setSelectedHotspotFilter] = useState<HotspotNumber | 'all'>('all');

  // Modals & Panels
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewScanModalOpen, setIsNewScanModalOpen] = useState(false);

  // Pipeline telemetry
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('23:05:12 UTC');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scroll depth tracking & back to top
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 30, restDelta: 0.001 });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setShowScrollTop(latest > 280);
    });
  }, [scrollY]);

  const scrollToTop = () => {
    playTactileTick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Background Live Stream Simulation
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(
        now.getUTCMinutes()
      ).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`;
      setLastSyncTime(timeStr);
    }, 8000);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('strata_theme', next);
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === '1') setCurrentView('topology');
      if (e.key === '2') setCurrentView('reconciliation');
      if (e.key === '3') setCurrentView('consolidate');
      if (e.key === '4') setCurrentView('freezer');
      if (e.key === '5') setCurrentView('odi_sync');
      if (e.key === '6') setCurrentView('handoff');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsSyncing(true);
    playTactileTick();
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      setLastSyncTime(
        `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(
          2,
          '0'
        )}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`
      );
      showToast('WMS and MIPS operational queues resynchronized');
    }, 600);
  }, [showToast]);

  const handleApproveItem = useCallback(
    (id: string, supervisorName: string, shift: string) => {
      const target = reconciliationItems.find((i) => i.id === id);
      if (!target) return;

      setReconciliationItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'approved_executed',
                approvedBy: supervisorName,
                approvedShift: shift,
                approvedAt: new Date().toISOString(),
              }
            : item
        )
      );

      // If it was Hotspot #7 (Freezer lot), auto-mark freezer lot as deducted
      if (target.hotspotNumber === 7) {
        setFreezerLots((prev) =>
          prev.map((lot) =>
            lot.lotId === 'LV94' ? { ...lot, wmsStatus: 'Deducted' } : lot
          )
        );
      }

      // If Hotspot #2 (Blind line) or #1, update position netting
      if (target.hotspotNumber === 2 || target.hotspotNumber === 1) {
        setPositions((prev) =>
          prev.map((pos) =>
            pos.sku === target.sku ? { ...pos, status: 'reconciled' } : pos
          )
        );
      }

      // Increment supervisor approval count
      setSupervisors((prev) =>
        prev.map((s) =>
          s.name === supervisorName ? { ...s, activeApprovalsCount: s.activeApprovalsCount + 1 } : s
        )
      );

      playSuccessChime();
      showToast(`Approved ${target.id} · Applied fix to ${target.plantLine} (${supervisorName})`);
    },
    [reconciliationItems, showToast]
  );

  const handleDismissItem = useCallback(
    (id: string) => {
      setReconciliationItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'dismissed' } : item))
      );
      playTactileTick();
      showToast(`Dismissed mismatch ${id}`);
    },
    [showToast]
  );

  const handleDeductFreezerLot = useCallback(
    (lotId: string) => {
      setFreezerLots((prev) =>
        prev.map((l) => (l.lotId === lotId ? { ...l, wmsStatus: 'Deducted' } : l))
      );
      playSuccessChime();
      showToast(`Executed WMS deduction for Lot ${lotId}`);
    },
    [showToast]
  );

  const handleRetryOdiTransaction = useCallback(
    (id: string) => {
      setOdiTransactions((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, oracleStatus: 'delivered', latencyMinutes: 10 } : t
        )
      );
      playTactileTick();
      showToast(`Re-pushed ODI batch for ${id} to Oracle Cloud`);
    },
    [showToast]
  );

  const handleAddManualItem = useCallback(
    (newItem: ReconciliationItem) => {
      setReconciliationItems((prev) => [newItem, ...prev]);
      playSuccessChime();
      showToast(`Logged manual variance ${newItem.id} for ${newItem.sku}`);
    },
    [showToast]
  );

  const handleAddHandoffLog = useCallback(
    (newLog: ShiftHandoffLog) => {
      setHandoffLogs((prev) => [newLog, ...prev]);
      playSuccessChime();
      showToast(`Committed Shift Handover ${newLog.id}`);
    },
    [showToast]
  );

  const unresolvedCount = reconciliationItems.filter((i) => i.status === 'pending_approval').length;

  return (
    <div
      className={`${
        theme === 'dark'
          ? 'dark theme-dark bg-[#090a0f] text-zinc-100'
          : 'theme-light bg-[#f8fafc] text-zinc-900'
      } min-h-screen flex flex-col font-sans transition-colors duration-150 relative`}
    >
      {/* Scroll Depth Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-zinc-900 dark:bg-white z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Unified Single Navigation Bar (Zero Clutter) */}
      <TopBar
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenNewScanModal={() => setIsNewScanModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        unresolvedCount={unresolvedCount}
        currentShift={currentShift}
        onSelectShift={(shift) => {
          setCurrentShift(shift);
          const firstSup = supervisors.find((s) => s.shift === shift);
          if (firstSup) setCurrentSupervisor(firstSup.name);
          showToast(`Shift set to ${shift.split(' ')[0]}`);
        }}
        currentSupervisor={currentSupervisor}
        onSelectSupervisor={(name) => {
          setCurrentSupervisor(name);
          showToast(`Active supervisor: ${name}`);
        }}
        isLiveStreaming={isLiveStreaming}
        onToggleLiveStream={() => setIsLiveStreaming((p) => !p)}
        lastSyncTime={lastSyncTime}
        isSyncing={isSyncing}
        onRefresh={handleRefresh}
      />

      {/* Main Viewport with AnimatePresence Page Transition */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {currentView === 'topology' && (
              <TopologyView
                onSelectHotspot={(num) => {
                  setSelectedHotspotFilter(num);
                  setCurrentView('reconciliation');
                }}
                onNavigateToRecon={() => setCurrentView('reconciliation')}
                onApproveItem={(item, supervisor) =>
                  handleApproveItem(item.id, supervisor, currentShift)
                }
                unresolvedCount={unresolvedCount}
                items={reconciliationItems}
                currentSupervisor={currentSupervisor}
              />
            )}

            {currentView === 'reconciliation' && (
              <ReconciliationQueueView
                items={reconciliationItems}
                selectedHotspotFilter={selectedHotspotFilter}
                onSetHotspotFilter={setSelectedHotspotFilter}
                onApproveItem={handleApproveItem}
                onDismissItem={handleDismissItem}
                currentSupervisor={currentSupervisor}
                currentShift={currentShift}
              />
            )}

            {currentView === 'consolidate' && (
              <ConsolidatePositionView positions={positions} />
            )}

            {currentView === 'freezer' && (
              <FreezerLotTrackerView
                lots={freezerLots}
                onDeductLot={handleDeductFreezerLot}
              />
            )}

            {currentView === 'odi_sync' && (
              <OdiInterfaceMonitorView
                transactions={odiTransactions}
                onRetryTransaction={handleRetryOdiTransaction}
              />
            )}

            {currentView === 'handoff' && (
              <ShiftHandoffView
                supervisors={supervisors}
                handoffLogs={handoffLogs}
                onAddHandoffLog={handleAddHandoffLog}
                currentSupervisor={currentSupervisor}
                onSelectCurrentSupervisor={(name, shift) => {
                  setCurrentSupervisor(name);
                  setCurrentShift(shift);
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Scroll to Top Action Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 12 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            title="Scroll to top"
            aria-label="Scroll back to top of dashboard"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-zinc-700/50 dark:border-zinc-300"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(view) => setCurrentView(view)}
        items={reconciliationItems}
        positions={positions}
      />

      {/* New Manual Scan Variance Entry Modal */}
      <NewEntryModal
        isOpen={isNewScanModalOpen}
        onClose={() => setIsNewScanModalOpen(false)}
        onAddEntry={handleAddManualItem}
        currentSupervisor={currentSupervisor}
        currentShift={currentShift}
      />
    </div>
  );
}
