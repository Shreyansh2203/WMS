import React, { useState, useEffect, useCallback } from 'react';
import {
  Theme,
  DensityMode,
  DashboardView,
  HotspotNumber,
  ReconciliationItem,
  ConsolidatedPosition,
  FreezerLot,
  OdiTransaction,
  Supervisor,
  ShiftHandoffLog,
  WmsBayStatus,
  BussSalesOrder,
  MipsLineStatus,
  OdiPipelineStage,
} from './types';
import {
  INITIAL_RECONCILIATION_ITEMS,
  CONSOLIDATED_POSITIONS,
  FREEZER_GHOST_LOTS,
  ODI_TRANSACTIONS,
  SUPERVISORS_ROSTER,
  SHIFT_HANDOFF_LOGS,
  WMS_BAYS,
  BUSS_ORDERS,
  MIPS_LINES,
  ODI_PIPELINE_STAGES,
} from './data/mockData';
import { TopBar } from './components/TopBar';
import { MetricExplorer } from './components/MetricExplorer';
import { WmsView } from './components/views/WmsView';
import { BussView } from './components/views/BussView';
import { MipsView } from './components/views/MipsView';
import { OracleCloudOdiView } from './components/views/OracleCloudOdiView';
import { TopologyView } from './components/views/TopologyView';
import { ReconciliationQueueView } from './components/views/ReconciliationQueueView';
import { ConsolidatePositionView } from './components/views/ConsolidatePositionView';
import { FreezerLotTrackerView } from './components/views/FreezerLotTrackerView';
import { OdiInterfaceMonitorView } from './components/views/OdiInterfaceMonitorView';
import { ShiftHandoffView } from './components/views/ShiftHandoffView';
import { CommandPalette } from './components/CommandPalette';
import { NewEntryModal } from './components/NewEntryModal';
import { SimulationModal } from './components/SimulationModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ArrowUp, CheckCircle2, Keyboard, X, WifiOff, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { playSuccessChime, playTactileTick } from './utils/audio';

export default function App() {
  // Default to the first requested tab: WMS
  const [currentView, setCurrentView] = useState<DashboardView>('wms');
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('strata_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  const [density, setDensity] = useState<DensityMode>(() => {
    try {
      const saved = localStorage.getItem('strata_density');
      if (saved === 'compact' || saved === 'comfortable') return saved;
    } catch {}
    return 'comfortable';
  });

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  // Network Connectivity Monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enterprise Systems Data State
  const [wmsBays, setWmsBays] = useState<WmsBayStatus[]>(WMS_BAYS);
  const [freezerLots, setFreezerLots] = useState<FreezerLot[]>(FREEZER_GHOST_LOTS);
  const [bussOrders, setBussOrders] = useState<BussSalesOrder[]>(BUSS_ORDERS);
  const [mipsLines, setMipsLines] = useState<MipsLineStatus[]>(MIPS_LINES);
  const [odiTransactions, setOdiTransactions] = useState<OdiTransaction[]>(ODI_TRANSACTIONS);
  const [odiPipelineStages, setOdiPipelineStages] = useState<OdiPipelineStage[]>(ODI_PIPELINE_STAGES);

  // Plant Discrepancy & Reconciliation State
  const [reconciliationItems, setReconciliationItems] = useState<ReconciliationItem[]>(INITIAL_RECONCILIATION_ITEMS);
  const [positions, setPositions] = useState<ConsolidatedPosition[]>(CONSOLIDATED_POSITIONS);
  const [supervisors, setSupervisors] = useState<Supervisor[]>(SUPERVISORS_ROSTER);
  const [handoffLogs, setHandoffLogs] = useState<ShiftHandoffLog[]>(SHIFT_HANDOFF_LOGS);

  // Active Supervisory Session (3 shifts · 11 leads)
  const [currentSupervisor, setCurrentSupervisor] = useState<string>('Dave Miller');
  const [currentShift, setCurrentShift] = useState<string>('Shift 1 (06:00 - 14:00)');
  const [selectedHotspotFilter, setSelectedHotspotFilter] = useState<HotspotNumber | 'all'>('all');

  // Modals & Panels
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewScanModalOpen, setIsNewScanModalOpen] = useState(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);

  // Pipeline telemetry
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('23:05:12 UTC');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scroll depth tracking & back to top
  const { scrollY, scrollYProgress } = useScroll();
  useSpring(scrollYProgress, { stiffness: 400, damping: 30, restDelta: 0.001 });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setShowScrollTop(latest > 280);
    });
  }, [scrollY]);

  const scrollToTop = () => {
    if (isSoundEnabled) playTactileTick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Visibility-Aware Live Telemetry Stream
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      // Pause ticker updates when window tab is inactive to preserve CPU & power
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;

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

  const toggleDensity = useCallback(() => {
    setDensity((prev) => {
      const next = prev === 'comfortable' ? 'compact' : 'comfortable';
      try {
        localStorage.setItem('strata_density', next);
      } catch {}
      return next;
    });
    if (isSoundEnabled) playTactileTick();
    showToast(`Display density set to ${density === 'comfortable' ? 'Compact' : 'Comfortable'}`);
  }, [density, isSoundEnabled, showToast]);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      if (next) playSuccessChime();
      return next;
    });
    showToast(isSoundEnabled ? 'Audio feedback muted' : 'Audio feedback enabled');
  }, [isSoundEnabled, showToast]);

  const handleResetToBaseline = useCallback(() => {
    setWmsBays(WMS_BAYS);
    setFreezerLots(FREEZER_GHOST_LOTS);
    setBussOrders(BUSS_ORDERS);
    setMipsLines(MIPS_LINES);
    setOdiTransactions(ODI_TRANSACTIONS);
    setOdiPipelineStages(ODI_PIPELINE_STAGES);
    setReconciliationItems(INITIAL_RECONCILIATION_ITEMS);
    setPositions(CONSOLIDATED_POSITIONS);
    if (isSoundEnabled) playSuccessChime();
    showToast('Reset plant operational data to factory baseline');
  }, [isSoundEnabled, showToast]);

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

      if (e.key === '1') setCurrentView('wms');
      if (e.key === '2') setCurrentView('buss');
      if (e.key === '3') setCurrentView('mips');
      if (e.key === '4') setCurrentView('oracle_odi');
      if (e.key === '5') setCurrentView('topology');
      if (e.key === '6') setCurrentView('reconciliation');
      if (e.key === '7') setCurrentView('handoff');
      if (e.key.toLowerCase() === 'd') toggleDensity();
      if (e.key.toLowerCase() === 'm') toggleSound();
      if (e.key.toLowerCase() === 's') setIsSimulationModalOpen((p) => !p);
      if (e.key === '?' || e.key.toLowerCase() === 'h') setIsHelpModalOpen((p) => !p);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDensity, toggleSound]);

  const handleRefresh = useCallback(() => {
    setIsSyncing(true);
    if (isSoundEnabled) playTactileTick();
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      setLastSyncTime(
        `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(
          2,
          '0'
        )}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`
      );
      showToast('WMS, BUSS, MIPS, and Oracle ODI synchronized');
    }, 600);
  }, [showToast, isSoundEnabled]);

  // Action Handlers with Cross-System Cascade
  const handleDeductFreezerLot = useCallback(
    (lotId: string) => {
      setFreezerLots((prev) =>
        prev.map((l) => (l.lotId === lotId ? { ...l, wmsStatus: 'Deducted' } : l))
      );
      // Auto-reconcile Hotspot #7
      setReconciliationItems((prev) =>
        prev.map((item) =>
          item.hotspotNumber === 7 ? { ...item, status: 'approved_executed', approvedBy: currentSupervisor } : item
        )
      );
      // If all freezer lots cleared, normalize Cold Storage Bay status
      setWmsBays((prev) =>
        prev.map((bay) =>
          bay.bayId === 'BAY-FREEZER-B'
            ? { ...bay, status: 'nominal', activeGhostLots: Math.max(0, (bay.activeGhostLots || 3) - 1) }
            : bay
        )
      );
      if (isSoundEnabled) playSuccessChime();
      showToast(`Executed WMS deduction for Lot ${lotId}`);
    },
    [showToast, currentSupervisor, isSoundEnabled]
  );

  const handleRebalanceOrderAllocation = useCallback(
    (orderId1: string, orderId2: string) => {
      setBussOrders((prev) =>
        prev.map((o) => {
          if (o.orderId === orderId1) {
            return { ...o, allocatedQty: 1000, status: 'allocated', conflictReason: undefined };
          }
          if (o.orderId === orderId2) {
            return { ...o, allocatedQty: 500, status: 'allocated', conflictReason: undefined };
          }
          return o;
        })
      );
      // Reconcile Hotspot #1
      setReconciliationItems((prev) =>
        prev.map((i) =>
          i.hotspotNumber === 1 ? { ...i, status: 'approved_executed', approvedBy: currentSupervisor } : i
        )
      );
      // Update position netting
      setPositions((prev) =>
        prev.map((pos) =>
          pos.sku === 'SKU-74398' ? { ...pos, status: 'reconciled', overproductionPrevented: 1500 } : pos
        )
      );
      if (isSoundEnabled) playSuccessChime();
      showToast(`Rebalanced inventory: 1,000 to ${orderId1} & 500 to ${orderId2}`);
    },
    [showToast, currentSupervisor, isSoundEnabled]
  );

  const handleReconcileBlindLine = useCallback(
    (lineId: string) => {
      setMipsLines((prev) =>
        prev.map((l) =>
          l.lineId === lineId
            ? { ...l, status: 'running', activeAlert: undefined, blindUnits: 0, plannedQty: 800 }
            : l
        )
      );
      // Reconcile Hotspot #2
      setReconciliationItems((prev) =>
        prev.map((i) =>
          i.hotspotNumber === 2 ? { ...i, status: 'approved_executed', approvedBy: currentSupervisor } : i
        )
      );
      // Update position netting
      setPositions((prev) =>
        prev.map((pos) =>
          pos.sku === 'SKU-74398' ? { ...pos, status: 'reconciled', overproductionPrevented: 1200 } : pos
        )
      );
      if (isSoundEnabled) playSuccessChime();
      showToast(`Reconciled Blind Line on ${lineId}: Re-applied 1,200 units to active work order`);
    },
    [showToast, currentSupervisor, isSoundEnabled]
  );

  const handleSyncWorkstation = useCallback(
    (lineId: string) => {
      setMipsLines((prev) =>
        prev.map((l) => (l.lineId === lineId ? { ...l, workstationSyncStatus: 'synced' } : l))
      );
      if (isSoundEnabled) playTactileTick();
      showToast(`Pushed WebSocket sync to workstation terminal on ${lineId}`);
    },
    [showToast, isSoundEnabled]
  );

  const handleRetryOdiTransaction = useCallback(
    (id: string) => {
      setOdiTransactions((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, oracleStatus: 'delivered', latencyMinutes: 8 } : t
        )
      );
      // If Stage 3 had error, mark resolved
      setOdiPipelineStages((prev) =>
        prev.map((s) => (s.stageId === 'STAGE-03' ? { ...s, status: 'active', errorCount: 0 } : s))
      );
      // Reconcile Hotspot #8
      setReconciliationItems((prev) =>
        prev.map((i) =>
          i.hotspotNumber === 8 ? { ...i, status: 'approved_executed', approvedBy: currentSupervisor } : i
        )
      );
      if (isSoundEnabled) playSuccessChime();
      showToast(`Re-pushed ODI batch for ${id} to Oracle Cloud ERP`);
    },
    [showToast, currentSupervisor, isSoundEnabled]
  );

  const handleTriggerFullPipelineSync = useCallback(() => {
    setIsSyncing(true);
    if (isSoundEnabled) playTactileTick();
    setTimeout(() => {
      setIsSyncing(false);
      setOdiPipelineStages((prev) =>
        prev.map((s) => ({ ...s, status: 'active', lastExecution: 'Just now', errorCount: 0 }))
      );
      setOdiTransactions((prev) =>
        prev.map((t) => ({ ...t, oracleStatus: 'delivered', latencyMinutes: 5 }))
      );
      showToast('All Oracle Cloud + ODI interface pipelines successfully executed');
    }, 1000);
  }, [showToast, isSoundEnabled]);

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

      // Cascade to Hotspot #7 (Freezer lot)
      if (target.hotspotNumber === 7) {
        setFreezerLots((prev) =>
          prev.map((lot) =>
            lot.lotId === 'LV94' ? { ...lot, wmsStatus: 'Deducted' } : lot
          )
        );
      }

      // Cascade to Hotspot #2 (Blind line)
      if (target.hotspotNumber === 2) {
        setMipsLines((prev) =>
          prev.map((l) =>
            l.lineId === 'LINE-02' ? { ...l, status: 'running', activeAlert: undefined, blindUnits: 0, plannedQty: 800 } : l
          )
        );
      }

      // Cascade to Hotspot #1 (Multi-order line)
      if (target.hotspotNumber === 1) {
        setBussOrders((prev) =>
          prev.map((o) =>
            o.sku === 'SKU-51940' ? { ...o, status: 'allocated' } : o
          )
        );
      }

      // Increment supervisor approval count
      setSupervisors((prev) =>
        prev.map((s) =>
          s.name === supervisorName ? { ...s, activeApprovalsCount: s.activeApprovalsCount + 1 } : s
        )
      );

      if (isSoundEnabled) playSuccessChime();
      showToast(`Approved ${target.id} · Applied fix (${supervisorName})`);
    },
    [reconciliationItems, showToast, isSoundEnabled]
  );

  const handleDismissItem = useCallback(
    (id: string) => {
      setReconciliationItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'dismissed' } : item))
      );
      if (isSoundEnabled) playTactileTick();
      showToast(`Dismissed mismatch ${id}`);
    },
    [showToast, isSoundEnabled]
  );

  const handleAddManualItem = useCallback(
    (newItem: ReconciliationItem) => {
      setReconciliationItems((prev) => [newItem, ...prev]);
      if (isSoundEnabled) playSuccessChime();
      showToast(`Logged manual incident ${newItem.id} for ${newItem.sku}`);
    },
    [showToast, isSoundEnabled]
  );

  const handleAddHandoffLog = useCallback(
    (newLog: ShiftHandoffLog) => {
      setHandoffLogs((prev) => [newLog, ...prev]);
      if (isSoundEnabled) playSuccessChime();
      showToast(`Committed Shift Handover ${newLog.id}`);
    },
    [showToast, isSoundEnabled]
  );

  // Simulation Scenario Fault Injections
  const handleApplySurgeOrder = useCallback(() => {
    const surgeOrder: BussSalesOrder = {
      orderId: 'SO-SURGE-99',
      customer: 'Walmart DC 6012',
      sku: 'SKU-74398',
      skuName: 'Classic Vanilla Family Pack 48oz',
      orderType: 'EXPEDITE',
      orderQty: 5000,
      allocatedQty: 0,
      scheduledLine: 'Line 2 (Filling)',
      shipDate: '2026-10-14',
      status: 'conflict_flagged',
      conflictReason: 'Emergency surge order exceeds on-hand scheduled capacity. Starves special-pack SP-4412.',
    };
    setBussOrders((prev) => [surgeOrder, ...prev]);
    const recItem: ReconciliationItem = {
      id: `REC-${Date.now().toString().slice(-4)}`,
      hotspotNumber: 1,
      hotspotTitle: 'Multiple order lines, same SKU',
      sku: 'SKU-74398',
      skuName: 'Classic Vanilla Family Pack 48oz',
      plantLine: 'Line 2 (Filling)',
      runNumber: 'RUN-SURGE-01',
      workOrder: 'WO-SURGE-99',
      salesDate: '2026-10-12',
      mipsQty: 5000,
      wmsQty: 1500,
      varianceQty: -3500,
      unnecessaryProductionRiskQty: 3500,
      financialImpact: 18400,
      status: 'pending_approval',
      aiRecommendation: 'Walmart surge order of 5,000 units requires immediate dynamic demand re-distribution.',
      proposedAction: 'Split allocation across Line 2 and queue recovery run.',
      affectedSystems: ['BUSS', 'MIPS', 'WMS'],
      detectedAt: 'Just now',
    };
    setReconciliationItems((prev) => [recItem, ...prev]);
    if (isSoundEnabled) playTactileTick();
    showToast('Injected: Walmart 5,000 unit emergency surge order');
  }, [isSoundEnabled, showToast]);

  const handleApplyFreezerExcursion = useCallback(() => {
    setWmsBays((prev) =>
      prev.map((b) =>
        b.bayId === 'BAY-FREEZER-B'
          ? { ...b, temperature: '-4.2°F', status: 'ghost_inventory_flagged', activeGhostLots: 7 }
          : b
      )
    );
    const emergencyLots: FreezerLot[] = [
      {
        lotId: 'LV104',
        sku: 'SKU-74398',
        description: 'Classic Vanilla Family Pack 48oz',
        quantity: 1400,
        usedDate: '2026-10-12',
        movedFromLine: 'Line 2',
        movedToLine: 'Bay F-14 Emergency Cold Stage',
        wmsStatus: 'Ghost - Pending Deduction',
        impactNote: 'Evaporator compressor trip forced rapid pallet evacuation without RF scanner deduction.',
      },
      {
        lotId: 'LV108',
        sku: 'SKU-90214',
        description: 'Chocolate Fudge Ripple Pint',
        quantity: 980,
        usedDate: '2026-10-12',
        movedFromLine: 'Line 5',
        movedToLine: 'Bay F-14 Emergency Cold Stage',
        wmsStatus: 'Ghost - Pending Deduction',
        impactNote: 'Secondary blast freezer transfer unacknowledged by handheld terminal.',
      },
    ];
    setFreezerLots((prev) => [...emergencyLots, ...prev]);
    if (isSoundEnabled) playTactileTick();
    showToast('Injected: Blast Freezer Bay F-14 thermal excursion (-4.2°F)');
  }, [isSoundEnabled, showToast]);

  const handleApplyOdiThrottle = useCallback(() => {
    setOdiPipelineStages((prev) =>
      prev.map((s) =>
        s.stageId === 'STAGE-03'
          ? { ...s, status: 'failed', latencySec: 2910, errorCount: 1 }
          : s
      )
    );
    const lagTx: OdiTransaction = {
      id: 'TX-LAG-99',
      ticketNumber: 'T-9999',
      sku: 'SKU-74398',
      qty: 4800,
      scannedAtWms: '2026-10-12 22:45 UTC',
      oracleStatus: 'lagging_sla',
      latencyMinutes: 48,
      errorDetail: 'ORA-00054: resource busy and acquire with NOWAIT specified during GL batch commit',
      stagingPayload: {
        RECORD_ID: 'TX-LAG-99',
        INVENTORY_ITEM_ID: 'ITEM-74398',
        ORGANIZATION_ID: 'LV-04',
        TRANSACTION_QUANTITY: 4800,
        TRANSACTION_UOM: 'CS',
        PROCESS_FLAG: '1',
      },
      erpPayload: {
        RECORD_ID: 'TX-LAG-99',
        INVENTORY_ITEM_ID: 'ITEM-74398',
        ORGANIZATION_ID: 'LV-04',
        TRANSACTION_QUANTITY: 0,
        TRANSACTION_UOM: 'CS',
        PROCESS_FLAG: '3 (LOCKED)',
      },
    };
    setOdiTransactions((prev) => [lagTx, ...prev]);
    if (isSoundEnabled) playTactileTick();
    showToast('Injected: Oracle Cloud ODI socket partition (48.5m latency)');
  }, [isSoundEnabled, showToast]);

  const handleApplyBlindLineJam = useCallback(() => {
    setMipsLines((prev) =>
      prev.map((l) =>
        l.lineId === 'LINE-02'
          ? {
              ...l,
              status: 'blind_line_alert',
              activeAlert: '1,200 finished units stranded on ghost planning line',
              blindUnits: 1200,
              workstationSyncStatus: 'stale_detected',
            }
          : l
      )
    );
    if (isSoundEnabled) playTactileTick();
    showToast('Injected: Line 2 packaging size switch disconnect');
  }, [isSoundEnabled, showToast]);

  const unresolvedCount = reconciliationItems.filter((i) => i.status === 'pending_approval').length;
  const ghostLotCount = freezerLots.filter((l) => l.wmsStatus === 'Ghost - Pending Deduction').length;
  const bussConflictCount = bussOrders.filter((o) => o.status === 'conflict_flagged' || o.status === 'pending_split').length;
  const mipsAlertCount = mipsLines.filter((l) => l.status === 'blind_line_alert' || l.workstationSyncStatus === 'stale_detected').length;
  const odiLaggingCount = odiTransactions.filter((t) => t.oracleStatus !== 'delivered').length;

  return (
    <ErrorBoundary>
      <div
        className={`${
          theme === 'dark'
            ? 'dark theme-dark bg-[#080a0f] text-[#f3f5f9]'
            : 'theme-light bg-[#f4f6f9] text-[#0c1017]'
        } min-h-screen flex flex-col font-sans transition-colors duration-150 relative`}
      >
        {/* Offline Network Warning Banner */}
        {!isOnline && (
          <div className="bg-rose-900 text-white text-xs py-1.5 px-4 font-mono flex items-center justify-center gap-2 border-b border-rose-800">
            <WifiOff className="w-3.5 h-3.5" />
            <span>PLANT NETWORK OFFLINE · Transactions queued locally in failover cache</span>
          </div>
        )}

        {/* Centralized IT Operations Navigation Bar */}
        <TopBar
          currentView={currentView}
          onSelectView={setCurrentView}
          onOpenNewScanModal={() => setIsNewScanModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenSimulation={() => setIsSimulationModalOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          density={density}
          onToggleDensity={toggleDensity}
          isSoundEnabled={isSoundEnabled}
          onToggleSound={toggleSound}
          onOpenHelp={() => setIsHelpModalOpen(true)}
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
          ghostLotCount={ghostLotCount}
          bussConflictCount={bussConflictCount}
          mipsAlertCount={mipsAlertCount}
          odiLaggingCount={odiLaggingCount}
        />

        {/* Main Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Executive KPI Metric Explorer (Morphs into Scrubbable Series Chart) */}
          <section aria-label="Executive Plant KPI Metric Explorer">
            <MetricExplorer
              onNavigateToSystem={(sys) => setCurrentView(sys)}
              isSoundEnabled={isSoundEnabled}
            />
          </section>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* 1. WMS Tab */}
              {currentView === 'wms' && (
                <WmsView
                  bays={wmsBays}
                  lots={freezerLots}
                  density={density}
                  onDeductLot={handleDeductFreezerLot}
                  onRefreshTelemetry={handleRefresh}
                />
              )}

              {/* 2. BUSS Tab */}
              {currentView === 'buss' && (
                <BussView
                  orders={bussOrders}
                  density={density}
                  onRebalanceOrderAllocation={handleRebalanceOrderAllocation}
                />
              )}

              {/* 3. MIPS Tab */}
              {currentView === 'mips' && (
                <MipsView
                  lines={mipsLines}
                  density={density}
                  onReconcileBlindLine={handleReconcileBlindLine}
                  onSyncWorkstation={handleSyncWorkstation}
                />
              )}

              {/* 4. Oracle Cloud + ODI Tab */}
              {currentView === 'oracle_odi' && (
                <OracleCloudOdiView
                  transactions={odiTransactions}
                  pipelineStages={odiPipelineStages}
                  density={density}
                  onRetryTransaction={handleRetryOdiTransaction}
                  onTriggerFullPipelineSync={handleTriggerFullPipelineSync}
                />
              )}

              {/* Secondary Cross-Plant Views */}
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
              className="fixed bottom-6 right-6 z-40 p-2.5 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
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
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700/50 dark:border-slate-300"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard Shortcuts & Help Dialog */}
        <AnimatePresence>
          {isHelpModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#0c1018] rounded-lg border border-slate-200 dark:border-[#1a2336] shadow-2xl max-w-md w-full p-6 text-left relative"
              >
                <button
                  onClick={() => setIsHelpModalOpen(false)}
                  className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
                  <Keyboard className="w-4 h-4 text-slate-400" />
                  <span>Operator Ergonomics</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Keyboard Shortcuts Cheatsheet
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Control room hotkeys for single-touch navigation</p>

                <div className="mt-4 space-y-2 text-xs">
                  {[
                    { key: '1', desc: 'WMS · Warehouse Management & Cold Storage' },
                    { key: '2', desc: 'BUSS · Demand Scheduling & Backlog' },
                    { key: '3', desc: 'MIPS · Plant Floor MES & Telemetry' },
                    { key: '4', desc: 'Oracle Cloud + ODI · ERP Sync Monitor' },
                    { key: '5', desc: 'Topology Overview & Hotspot Map' },
                    { key: '6', desc: 'Incident & Reconciliation Queue' },
                    { key: '7', desc: 'Shift Handover Console' },
                    { key: '⌘K / Ctrl+K', desc: 'Global Command Search' },
                    { key: 'D', desc: 'Toggle Density (Compact / Comfortable)' },
                    { key: 'M', desc: 'Toggle Audio Synthesizer Chimes' },
                    { key: 'S', desc: 'Plant Operational Stress Simulator Sandbox' },
                    { key: '? / H', desc: 'Open / Close this Cheatsheet' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#182132]">
                      <span className="text-slate-600 dark:text-slate-400">{item.desc}</span>
                      <kbd className="font-mono text-[11px] bg-slate-100 dark:bg-[#1a2336] px-2 py-0.5 rounded border border-slate-200 dark:border-[#222e47] text-slate-900 dark:text-white font-semibold">
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-[#1a2336] flex items-center justify-between">
                  <button
                    onClick={handleResetToBaseline}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    <span>Reset Data to Factory Baseline</span>
                  </button>

                  <button
                    onClick={() => setIsHelpModalOpen(false)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-950 rounded hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Command Palette */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigate={(view) => setCurrentView(view)}
          onOpenSimulation={() => setIsSimulationModalOpen(true)}
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

        {/* Plant Operational Fault & Stress-Test Simulation Sandbox */}
        <SimulationModal
          isOpen={isSimulationModalOpen}
          onClose={() => setIsSimulationModalOpen(false)}
          onApplySurgeOrder={handleApplySurgeOrder}
          onApplyFreezerExcursion={handleApplyFreezerExcursion}
          onApplyOdiThrottle={handleApplyOdiThrottle}
          onApplyBlindLineJam={handleApplyBlindLineJam}
          onResetFactoryBaseline={handleResetToBaseline}
          isSoundEnabled={isSoundEnabled}
        />
      </div>
    </ErrorBoundary>
  );
}
