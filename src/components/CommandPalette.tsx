import React, { useState, useEffect, useMemo } from 'react';
import { DashboardView, HotspotNumber, ReconciliationItem, ConsolidatedPosition } from '../types';
import { Search, LayoutDashboard, Layers, Archive, Snowflake, RefreshCw, Users, AlertTriangle, Check, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HOTSPOT_METADATA } from '../data/mockData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: DashboardView) => void;
  onSelectView?: (view: DashboardView) => void;
  onSelectHotspotFilter?: (h: HotspotNumber) => void;
  onOpenSimulation?: () => void;
  items: ReconciliationItem[];
  positions?: ConsolidatedPosition[];
  onTriggerSync?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectView,
  onSelectHotspotFilter,
  onOpenSimulation,
  items,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const goToView = (view: DashboardView) => {
    if (onNavigate) onNavigate(view);
    else if (onSelectView) onSelectView(view);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const commandItems = useMemo(() => {
    const q = query.toLowerCase().trim();

    const viewItems = [
      { id: 'v-wms', category: 'Navigation', label: 'WMS · Warehouse Management & Cold Storage', icon: Archive, action: () => goToView('wms') },
      { id: 'v-buss', category: 'Navigation', label: 'BUSS · Order Scheduling & Allocation', icon: Layers, action: () => goToView('buss') },
      { id: 'v-mips', category: 'Navigation', label: 'MIPS · Shop Floor Execution & Telemetry', icon: LayoutDashboard, action: () => goToView('mips') },
      { id: 'v-oracle', category: 'Navigation', label: 'Oracle Cloud + ODI · Enterprise ERP & Pipeline', icon: RefreshCw, action: () => goToView('oracle_odi') },
      { id: 'v-topo', category: 'Navigation', label: 'Facility Topology Overview', icon: LayoutDashboard, action: () => goToView('topology') },
      { id: 'v-recon', category: 'Navigation', label: 'Incident & Reconciliation Queue', icon: Layers, action: () => goToView('reconciliation') },
      { id: 'v-handoff', category: 'Navigation', label: 'Shift Handover & Supervisory Roster', icon: Users, action: () => goToView('handoff') },
      {
        id: 'v-sim',
        category: 'Simulation',
        label: 'Plant Operational Stress Simulator · Inject Fault Scenarios',
        icon: Zap,
        action: () => {
          if (onOpenSimulation) onOpenSimulation();
          onClose();
        },
      },
    ];

    const hotspotItems = [1, 2, 3, 4, 5, 6, 7, 8].map((num) => ({
      id: `hs-${num}`,
      category: 'Filter Zone',
      label: `Zone #${num}: ${HOTSPOT_METADATA[num as HotspotNumber].title}`,
      icon: AlertTriangle,
      action: () => {
        if (onSelectHotspotFilter) onSelectHotspotFilter(num as HotspotNumber);
        goToView('reconciliation');
      },
    }));

    const skuItems = items.map((item) => ({
      id: `rec-${item.id}`,
      category: 'Variance Item',
      label: `${item.sku} · ${item.skuName} (${item.plantLine})`,
      icon: Check,
      action: () => {
        if (onSelectHotspotFilter) onSelectHotspotFilter(item.hotspotNumber);
        goToView('reconciliation');
      },
    }));

    const all = [...viewItems, ...hotspotItems, ...skuItems];
    if (!q) return all;
    return all.filter((i) => i.label.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [query, onSelectHotspotFilter, items]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (commandItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + commandItems.length) % (commandItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (commandItems[selectedIndex]) {
        commandItems[selectedIndex].action();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex items-start justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl rounded-xl bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 z-10"
            onKeyDown={handleKeyDownList}
          >
            {/* Search Input Bar */}
            <div className="flex items-center border-b border-slate-100 dark:border-[#1a2336] px-4 py-3">
              <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to view, SKU, or operational zone..."
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-sans"
              />
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                <kbd className="font-mono bg-slate-100 dark:bg-[#121725] px-1.5 py-0.5 rounded text-[10px]">ESC</kbd>
              </button>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {commandItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No matching results found for "{query}".
                </div>
              ) : (
                commandItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                        isSelected
                          ? 'bg-slate-100 dark:bg-[#151c2c] text-slate-950 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#121725]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 uppercase tracking-wider font-mono">
                        {item.category}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
