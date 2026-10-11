import React, { useState } from 'react';
import { ReconciliationItem, HotspotNumber } from '../types';
import { X, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddManualItem: (item: ReconciliationItem) => void;
  currentSupervisor: string;
  currentShift: string;
}

export const NewEntryModal: React.FC<NewEntryModalProps> = ({
  isOpen,
  onClose,
  onAddManualItem,
  currentSupervisor,
  currentShift,
}) => {
  const [sku, setSku] = useState('SKU-74398');
  const [skuName, setSkuName] = useState('Classic Vanilla Family Pack 48oz');
  const [hotspotNumber, setHotspotNumber] = useState<HotspotNumber>(5);
  const [plantLine, setPlantLine] = useState('Line 2');
  const [quantity, setQuantity] = useState('816');
  const [notes, setNotes] = useState('Returned pallet re-scanned at dock staging; netting from scheduled demand.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !quantity) return;

    const parsedQty = parseInt(quantity, 10) || 500;
    const titles: Record<HotspotNumber, string> = {
      1: 'Multiple order lines, same SKU',
      2: 'Zero-quantity / "blind" line',
      3: 'Moved production run',
      4: 'Recovery / second run',
      5: 'Returned-to-plant not netted',
      6: 'Stale workstation data',
      7: 'Freezer inventory not deducted',
      8: 'Missing downstream transactions',
    };

    const newItem: ReconciliationItem = {
      id: `REC-${Math.floor(1090 + Math.random() * 100)}`,
      hotspotNumber,
      hotspotTitle: titles[hotspotNumber],
      sku: sku.trim(),
      skuName: skuName.trim(),
      plantLine,
      runNumber: `RUN-${Math.floor(4430 + Math.random() * 50)}`,
      workOrder: `WO-${Math.floor(89300 + Math.random() * 500)}`,
      salesDate: new Date().toISOString().slice(0, 10),
      mipsQty: parsedQty + 204,
      wmsQty: parsedQty,
      varianceQty: -204,
      unnecessaryProductionRiskQty: 204,
      financialImpact: Math.round(parsedQty * 3.5),
      status: 'pending_approval',
      aiRecommendation: `${sku}: Manual ticket discrepancy entered by ${currentSupervisor}. Review and adjust MIPS net requirements.`,
      proposedAction: notes,
      affectedSystems: ['MIPS', 'WMS'],
      detectedAt: 'Just now',
    };

    onAddManualItem(newItem);
    onClose();
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
            className="relative mx-auto max-w-lg rounded-xl bg-white dark:bg-[#14161b] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-6 py-4">
              <div>
                <h2 className="text-base font-bold font-display text-zinc-900 dark:text-white">
                  Manual Ticket Issue / Reconciliation Entry
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Record plant floor variance for supervisory sign-off ({currentSupervisor} · {currentShift}).
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                    Plant Line
                  </label>
                  <select
                    value={plantLine}
                    onChange={(e) => setPlantLine(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-white"
                  >
                    <option value="Line 1">Line 1 (Bulk)</option>
                    <option value="Line 2">Line 2 (Filling)</option>
                    <option value="Line 3">Line 3 (Carton)</option>
                    <option value="Line 4">Line 4 (Multipack)</option>
                    <option value="Freezer Sub-Inv B">Freezer Sub-Inv B</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  required
                  value={skuName}
                  onChange={(e) => setSkuName(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                    Mismatch Hotspot Category
                  </label>
                  <select
                    value={hotspotNumber}
                    onChange={(e) => setHotspotNumber(Number(e.target.value) as HotspotNumber)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-white"
                  >
                    <option value={1}>#1 Multiple order lines, same SKU</option>
                    <option value={2}>#2 Zero-quantity / "blind" line</option>
                    <option value={3}>#3 Moved production run</option>
                    <option value={4}>#4 Recovery / second run</option>
                    <option value={5}>#5 Returned-to-plant not netted</option>
                    <option value={6}>#6 Stale workstation data</option>
                    <option value={7}>#7 Freezer inventory not deducted</option>
                    <option value={8}>#8 Missing downstream transactions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                    Reconciled Quantity
                  </label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                  Supervisor Action Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white font-medium rounded-md shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Submit for Supervisor Sign-off</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
