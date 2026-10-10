import React, { useState, useEffect, useMemo } from 'react';
import { GardenBed, LocationData, Plant } from '../types/garden';
import { PLANTS } from '../data/plants';
import { fetchWeatherForecast, WeatherForecastResult } from '../services/weatherService';
import { BedWaterTracker } from './BedWaterTracker';
import {
  WaterWeatherSummaryBanner,
  BedWaterFilter,
} from './WaterWeatherSummaryBanner';
import { calculateBedWaterReminder } from '../utils/waterTrackerUtils';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Sprout,
  Filter,
  Calendar,
} from 'lucide-react';

interface BedPlannerViewProps {
  beds: GardenBed[];
  location: LocationData;
  isCelsius?: boolean;
  onAddBed: (name: string, type: GardenBed['type']) => void;
  onDeleteBed: (bedId: string) => void;
  onRemovePlantFromBed: (bedId: string, plantEntryId: string) => void;
  onToggleHarvested: (bedId: string, plantEntryId: string) => void;
  onOpenPlantDetails: (plant: Plant) => void;
  onOpenAddModal: () => void;
  onUpdateBedWatering: (bedId: string, updates: Partial<GardenBed>) => void;
  onWaterBedNow: (bedId: string, volume?: 'light' | 'moderate' | 'deep', date?: string) => void;
  onWaterAllDueBeds: (dueBedIds: string[]) => void;
}

export const BedPlannerView: React.FC<BedPlannerViewProps> = ({
  beds,
  location,
  isCelsius = false,
  onAddBed,
  onDeleteBed,
  onRemovePlantFromBed,
  onToggleHarvested,
  onOpenPlantDetails,
  onOpenAddModal,
  onUpdateBedWatering,
  onWaterBedNow,
  onWaterAllDueBeds,
}) => {
  const [newBedName, setNewBedName] = useState('');
  const [newBedType, setNewBedType] = useState<GardenBed['type']>('Raised Bed');
  const [isCreatingBed, setIsCreatingBed] = useState(false);
  const [activeFilter, setActiveFilter] = useState<BedWaterFilter>('all');

  // Weather state
  const [weather, setWeather] = useState<WeatherForecastResult | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Fetch local weather for weather-adaptive reminders
  useEffect(() => {
    let isMounted = true;
    setIsLoadingWeather(true);
    fetchWeatherForecast(location)
      .then((res) => {
        if (isMounted) {
          setWeather(res);
          setIsLoadingWeather(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load weather for bed planner:', err);
        if (isMounted) {
          setIsLoadingWeather(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [location]);

  const handleRefreshWeather = () => {
    setIsLoadingWeather(true);
    fetchWeatherForecast(location, true)
      .then((res) => {
        setWeather(res);
        setIsLoadingWeather(false);
      })
      .catch((err) => {
        console.error('Refresh weather failed:', err);
        setIsLoadingWeather(false);
      });
  };

  const handleCreateBed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBedName.trim()) return;
    onAddBed(newBedName.trim(), newBedType);
    setNewBedName('');
    setIsCreatingBed(false);
  };

  const getDaysRemaining = (expectedHarvestDate: string) => {
    const today = new Date();
    const harvest = new Date(expectedHarvestDate);
    const diffTime = harvest.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter beds according to water status filter
  const filteredBeds = useMemo(() => {
    if (activeFilter === 'all') return beds;

    return beds.filter((bed) => {
      const reminder = calculateBedWaterReminder(bed, weather);
      if (activeFilter === 'needs_water') {
        return (
          reminder.status === 'overdue' ||
          reminder.status === 'due_today' ||
          reminder.status === 'untracked'
        );
      }
      if (activeFilter === 'rain_delay') {
        return reminder.status === 'rain_delay';
      }
      if (activeFilter === 'adequate') {
        return reminder.status === 'adequate' || reminder.status === 'due_soon';
      }
      return true;
    });
  }, [beds, weather, activeFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
            Active Garden Beds & Irrigation Log
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            My Garden Beds & Water Tracker
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Track what you’ve sown, log bed waterings, and receive automatic reminders based on local temperature and rainfall forecasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreatingBed(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-md transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Garden Bed</span>
          </button>
        </div>
      </div>

      {/* New Bed Form Modal/Inline */}
      {isCreatingBed && (
        <form
          onSubmit={handleCreateBed}
          className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-emerald-300 dark:border-emerald-700 shadow-xs space-y-3"
        >
          <div className="font-semibold text-sm text-stone-900 dark:text-stone-100">
            Create New Garden Bed or Container
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1">
                Bed Name / Location
              </label>
              <input
                type="text"
                value={newBedName}
                onChange={(e) => setNewBedName(e.target.value)}
                placeholder="e.g. Raised Bed #1 (South Garden)"
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded focus:border-emerald-600 focus:outline-hidden"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1">
                Bed Type
              </label>
              <select
                value={newBedType}
                onChange={(e) => setNewBedType(e.target.value as GardenBed['type'])}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="Raised Bed">Raised Bed</option>
                <option value="In-ground">In-ground Bed</option>
                <option value="Container">Patio Container / Pot</option>
                <option value="Cold Frame">Cold Frame / Tunnel</option>
                <option value="Greenhouse">Greenhouse</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingBed(false)}
              className="px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded"
            >
              Save Bed
            </button>
          </div>
        </form>
      )}

      {/* Weather-Adaptive Water Tracking Overview & Filter Banner */}
      <WaterWeatherSummaryBanner
        beds={beds}
        location={location}
        weather={weather}
        isLoadingWeather={isLoadingWeather}
        onRefreshWeather={handleRefreshWeather}
        isCelsius={isCelsius}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onWaterAllDueBeds={onWaterAllDueBeds}
      />

      {/* Bed List */}
      <div className="space-y-6">
        {filteredBeds.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-8 text-center">
            <Filter className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
              No garden beds match the active filter ({activeFilter.replace('_', ' ')})
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Switch back to all beds to view and manage all your garden plantings.
            </p>
            <button
              onClick={() => setActiveFilter('all')}
              className="mt-3 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium rounded transition-colors"
            >
              View All Beds
            </button>
          </div>
        ) : (
          filteredBeds.map((bed) => {
            const activePlants = bed.plants.filter((p) => !p.isHarvested);
            const harvestedPlants = bed.plants.filter((p) => p.isHarvested);

            return (
              <div
                key={bed.id}
                className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs"
              >
                {/* Bed Header */}
                <div className="bg-stone-50 dark:bg-stone-800/60 px-4 py-3 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center font-bold text-sm">
                      {bed.type === 'Container' ? '🪴' : bed.type === 'Greenhouse' ? '🌱' : '🏡'}
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                        {bed.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                        <span>{bed.type}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {bed.plants.length} plantings logged
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeleteBed(bed.id)}
                      className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="Delete Bed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bed Content */}
                <div className="p-4 space-y-4">
                  {bed.plants.length === 0 ? (
                    <div className="text-center py-6 text-stone-400 dark:text-stone-500">
                      <Sprout className="w-7 h-7 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        This bed has no plantings logged yet.
                      </p>
                      <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                        Go to "This Week" and click "Add to Garden" to populate this bed!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Active Plantings Table */}
                      {activePlants.length > 0 && (
                        <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-100 dark:border-stone-800 rounded-lg">
                          {activePlants.map((item) => {
                            const plantDef = PLANTS.find((p) => p.id === item.plantId);
                            const daysRem = getDaysRemaining(item.expectedHarvestDate);

                            return (
                              <div
                                key={item.id}
                                className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                                      {item.plantName}
                                    </span>
                                    {plantDef && (
                                      <button
                                        onClick={() => onOpenPlantDetails(plantDef)}
                                        className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
                                      >
                                        Guide
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                    <span>Sown: {item.sownDate}</span>
                                    <span aria-hidden="true">·</span>
                                    <span>Method: {item.method.replace('_', ' ')}</span>
                                    {item.notes && (
                                      <>
                                        <span aria-hidden="true">·</span>
                                        <span className="italic text-stone-600 dark:text-stone-400 truncate max-w-xs">
                                          {item.notes}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                                  {/* Harvest Countdown */}
                                  <div className="text-right">
                                    <div className="text-xs font-mono tabular-nums font-semibold text-stone-800 dark:text-stone-200">
                                      {daysRem > 0
                                        ? `${daysRem} days to harvest`
                                        : 'Ready for harvest!'}
                                    </div>
                                    <div className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                                      Est: {item.expectedHarvestDate}
                                    </div>
                                  </div>

                                  {/* Mark as Harvested */}
                                  <button
                                    onClick={() => onToggleHarvested(bed.id, item.id)}
                                    className="px-2.5 py-1 text-xs text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-stone-200 dark:border-stone-700 rounded transition-colors"
                                    title="Mark crop as harvested"
                                  >
                                    Harvest ✓
                                  </button>

                                  <button
                                    onClick={() => onRemovePlantFromBed(bed.id, item.id)}
                                    className="p-1 text-stone-300 dark:text-stone-600 hover:text-rose-500"
                                    title="Remove entry"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Harvested History */}
                      {harvestedPlants.length > 0 && (
                        <div className="pt-2">
                          <div className="text-xs font-semibold text-stone-400 dark:text-stone-500 mb-1.5 uppercase">
                            Harvested & Completed ({harvestedPlants.length})
                          </div>
                          <div className="divide-y divide-stone-100 dark:divide-stone-800 bg-stone-50/50 dark:bg-stone-800/30 rounded border border-stone-100 dark:border-stone-800">
                            {harvestedPlants.map((item) => (
                              <div
                                key={item.id}
                                className="p-2.5 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400"
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  <span className="line-through">{item.plantName}</span>
                                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                                    (Sown {item.sownDate})
                                  </span>
                                </div>
                                <button
                                  onClick={() => onToggleHarvested(bed.id, item.id)}
                                  className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 underline"
                                >
                                  Restore to active
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bed Water Tracking & Weather Reminders */}
                  <BedWaterTracker
                    bed={bed}
                    weather={weather}
                    isCelsius={isCelsius}
                    onUpdateBedWatering={onUpdateBedWatering}
                    onWaterBedNow={onWaterBedNow}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
