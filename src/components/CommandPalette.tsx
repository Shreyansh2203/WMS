import React, { useState, useEffect, useMemo } from 'react';
import { DashboardView, HotspotNumber, ReconciliationItem } from '../types';
import { Search, LayoutDashboard, Cpu, Snowflake, Database, Users, AlertTriangle, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HOTSPOT_METADATA } from '../data/mockData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: DashboardView) => void;
  onSelectHotspotFilter: (h: HotspotNumber) => void;
  items: ReconciliationItem[];
  onTriggerSync: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onSelectHotspotFilter,
  items,
  onTriggerSync,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

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
      { id: 'v-topo', category: 'Navigation', label: 'Architecture & Hotspot Topology', icon: LayoutDashboard, action: () => onSelectView('topology') },
      { id: 'v-recon', category: 'Navigation', label: 'Reconciliation Queue & Approvals', icon: AlertTriangle, action: () => onSelectView('reconciliation') },
      { id: 'v-net', category: 'Navigation', label: 'Step 2: Position Netting Formula', icon: Cpu, action: () => onSelectView('consolidate') },
      { id: 'v-freezer', category: 'Navigation', label: 'Hotspot #7: Blast Freezer Ghost Lots', icon: Snowflake, action: () => onSelectView('freezer') },
      { id: 'v-odi', category: 'Navigation', label: 'Hotspot #8: WMS → Oracle ODI ~10m SLA', icon: Database, action: () => onSelectView('odi_sync') },
      { id: 'v-handoff', category: 'Navigation', label: '3 Shifts · 11 Supervisors Handoff Ledger', icon: Users, action: () => onSelectView('handoff') },
    ];

    const hotspotItems = [1, 2, 3, 4, 5, 6, 7, 8].map((num) => ({
      id: `hs-${num}`,
      category: 'Filter Hotspot',
      label: `Hotspot #${num}: ${HOTSPOT_METADATA[num].title}`,
      icon: AlertTriangle,
      action: () => {
        onSelectHotspotFilter(num as HotspotNumber);
        onSelectView('reconciliation');
      },
    }));

    const skuItems = items.map((item) => ({
      id: `rec-${item.id}`,
      category: 'Active Mismatch',
      label: `${item.sku} (${item.skuName}) · Hotspot #${item.hotspotNumber}`,
      icon: Check,
      action: () => {
        onSelectHotspotFilter(item.hotspotNumber);
        onSelectView('reconciliation');
      },
    }));

    const all = [...viewItems, ...hotspotItems, ...skuItems];
    if (!q) return all;
    return all.filter((i) => i.label.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [query, onSelectView, onSelectHotspotFilter, items]);

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
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto max-w-xl rounded-xl bg-white dark:bg-[#14161b] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100"
            onKeyDown={handleKeyDownList}
          >
            {/* Search Input Bar */}
            <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
              <Search className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search SKU, Hotspots 1–8, Freezer lot..."
                className="w-full bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none font-sans"
              />
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-zinc-800/40">
              {commandItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  No matching plant commands found for "{query}"
                </div>
              ) : (
                commandItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-left transition-colors ${
                        isSelected
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-inherit' : 'text-zinc-400'}`} />
                        <span className="font-medium truncate">{item.label}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono ${
                          isSelected ? 'opacity-80' : 'text-zinc-400 dark:text-zinc-500'
                        }`}
                      >
                        {item.category}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 px-4 py-2 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Dismiss</span>
              </div>
              <span>Lehigh Valley Plant Console</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
