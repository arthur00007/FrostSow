import React, { useState, useMemo } from 'react';
import { Plant, LocationData, PlantCategory, SowingMethod } from '../types/garden';
import { PLANTS } from '../data/plants';
import { generatePlantYearSchedule, parseFrostDate, getWeekNumber } from '../utils/frostCalculator';
import { Search, Download, Calendar, Info, Layers } from 'lucide-react';

interface CalendarTimelineViewProps {
  location: LocationData;
  currentRealWeek: number;
  year: number;
  onOpenDetails: (plant: Plant) => void;
  onSelectWeek: (week: number) => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CalendarTimelineView: React.FC<CalendarTimelineViewProps> = ({
  location,
  currentRealWeek,
  year,
  onOpenDetails,
  onSelectWeek
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlantCategory | 'all'>('all');

  const springFrostDate = parseFrostDate(location.lastSpringFrost, year);
  const fallFrostDate = parseFrostDate(location.firstFallFrost, year);
  const springFrostWeek = getWeekNumber(springFrostDate);
  const fallFrostWeek = getWeekNumber(fallFrostDate);

  // Pre-calculate schedules for all plants
  const plantSchedules = useMemo(() => {
    const map = new Map<string, Record<number, SowingMethod[]>>();
    for (const p of PLANTS) {
      map.set(p.id, generatePlantYearSchedule(p, location, year));
    }
    return map;
  }, [location, year]);

  const filteredPlants = useMemo(() => {
    return PLANTS.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.botanicalName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const exportCSV = () => {
    const headers = ['Crop Name', 'Category', 'Frost Tolerance', 'Soil Temp Min (F)', 'Days to Maturity', 'Spacing (in)'];
    const rows = filteredPlants.map((p) => [
      `"${p.name}"`,
      `"${p.categoryLabel}"`,
      `"${p.frostToleranceLabel}"`,
      p.soilTempMinF,
      p.daysToMaturity,
      p.spacingInches
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `planting_schedule_${location.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWeekCellColor = (methods: SowingMethod[] | undefined) => {
    if (!methods || methods.length === 0) return 'bg-transparent';
    if (methods.includes('indoor')) return 'bg-amber-400';
    if (methods.includes('direct')) return 'bg-emerald-500';
    if (methods.includes('transplant')) return 'bg-teal-500';
    if (methods.includes('overwinter')) return 'bg-sky-500';
    return 'bg-emerald-400';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
            Annual 52-Week Visual Matrix
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Planting Calendar for {location.name}
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Complete annual sowing timeline calculated against your Last Spring Frost (Wk {springFrostWeek}) & First Fall Frost (Wk {fallFrostWeek}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Legend & Filter Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
        
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="font-semibold text-stone-700 dark:text-stone-300">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-500/30" />
            <span className="text-stone-700 dark:text-stone-300">Start Indoors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-emerald-500 border border-emerald-600/30" />
            <span className="text-stone-700 dark:text-stone-300">Direct Sow Outdoors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-teal-500 border border-teal-600/30" />
            <span className="text-stone-700 dark:text-stone-300">Transplant Outdoors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-sky-500 border border-sky-600/30" />
            <span className="text-stone-700 dark:text-stone-300">Overwinter / Garlic</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 ml-auto font-mono">
            <span className="inline-block w-2.5 h-2.5 bg-rose-500 rounded-full" />
            <span>Red Line = Current Week (Wk {currentRealWeek})</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter crops by name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md focus:outline-hidden focus:border-emerald-600 focus:bg-white dark:focus:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <span className="text-stone-500 dark:text-stone-400 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as PlantCategory | 'all')}
              className="px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-800 dark:text-stone-200 text-xs focus:outline-hidden focus:border-emerald-600"
            >
              <option value="all">All Categories ({PLANTS.length})</option>
              <option value="alliums">Alliums & Garlic</option>
              <option value="leafy_greens">Leafy Greens</option>
              <option value="roots">Root Crops</option>
              <option value="brassicas">Brassicas</option>
              <option value="legumes">Legumes</option>
              <option value="nightshades">Nightshades</option>
              <option value="cucurbits">Cucurbits</option>
              <option value="herbs">Herbs</option>
              <option value="flowers">Flowers</option>
              <option value="cover_crops">Cover Crops</option>
            </select>
          </div>
        </div>

      </div>

      {/* Gantt Timeline Table Container */}
      <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <div className="min-w-[960px]">
            
            {/* Month Header Row */}
            <div className="grid grid-cols-[220px_repeat(52,1fr)] bg-stone-100 dark:bg-stone-800/90 border-b border-stone-200 dark:border-stone-700 text-[11px] font-medium text-stone-600 dark:text-stone-300 sticky top-0 z-10">
              <div className="p-2.5 font-semibold text-stone-800 dark:text-stone-200 border-r border-stone-200 dark:border-stone-700">
                Crop & Botanical
              </div>
              
              {/* Render 12 month block spans */}
              <div className="col-span-52 grid grid-cols-12 text-center divide-x divide-stone-200 dark:divide-stone-700">
                {MONTHS.map((m) => (
                  <div key={m} className="py-2 font-semibold text-stone-700 dark:text-stone-300">
                    {m}
                  </div>
                ))}
              </div>
            </div>

            {/* Frost Marker Row */}
            <div className="grid grid-cols-[220px_repeat(52,1fr)] bg-stone-50/70 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-700 text-[10px] text-stone-500 dark:text-stone-400">
              <div className="p-1.5 border-r border-stone-200 dark:border-stone-700 font-mono text-stone-400 dark:text-stone-500">
                Frost Markers:
              </div>
              {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => {
                const isSpring = w === springFrostWeek;
                const isFall = w === fallFrostWeek;
                const isCurrent = w === currentRealWeek;

                return (
                  <button
                    key={`wk-${w}`}
                    onClick={() => onSelectWeek(w)}
                    title={`Click to jump to Week ${w}`}
                    className={`h-6 text-center flex items-center justify-center transition-colors hover:bg-stone-200 dark:hover:bg-stone-700 font-mono ${
                      isCurrent ? 'bg-rose-100 dark:bg-rose-950/60 font-bold text-rose-700 dark:text-rose-400' : ''
                    }`}
                  >
                    {isSpring && <span title="Last Spring Frost" className="text-amber-600 text-xs font-bold">🌸</span>}
                    {isFall && <span title="First Fall Frost" className="text-sky-600 text-xs font-bold">❄️</span>}
                    {!isSpring && !isFall && isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                  </button>
                );
              })}
            </div>

            {/* Plant Rows */}
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredPlants.map((plant) => {
                const schedule = plantSchedules.get(plant.id) || {};

                return (
                  <div
                    key={plant.id}
                    className="grid grid-cols-[220px_repeat(52,1fr)] hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors items-center group text-xs"
                  >
                    {/* Plant Label */}
                    <div className="p-2 border-r border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2 overflow-hidden">
                      <div className="truncate">
                        <button
                          onClick={() => onOpenDetails(plant)}
                          className="font-semibold text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 text-left truncate block"
                        >
                          {plant.name}
                        </button>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 italic truncate block">
                          {plant.botanicalName}
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenDetails(plant)}
                        className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="View crop profile"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 52 Week Columns */}
                    {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => {
                      const methods = schedule[w];
                      const cellColor = getWeekCellColor(methods);
                      const isCurrent = w === currentRealWeek;

                      return (
                        <div
                          key={`cell-${plant.id}-${w}`}
                          onClick={() => {
                            if (methods && methods.length > 0) {
                              onSelectWeek(w);
                            }
                          }}
                          className={`h-8 flex items-center justify-center relative cursor-pointer ${
                            isCurrent ? 'border-x border-rose-300 dark:border-rose-600' : ''
                          }`}
                          title={
                            methods
                              ? `Week ${w}: ${methods.join(', ')} for ${plant.name}`
                              : `Week ${w}`
                          }
                        >
                          {/* Sowing bar segment */}
                          {methods && methods.length > 0 && (
                            <div className={`w-full h-3 rounded-xs ${cellColor} shadow-2xs mx-0.5`} />
                          )}
                          
                          {/* Red indicator pin for current week */}
                          {isCurrent && (
                            <div className="absolute inset-y-0 w-0.5 bg-rose-500 z-1 pointer-events-none" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
