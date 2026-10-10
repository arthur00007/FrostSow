import React from 'react';
import { Plant, SowingMethod, GardenBed } from '../types/garden';
import { formatTemp } from '../utils/frostCalculator';
import { X, Calendar, Lightbulb, Thermometer } from 'lucide-react';
import { CompanionPlantingSection } from './CompanionPlantingSection';
import { useLanguage } from '../context/LanguageContext';

interface PlantDetailModalProps {
  plant: Plant | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToBed: (plant: Plant, method: SowingMethod) => void;
  isCelsius: boolean;
  allPlants?: Plant[];
  beds?: GardenBed[];
  onSelectPlant?: (plant: Plant) => void;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({
  plant,
  isOpen,
  onClose,
  onAddToBed,
  isCelsius,
  allPlants = [],
  beds = [],
  onSelectPlant
}) => {
  const { t } = useLanguage();
  if (!isOpen || !plant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 flex items-start justify-between bg-stone-50 dark:bg-stone-800/60">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1">
              <span>{plant.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-emerald-800 dark:text-emerald-400">{plant.frostToleranceLabel}</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
              {plant.name}
            </h2>
            <p className="text-xs italic text-stone-500 dark:text-stone-400">
              {plant.botanicalName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 rounded-md"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
          
          {/* Description */}
          <p className="leading-relaxed text-stone-800 dark:text-stone-200">
            {plant.description}
          </p>

          {/* Key Agronomic Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700">
              <span className="text-stone-400 dark:text-stone-500 text-[11px] block">Soil Temp Min</span>
              <span className="font-mono font-semibold text-stone-900 dark:text-stone-100 text-sm">
                {formatTemp(plant.soilTempMinF, isCelsius)}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block">Opt: {plant.soilTempOptimalF}</span>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700">
              <span className="text-stone-400 dark:text-stone-500 text-[11px] block">Plant Spacing</span>
              <span className="font-mono font-semibold text-stone-900 dark:text-stone-100 text-sm">
                {plant.spacingInches} inches
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block">Depth: {plant.depthInches}</span>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700">
              <span className="text-stone-400 dark:text-stone-500 text-[11px] block">Days to Harvest</span>
              <span className="font-mono font-semibold text-stone-900 dark:text-stone-100 text-sm">
                {plant.daysToMaturity} days
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block">{plant.daysToMaturityRange}</span>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700">
              <span className="text-stone-400 dark:text-stone-500 text-[11px] block">Germination</span>
              <span className="font-mono font-semibold text-stone-900 dark:text-stone-100 text-sm">
                {plant.daysToGermination}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block">{plant.sunlight}</span>
            </div>
          </div>

          {/* Sowing Windows Breakdown */}
          <div className="space-y-2">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Calculated Planting Windows</span>
            </h3>
            <div className="bg-stone-50 dark:bg-stone-800/60 p-3 rounded-lg border border-stone-200 dark:border-stone-700 space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
              {plant.indoorStartWeeksBeforeLFD && (
                <div>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">🏠 Indoor Seed Starting: </span>
                  {plant.indoorStartWeeksBeforeLFD[0]} to {plant.indoorStartWeeksBeforeLFD[1]} weeks before last spring frost
                </div>
              )}
              {plant.directSowWeeksRelativeLFD && (
                <div>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">🌱 Spring Direct Sow: </span>
                  {plant.directSowWeeksRelativeLFD[0] < 0 
                    ? `${Math.abs(plant.directSowWeeksRelativeLFD[0])} to ${Math.abs(plant.directSowWeeksRelativeLFD[1])} weeks before last frost`
                    : `${plant.directSowWeeksRelativeLFD[0]} to ${plant.directSowWeeksRelativeLFD[1]} weeks after last frost`}
                </div>
              )}
              {plant.transplantWeeksRelativeLFD && (
                <div>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">🌿 Spring Transplant: </span>
                  {plant.transplantWeeksRelativeLFD[0] < 0
                    ? `${Math.abs(plant.transplantWeeksRelativeLFD[0])} to ${Math.abs(plant.transplantWeeksRelativeLFD[1])} weeks before last frost`
                    : `${plant.transplantWeeksRelativeLFD[0]} to ${plant.transplantWeeksRelativeLFD[1]} weeks after last frost`}
                </div>
              )}
              {plant.fallDirectSowWeeksBeforeFFD && (
                <div>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">🍂 Fall Direct Sow: </span>
                  {plant.fallDirectSowWeeksBeforeFFD[0]} to {plant.fallDirectSowWeeksBeforeFFD[1]} weeks before first fall frost
                </div>
              )}
              {plant.overwinterWeeksBeforeFFD && (
                <div>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">❄️ Overwinter / Bulb Sowing: </span>
                  {plant.overwinterWeeksBeforeFFD[0]} to {plant.overwinterWeeksBeforeFFD[1]} weeks before first fall frost
                </div>
              )}
            </div>
          </div>

          {/* Frost & Temperature Advice */}
          <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/40 rounded-lg border border-sky-200 dark:border-sky-800/60 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-sky-900 dark:text-sky-300">
              <Thermometer className="w-4 h-4 text-sky-700 dark:text-sky-400" />
              <span>Frost & Temperature Behavior</span>
            </div>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
              {plant.frostTip}
            </p>
          </div>

          {/* Pro Gardening Tip */}
          <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800/60 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-300">
              <Lightbulb className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Gardener's Pro-Tip</span>
            </div>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
              {plant.gardeningTip}
            </p>
          </div>

          {/* Interactive Companion Planting Guide Feature (Friendly and Unfriendly Plant Neighbors) */}
          <CompanionPlantingSection
            plant={plant}
            allPlants={allPlants}
            beds={beds}
            onSelectPlant={onSelectPlant}
          />

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-800/60 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            {plant.categoryLabel}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
            >
              Close
            </button>
            <button
              onClick={() => {
                onAddToBed(plant, 'direct');
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
            >
              Add to My Garden Beds
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
