import React, { useState } from 'react';
import { Plant, PlantingAction, LocationData, PlantCategory, FrostTolerance } from '../types/garden';
import { PlantCard } from './PlantCard';
import { getPlantingActionsForDate, getDateFromWeek } from '../utils/frostCalculator';
import { PLANTS } from '../data/plants';
import { Sparkles, Sprout, Home, ArrowUpRight, Snowflake, AlertCircle, Printer, Filter, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ThisWeekViewProps {
  location: LocationData;
  selectedWeek: number;
  currentRealWeek: number;
  year: number;
  onOpenDetails: (plant: Plant) => void;
  onAddToBed: (plant: Plant, method: PlantingAction['actionType']) => void;
  isCelsius: boolean;
}

export const ThisWeekView: React.FC<ThisWeekViewProps> = ({
  location,
  selectedWeek,
  currentRealWeek,
  year,
  onOpenDetails,
  onAddToBed,
  isCelsius
}) => {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<PlantCategory | 'all'>('all');
  const [selectedTolerance, setSelectedTolerance] = useState<FrostTolerance | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const locale = language === 'ja' ? 'ja-JP' : language === 'de' ? 'de-DE' : language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : language === 'it' ? 'it-IT' : language === 'pt' ? 'pt-PT' : 'en-US';

  // Target date for the selected week
  const weekDate = getDateFromWeek(year, selectedWeek);
  const weekStartStr = weekDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  const weekEndDate = new Date(weekDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  const weekEndStr = weekEndDate.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });

  // Get planting actions
  const actions = getPlantingActionsForDate(PLANTS, location, weekDate);

  // Filter helper
  const filterAction = (item: PlantingAction) => {
    if (selectedCategory !== 'all' && item.plant.category !== selectedCategory) return false;
    if (selectedTolerance !== 'all' && item.plant.frostTolerance !== selectedTolerance) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.plant.name.toLowerCase().includes(q);
      const matchBot = item.plant.botanicalName.toLowerCase().includes(q);
      const matchCat = item.plant.categoryLabel.toLowerCase().includes(q);
      if (!matchName && !matchBot && !matchCat) return false;
    }
    return true;
  };

  const filteredIndoors = actions.sowIndoors.filter(filterAction);
  const filteredDirect = actions.directSow.filter(filterAction);
  const filteredTransplant = actions.transplant.filter(filterAction);
  const filteredOverwinter = actions.overwinter.filter(filterAction);
  const filteredAlerts = actions.frostWatchAlerts.filter(filterAction);

  const totalActionsCount =
    filteredIndoors.length +
    filteredDirect.length +
    filteredTransplant.length +
    filteredOverwinter.length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Week Header & Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
            Garden Action Schedule
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            {selectedWeek === currentRealWeek ? 'What to Plant This Week' : `Planting Schedule for Week ${selectedWeek}`}
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Recommended planting window for <span className="font-semibold text-stone-800 dark:text-stone-200">{weekStartStr} – {weekEndStr}</span> based on {location.name} frost dates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 rounded-md transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span>Print Checklist</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by crop name (e.g. Garlic, Spinach, Tomato)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md focus:outline-hidden focus:border-emerald-600 focus:bg-white dark:focus:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
          </div>

          {/* Frost Tolerance Filter */}
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <span className="text-stone-500 dark:text-stone-400 font-medium">Frost Tolerance:</span>
            <select
              value={selectedTolerance}
              onChange={(e) => setSelectedTolerance(e.target.value as FrostTolerance | 'all')}
              className="px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-800 dark:text-stone-200 text-xs focus:outline-hidden focus:border-emerald-600"
            >
              <option value="all">All Tolerances</option>
              <option value="hardy">Frost Hardy</option>
              <option value="semi-hardy">Semi-Hardy</option>
              <option value="tender">Tender (Frost Sensitive)</option>
            </select>
          </div>
        </div>

        {/* Category Tabs (functional button tabs) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 dark:text-stone-500 shrink-0 text-xs mr-1">Category:</span>
          {(
            [
              ['all', 'All Crops'],
              ['alliums', 'Alliums & Garlic'],
              ['leafy_greens', 'Leafy Greens'],
              ['roots', 'Root Crops'],
              ['brassicas', 'Brassicas'],
              ['legumes', 'Legumes (Peas/Beans)'],
              ['nightshades', 'Nightshades'],
              ['cucurbits', 'Squash & Cucumbers'],
              ['herbs', 'Herbs'],
              ['flowers', 'Flowers'],
              ['cover_crops', 'Cover Crops'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setSelectedCategory(val)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                selectedCategory === val
                  ? 'bg-stone-900 dark:bg-emerald-600 text-white font-medium'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Frost Alerts Section if applicable */}
      {filteredAlerts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              Imminent Frost Watch: Protect or Harvest
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlerts.map((act) => (
              <PlantCard
                key={`alert-${act.plant.id}`}
                action={act}
                onOpenDetails={onOpenDetails}
                onAddToBed={onAddToBed}
                isCelsius={isCelsius}
              />
            ))}
          </div>
        </section>
      )}

      {/* OVERWINTERING & FALL BULBS (Priority in Autumn!) */}
      {filteredOverwinter.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
                ❄️
              </div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                Plant for Overwintering & Spring Harvest
              </h2>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono tabular-nums">
              {filteredOverwinter.length} {filteredOverwinter.length === 1 ? 'variety' : 'varieties'}
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 -mt-2">
            Fall-planted crops that establish root systems before hard freeze and yield early harvests or soil enrichment next spring.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOverwinter.map((act) => (
              <PlantCard
                key={`overwinter-${act.plant.id}`}
                action={act}
                onOpenDetails={onOpenDetails}
                onAddToBed={onAddToBed}
                isCelsius={isCelsius}
              />
            ))}
          </div>
        </section>
      )}

      {/* DIRECT SOW OUTDOORS */}
      {filteredDirect.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                🌱
              </div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                Direct Sow Outdoors in Beds
              </h2>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono tabular-nums">
              {filteredDirect.length} {filteredDirect.length === 1 ? 'variety' : 'varieties'}
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 -mt-2">
            Plant seeds directly into prepared garden beds or containers at recommended depth.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDirect.map((act) => (
              <PlantCard
                key={`direct-${act.plant.id}`}
                action={act}
                onOpenDetails={onOpenDetails}
                onAddToBed={onAddToBed}
                isCelsius={isCelsius}
              />
            ))}
          </div>
        </section>
      )}

      {/* SOW INDOORS UNDER LIGHTS */}
      {filteredIndoors.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                🏠
              </div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                Start Seeds Indoors Under Lights
              </h2>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono tabular-nums">
              {filteredIndoors.length} {filteredIndoors.length === 1 ? 'variety' : 'varieties'}
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 -mt-2">
            Sow in seedling trays with sterile seed-starting mix, heat mats, and 14-16 hours of daily grow light.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIndoors.map((act) => (
              <PlantCard
                key={`indoor-${act.plant.id}`}
                action={act}
                onOpenDetails={onOpenDetails}
                onAddToBed={onAddToBed}
                isCelsius={isCelsius}
              />
            ))}
          </div>
        </section>
      )}

      {/* TRANSPLANT OUTDOORS */}
      {filteredTransplant.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                🌿
              </div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                Transplant Seedlings Outdoors
              </h2>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono tabular-nums">
              {filteredTransplant.length} {filteredTransplant.length === 1 ? 'variety' : 'varieties'}
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 -mt-2">
            Move hardened-off potted starts or purchased nursery seedlings into their outdoor homes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTransplant.map((act) => (
              <PlantCard
                key={`transplant-${act.plant.id}`}
                action={act}
                onOpenDetails={onOpenDetails}
                onAddToBed={onAddToBed}
                isCelsius={isCelsius}
              />
            ))}
          </div>
        </section>
      )}

      {/* Zero State / Off-Season Guidance */}
      {totalActionsCount === 0 && (
        <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 mb-3 text-xl">
            🌱
          </div>
          <h3 className="text-lg font-serif font-semibold text-stone-900 dark:text-stone-100">
            No Active Sowing Scheduled for Week {selectedWeek} with Current Filters
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto mt-1 mb-4">
            {selectedCategory !== 'all' || selectedTolerance !== 'all' || searchQuery
              ? 'Try resetting your search query or category filters to view other scheduled plantings.'
              : 'Depending on your frost zone, this may be a rest period. Scrub through the timeline or consult the full Planting Calendar.'}
          </p>
          {(selectedCategory !== 'all' || selectedTolerance !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedTolerance('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-md transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

    </div>
  );
};
