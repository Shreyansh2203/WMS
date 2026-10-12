import React, { useState } from 'react';
import { ReconciliationItem, HotspotNumber } from '../types';
import { X, Check, AlertTriangle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playSuccessChime, playTactileTick } from '../utils/audio';

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddManualItem?: (item: ReconciliationItem) => void;
  onAddEntry?: (item: ReconciliationItem) => void;
  currentSupervisor: string;
  currentShift: string;
}

export const NewEntryModal: React.FC<NewEntryModalProps> = ({
  isOpen,
  onClose,
  onAddManualItem,
  onAddEntry,
  currentSupervisor,
  currentShift,
}) => {
  const [sku, setSku] = useState('SKU-74398');
  const [skuName, setSkuName] = useState('Classic Vanilla Family Pack 48oz');
  const [hotspotNumber, setHotspotNumber] = useState<HotspotNumber>(5);
  const [plantLine, setPlantLine] = useState('Line 2 (Filling)');
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
      proposedAction: 'Adjust scheduled run balance down by 204 units in MIPS.',
      affectedSystems: ['MIPS', 'WMS'],
      detectedAt: 'Just now',
    };

    playSuccessChime();
    if (onAddEntry) onAddEntry(newItem);
    else if (onAddManualItem) onAddManualItem(newItem);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-2xs"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-lg rounded-xl bg-white dark:bg-[#14161b] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-zinc-900 dark:text-zinc-100 z-10 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white">
                    Simulate Pallet Scan / Log Variance
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Log an ad-hoc floor variance for supervisor approval
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 mb-1 font-semibold">SKU Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 mb-1 font-semibold">Plant Line</label>
                  <select
                    value={plantLine}
                    onChange={(e) => setPlantLine(e.target.value)}
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    <option value="Line 1 (Bulk Packaging)">Line 1 (Bulk)</option>
                    <option value="Line 2 (Filling)">Line 2 (Filling)</option>
                    <option value="Line 3 (Pints)">Line 3 (Pints)</option>
                    <option value="Line 4 (Novelties)">Line 4 (Novelties)</option>
                    <option value="Line 5 (Palletizer)">Line 5 (Palletizer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1 font-semibold">Product Name</label>
                <input
                  type="text"
                  value={skuName}
                  onChange={(e) => setSkuName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 mb-1 font-semibold">Operational Zone</label>
                  <select
                    value={hotspotNumber}
                    onChange={(e) => setHotspotNumber(Number(e.target.value) as HotspotNumber)}
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    <option value={1}>Zone 1: Multi-order lines</option>
                    <option value={2}>Zone 2: Blind / zero-qty line</option>
                    <option value={3}>Zone 3: Moved production run</option>
                    <option value={4}>Zone 4: Recovery run excess</option>
                    <option value={5}>Zone 5: Dock returns unnetted</option>
                    <option value={6}>Zone 6: Stale terminal cache</option>
                    <option value={7}>Zone 7: Freezer lot consumption</option>
                    <option value={8}>Zone 8: Oracle ODI batch lag</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-500 mb-1 font-semibold">WMS Scanned Count</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1 font-semibold">Supervisor Floor Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold rounded-lg shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-100"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
