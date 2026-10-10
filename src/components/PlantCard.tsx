import React from 'react';
import { Plant, PlantingAction } from '../types/garden';
import { formatTemp } from '../utils/frostCalculator';
import { Sun, Calendar, Plus, Info, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PlantCardProps {
  action: PlantingAction;
  onOpenDetails: (plant: Plant) => void;
  onAddToBed: (plant: Plant, method: PlantingAction['actionType']) => void;
  isCelsius: boolean;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  action,
  onOpenDetails,
  onAddToBed,
  isCelsius
}) => {
  const { plant } = action;

  // Visual category indicator & color accent
  const getToleranceBadge = () => {
    switch (plant.frostTolerance) {
      case 'hardy':
        return {
          label: 'Frost Hardy',
          textClass: 'text-sky-700 dark:text-sky-400',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 inline mr-1" />
        };
      case 'semi-hardy':
        return {
          label: 'Semi-Hardy',
          textClass: 'text-amber-700 dark:text-amber-400',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 inline mr-1" />
        };
      case 'tender':
        return {
          label: 'Tender (32°F sensitive)',
          textClass: 'text-rose-700 dark:text-rose-400',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 inline mr-1" />
        };
    }
  };

  const tolerance = getToleranceBadge();

  return (
    <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors p-4 flex flex-col justify-between shadow-2xs">
      <div>
        {/* Unboxed metadata kicker (Zero-pill compliant) */}
        <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-1.5 flex-wrap">
          <span className="font-medium text-stone-700 dark:text-stone-300">{plant.categoryLabel}</span>
          <span aria-hidden="true">·</span>
          <span className={tolerance.textClass}>
            {tolerance.icon}
            {tolerance.label}
          </span>
          <span aria-hidden="true">·</span>
          <span>{plant.daysToMaturity} days to harvest</span>
        </div>

        {/* Plant Title & Botanical Name */}
        <div className="mb-2">
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 leading-snug">
            {plant.name}
          </h3>
          <p className="text-xs italic text-stone-500 dark:text-stone-400">
            {plant.botanicalName}
          </p>
        </div>

        {/* Timing Window note */}
        <div className="text-xs bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 p-2.5 rounded border border-stone-200 dark:border-stone-700 mb-3 space-y-1">
          <div className="font-medium text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Window: {action.windowDescription}</span>
          </div>
          <p className="text-stone-600 dark:text-stone-400">
            {action.timingContext}
          </p>
        </div>

        {/* Quick agronomic specs: Spacing, Depth, Soil Temp */}
        <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-400 mb-3 pt-1 border-t border-stone-100 dark:border-stone-800">
          <div>
            <span className="text-stone-400 dark:text-stone-500 block">Soil Temp Min:</span>
            <span className="font-mono font-medium text-stone-800 dark:text-stone-200">
              {formatTemp(plant.soilTempMinF, isCelsius)}
            </span>
          </div>
          <div>
            <span className="text-stone-400 dark:text-stone-500 block">Plant Spacing:</span>
            <span className="font-mono font-medium text-stone-800 dark:text-stone-200">
              {plant.spacingInches}" apart
            </span>
          </div>
          <div>
            <span className="text-stone-400 dark:text-stone-500 block">Sow Depth:</span>
            <span className="font-mono font-medium text-stone-800 dark:text-stone-200">
              {plant.depthInches}
            </span>
          </div>
          <div>
            <span className="text-stone-400 dark:text-stone-500 block">Sunlight:</span>
            <span className="font-medium text-stone-800 dark:text-stone-200 truncate">
              {plant.sunlight}
            </span>
          </div>
        </div>

        {/* Short tip snippet */}
        <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-3">
          {plant.gardeningTip}
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-stone-100 dark:border-stone-800 mt-2">
        <button
          onClick={() => onAddToBed(plant, action.actionType)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white text-xs font-medium rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add to Garden</span>
        </button>
        <button
          onClick={() => onOpenDetails(plant)}
          className="py-1.5 px-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium rounded-md transition-colors flex items-center gap-1"
          title="View Botanical Guide & Companions"
        >
          <Info className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
          <span>Guide</span>
        </button>
      </div>
    </div>
  );
};
