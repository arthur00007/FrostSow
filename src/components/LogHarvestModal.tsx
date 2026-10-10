import React, { useState } from 'react';
import { GardenBed, GardenBedPlant, Plant } from '../types/garden';
import { PLANTS } from '../data/plants';
import { getEstimatedHarvestWeight } from '../utils/harvestYieldUtils';
import { X, Scale, Calendar, Check, Sprout } from 'lucide-react';

interface LogHarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  beds: GardenBed[];
  // If harvesting a specific planting
  targetBedId?: string;
  targetPlanting?: GardenBedPlant | null;
  onConfirmHarvest: (
    bedId: string,
    plantEntryId: string | null,
    harvestDetails: {
      plantId: string;
      plantName: string;
      category: GardenBedPlant['category'];
      weightLbs: number;
      harvestDate: string;
      count?: number;
      notes?: string;
    }
  ) => void;
}

export const LogHarvestModal: React.FC<LogHarvestModalProps> = ({
  isOpen,
  onClose,
  beds,
  targetBedId,
  targetPlanting,
  onConfirmHarvest,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Initial states
  const initialBedId = targetBedId || (beds.length > 0 ? beds[0].id : '');
  const [selectedBedId, setSelectedBedId] = useState<string>(initialBedId);

  // If target planting was provided, use it; else select from available plants or catalog
  const [selectedPlantId, setSelectedPlantId] = useState<string>(
    targetPlanting ? targetPlanting.plantId : PLANTS[0].id
  );
  const [harvestDate, setHarvestDate] = useState<string>(todayStr);

  const activePlantDef = PLANTS.find((p) => p.id === selectedPlantId) || PLANTS[0];
  const defaultWeight = targetPlanting
    ? targetPlanting.harvestWeightLbs || getEstimatedHarvestWeight(targetPlanting.plantId, targetPlanting.category)
    : getEstimatedHarvestWeight(activePlantDef.id, activePlantDef.category);

  const [weightLbs, setWeightLbs] = useState<number>(defaultWeight);
  const [count, setCount] = useState<string>('');
  const [notes, setNotes] = useState<string>(targetPlanting?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedId) return;

    const plantDef = PLANTS.find((p) => p.id === selectedPlantId) || PLANTS[0];
    const plantName = targetPlanting ? targetPlanting.plantName : plantDef.name;
    const category = targetPlanting ? targetPlanting.category : plantDef.category;

    onConfirmHarvest(selectedBedId, targetPlanting ? targetPlanting.id : null, {
      plantId: targetPlanting ? targetPlanting.plantId : plantDef.id,
      plantName,
      category,
      weightLbs: Number(weightLbs) || 1.0,
      harvestDate,
      count: count ? parseInt(count, 10) : undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-md overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-stone-50 dark:bg-stone-800/70 px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                {targetPlanting ? `Log Harvest: ${targetPlanting.plantName}` : 'Record Vegetable Harvest'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Log yield weight to track seasonal garden productivity.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Target Bed */}
          {!targetPlanting && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Garden Bed
              </label>
              <select
                value={selectedBedId}
                onChange={(e) => setSelectedBedId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-500"
              >
                {beds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Plant Selection if not targeted */}
          {!targetPlanting && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Crop Harvested
              </label>
              <select
                value={selectedPlantId}
                onChange={(e) => {
                  setSelectedPlantId(e.target.value);
                  const p = PLANTS.find((item) => item.id === e.target.value);
                  if (p) {
                    setWeightLbs(getEstimatedHarvestWeight(p.id, p.category));
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-500"
              >
                {PLANTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.categoryLabel})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Harvest Date & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Harvest Date
              </label>
              <input
                type="date"
                max={todayStr}
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Harvest Weight (lbs)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="200"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-500 font-mono"
                  required
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-stone-400 pointer-events-none">
                  lbs
                </span>
              </div>
            </div>
          </div>

          {/* Quick Weight Adjuster Pills */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[11px] text-stone-400">Quick adjust:</span>
            {[0.5, 1.0, 2.0, 3.5, 5.0].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeightLbs(w)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                  weightLbs === w
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                }`}
              >
                {w} lb
              </button>
            ))}
          </div>

          {/* Optional item count & notes */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Quantity (Units)
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 6"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-500 font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Tasting / Harvest Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Sweet, crisp, picked after light frost"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Record Harvest</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
