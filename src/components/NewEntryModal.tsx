import React, { useState } from 'react';
import { ReconciliationItem, HotspotNumber } from '../types';
import { X, Check } from 'lucide-react';

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

    const parsed = parseInt(quantity.trim(), 10);
    const parsedQty = !isNaN(parsed) && parsed > 0 ? Math.min(parsed, 1_000_000) : 500;
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

    const uniqueSuffix = Date.now().toString().slice(-4);
    const newItem: ReconciliationItem = {
      id: `REC-${uniqueSuffix}`,
      hotspotNumber,
      hotspotTitle: titles[hotspotNumber],
      sku: sku.trim().toUpperCase(),
      skuName: skuName.trim(),
      plantLine,
      runNumber: `RUN-${uniqueSuffix}`,
      workOrder: `WO-89${uniqueSuffix}`,
      salesDate: new Date().toISOString().slice(0, 10),
      mipsQty: parsedQty + 204,
      wmsQty: parsedQty,
      varianceQty: -204,
      unnecessaryProductionRiskQty: 204,
      financialImpact: Math.round(parsedQty * 3.5),
      status: 'pending_approval',
      aiRecommendation: `${sku}: Manual discrepancy recorded by ${currentSupervisor}. Adjusted scheduled requirement.`,
      proposedAction: 'Adjust scheduled run balance down in MIPS.',
      affectedSystems: ['MIPS', 'WMS'],
      detectedAt: 'Just now',
    };

    if (onAddEntry) onAddEntry(newItem);
    else if (onAddManualItem) onAddManualItem(newItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-2xl p-5 text-slate-900 dark:text-slate-100 z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1a2336]">
          <div>
            <span className="text-[11px] font-mono text-slate-400">Log Manual Production Discrepancy</span>
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
              Record Variance Entry
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 mb-1 font-mono text-[11px]">SKU Number</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full p-2 rounded border border-slate-200/90 dark:border-[#1a2336] bg-slate-50 dark:bg-[#121725] text-slate-900 dark:text-white font-mono focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                placeholder="e.g. SKU-74398"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-mono text-[11px]">Plant Line</label>
              <select
                value={plantLine}
                onChange={(e) => setPlantLine(e.target.value)}
                className="w-full p-2 rounded border border-slate-200/90 dark:border-[#1a2336] bg-slate-50 dark:bg-[#121725] text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Line 1 (Bulk Tub)">Line 1 (Bulk Tub)</option>
                <option value="Line 2 (Filling)">Line 2 (Filling)</option>
                <option value="Line 3 (Novelty Sandwiches)">Line 3 (Novelty)</option>
                <option value="Line 4 (Cups & Cones)">Line 4 (Cups & Cones)</option>
                <option value="Line 5 (Pints High-Speed)">Line 5 (Pints)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 mb-1 font-mono text-[11px]">SKU Description</label>
            <input
              type="text"
              value={skuName}
              onChange={(e) => setSkuName(e.target.value)}
              className="w-full p-2 rounded border border-slate-200/90 dark:border-[#1a2336] bg-slate-50 dark:bg-[#121725] text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
              placeholder="e.g. Classic Vanilla Family Pack 48oz"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 mb-1 font-mono text-[11px]">Operational Zone</label>
              <select
                value={hotspotNumber}
                onChange={(e) => setHotspotNumber(Number(e.target.value) as HotspotNumber)}
                className="w-full p-2 rounded border border-slate-200/90 dark:border-[#1a2336] bg-slate-50 dark:bg-[#121725] text-slate-900 dark:text-white focus:outline-none"
              >
                <option value={1}>Zone 1: Multi-order lines</option>
                <option value={2}>Zone 2: Blind / zero-qty line</option>
                <option value={3}>Zone 3: Moved run</option>
                <option value={4}>Zone 4: Recovery run</option>
                <option value={5}>Zone 5: Returned pallet unnetted</option>
                <option value={6}>Zone 6: Stale workstation</option>
                <option value={7}>Zone 7: Freezer ghost lot</option>
                <option value={8}>Zone 8: Downstream sync gap</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-mono text-[11px]">Physical WMS Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-2 rounded border border-slate-200/90 dark:border-[#1a2336] bg-slate-50 dark:bg-[#121725] text-slate-900 dark:text-white font-mono focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                placeholder="816"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 mb-1 font-mono text-[11px]">Diagnostic Context</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded border border-slate-200/90 dark:border-[#1a2336] bg-slate-50 dark:bg-[#121725] text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-[#1a2336]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-medium rounded hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Record Discrepancy</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
