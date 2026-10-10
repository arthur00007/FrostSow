import React, { useState, useEffect, useMemo } from 'react';
import { LocationData, GardenBed, Plant, SowingMethod, PlantingAction } from './types/garden';
import { DEFAULT_LOCATION, POPULAR_LOCATIONS } from './data/locations';
import { PLANTS } from './data/plants';
import { calculateSeasonState, getWeekNumber, getDateFromWeek } from './utils/frostCalculator';
import { Header, AppTab } from './components/Header';
import { LocationBanner } from './components/LocationBanner';
import { LocationModal } from './components/LocationModal';
import { ThisWeekView } from './components/ThisWeekView';
import { CalendarTimelineView } from './components/CalendarTimelineView';
import { BedPlannerView } from './components/BedPlannerView';
import { FrostGuideView } from './components/FrostGuideView';
import { PlantDetailModal } from './components/PlantDetailModal';
import { AddToBedModal } from './components/AddToBedModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { GardenAdvisorChat } from './components/GardenAdvisorChat';
import { MapsGroundingView } from './components/MapsGroundingView';
import { SearchGroundingView } from './components/SearchGroundingView';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

const STORAGE_LOCATION_KEY = 'frostsow_location_v1';
const STORAGE_BEDS_KEY = 'frostsow_beds_v1';
const STORAGE_CELSIUS_KEY = 'frostsow_celsius_v1';

function MainApp() {
  // Current real-world date
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const currentRealWeek = useMemo(() => getWeekNumber(today), [today]);

  // Selected week (defaults to real current week, e.g. Week 41 in October)
  const [selectedWeek, setSelectedWeek] = useState<number>(currentRealWeek);

  // Temperature unit preference
  const [isCelsius, setIsCelsius] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_CELSIUS_KEY);
    return saved ? JSON.parse(saved) : false;
  });

  // Current selected location
  const [location, setLocation] = useState<LocationData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LOCATION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_LOCATION;
  });

  // Garden Beds & planting log
  const [beds, setBeds] = useState<GardenBed[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BEDS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default starter beds
    return [
      {
        id: 'bed-1',
        name: 'Raised Bed #1 (Sun)',
        type: 'Raised Bed',
        lastWatered: new Date(today.getTime() - 2 * 86400000).toISOString().split('T')[0],
        lastWateredTime: '08:30 AM',
        waterSchedule: 'auto_weather',
        reminderEnabled: true,
        wateringVolume: 'moderate',
        plants: [
          {
            id: 'demo-1',
            plantId: 'garlic-hardneck',
            plantName: 'Hardneck Garlic',
            category: 'alliums',
            sownDate: today.toISOString().split('T')[0],
            expectedHarvestDate: new Date(today.getTime() + 240 * 86400000).toISOString().split('T')[0],
            method: 'overwinter',
            notes: 'Planted with 4 inches straw mulch'
          }
        ]
      },
      {
        id: 'bed-2',
        name: 'Herb & Greens Cold Frame',
        type: 'Cold Frame',
        lastWatered: new Date(today.getTime() - 86400000).toISOString().split('T')[0],
        lastWateredTime: '09:15 AM',
        waterSchedule: 'auto_weather',
        reminderEnabled: true,
        wateringVolume: 'light',
        plants: [
          {
            id: 'demo-2',
            plantId: 'spinach',
            plantName: 'Spinach',
            category: 'leafy_greens',
            sownDate: today.toISOString().split('T')[0],
            expectedHarvestDate: new Date(today.getTime() + 42 * 86400000).toISOString().split('T')[0],
            method: 'direct',
            notes: 'Winter salad greens under glass'
          }
        ]
      }
    ];
  });

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<AppTab>('this_week');

  // Modal states
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [detailPlant, setDetailPlant] = useState<Plant | null>(null);
  const [addToBedPlant, setAddToBedPlant] = useState<Plant | null>(null);
  const [addToBedMethod, setAddToBedMethod] = useState<SowingMethod>('direct');

  // Persist location
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LOCATION_KEY, JSON.stringify(location));
    } catch {
      // ignore
    }
  }, [location]);

  // Persist beds
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BEDS_KEY, JSON.stringify(beds));
    } catch {
      // ignore
    }
  }, [beds]);

  // Persist temp unit
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CELSIUS_KEY, JSON.stringify(isCelsius));
    } catch {
      // ignore
    }
  }, [isCelsius]);

  // Target date calculated for current selected week
  const selectedDate = useMemo(() => {
    if (selectedWeek === currentRealWeek) {
      return today;
    }
    return getDateFromWeek(currentYear, selectedWeek);
  }, [selectedWeek, currentRealWeek, currentYear, today]);

  // Season state calculations
  const seasonState = useMemo(() => {
    return calculateSeasonState(location, selectedDate);
  }, [location, selectedDate]);

  // Bed Planner Actions
  const handleAddBed = (name: string, type: GardenBed['type']) => {
    const newBed: GardenBed = {
      id: `bed-${Date.now()}`,
      name,
      type,
      plants: []
    };
    setBeds((prev) => [...prev, newBed]);
  };

  const handleCreateNewBedInline = (name: string): string => {
    const newId = `bed-${Date.now()}`;
    const newBed: GardenBed = {
      id: newId,
      name,
      type: 'Raised Bed',
      plants: []
    };
    setBeds((prev) => [...prev, newBed]);
    return newId;
  };

  const handleDeleteBed = (bedId: string) => {
    setBeds((prev) => prev.filter((b) => b.id !== bedId));
  };

  const handleRemovePlantFromBed = (bedId: string, plantEntryId: string) => {
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id !== bedId) return b;
        return {
          ...b,
          plants: b.plants.filter((p) => p.id !== plantEntryId)
        };
      })
    );
  };

  const handleToggleHarvested = (bedId: string, plantEntryId: string) => {
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id !== bedId) return b;
        return {
          ...b,
          plants: b.plants.map((p) => {
            if (p.id !== plantEntryId) return p;
            return {
              ...p,
              isHarvested: !p.isHarvested
            };
          })
        };
      })
    );
  };

  const handleConfirmAddToBed = (
    bedId: string,
    plant: Plant,
    sownDate: string,
    expectedHarvestDate: string,
    method: SowingMethod,
    notes: string
  ) => {
    const newEntry = {
      id: `plant-entry-${Date.now()}`,
      plantId: plant.id,
      plantName: plant.name,
      category: plant.category,
      sownDate,
      expectedHarvestDate,
      method,
      notes: notes || undefined
    };

    setBeds((prev) =>
      prev.map((b) => {
        if (b.id !== bedId) return b;
        return {
          ...b,
          plants: [newEntry, ...b.plants]
        };
      })
    );
  };

  const handleUpdateBedWatering = (bedId: string, updates: Partial<GardenBed>) => {
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id !== bedId) return b;
        return {
          ...b,
          ...updates
        };
      })
    );
  };

  const handleWaterBedNow = (
    bedId: string,
    volume: 'light' | 'moderate' | 'deep' = 'moderate',
    customDate?: string
  ) => {
    const todayStr = customDate || new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id !== bedId) return b;
        const newLogEntry = {
          id: `log-${Date.now()}`,
          date: todayStr,
          time: nowTime,
          volume,
          source: 'manual' as const,
        };
        const prevHistory = b.wateringHistory || [];
        return {
          ...b,
          lastWatered: todayStr,
          lastWateredTime: nowTime,
          wateringVolume: volume,
          wateringHistory: [newLogEntry, ...prevHistory].slice(0, 30),
        };
      })
    );
  };

  const handleWaterAllDueBeds = (dueBedIds: string[]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBeds((prev) =>
      prev.map((b) => {
        if (!dueBedIds.includes(b.id)) return b;
        const newLogEntry = {
          id: `log-${Date.now()}-${b.id}`,
          date: todayStr,
          time: nowTime,
          volume: 'moderate' as const,
          source: 'manual' as const,
        };
        const prevHistory = b.wateringHistory || [];
        return {
          ...b,
          lastWatered: todayStr,
          lastWateredTime: nowTime,
          wateringVolume: 'moderate' as const,
          wateringHistory: [newLogEntry, ...prevHistory].slice(0, 30),
        };
      })
    );
  };

  const handleOpenAddModal = (plant: Plant, method: PlantingAction['actionType']) => {
    let convMethod: SowingMethod = 'direct';
    if (method === 'sow_indoors') convMethod = 'indoor';
    else if (method === 'transplant') convMethod = 'transplant';
    else if (method === 'overwinter') convMethod = 'overwinter';

    setAddToBedPlant(plant);
    setAddToBedMethod(convMethod);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col font-sans text-stone-900 dark:text-stone-100 selection:bg-emerald-200 dark:selection:bg-emerald-900 transition-colors duration-150">
      
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        location={location}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenVoiceCall={() => setIsVoiceModalOpen(true)}
        isCelsius={isCelsius}
        onToggleTempUnit={() => setIsCelsius((prev) => !prev)}
      />

      {/* Location, Frost Dates, Season Gauge & Week Scrubber */}
      <LocationBanner
        location={location}
        seasonState={seasonState}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        selectedWeek={selectedWeek}
        currentRealWeek={currentRealWeek}
        onResetToCurrentWeek={() => setSelectedWeek(currentRealWeek)}
        onWeekChange={(newWeek) => setSelectedWeek(newWeek)}
        isCelsius={isCelsius}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentTab === 'this_week' && (
          <ThisWeekView
            location={location}
            selectedWeek={selectedWeek}
            currentRealWeek={currentRealWeek}
            year={currentYear}
            onOpenDetails={(plant) => setDetailPlant(plant)}
            onAddToBed={(plant, method) => handleOpenAddModal(plant, method)}
            isCelsius={isCelsius}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarTimelineView
            location={location}
            currentRealWeek={currentRealWeek}
            year={currentYear}
            onOpenDetails={(plant) => setDetailPlant(plant)}
            onSelectWeek={(wk) => {
              setSelectedWeek(wk);
              setCurrentTab('this_week');
            }}
          />
        )}

        {currentTab === 'beds' && (
          <BedPlannerView
            beds={beds}
            location={location}
            isCelsius={isCelsius}
            onAddBed={handleAddBed}
            onDeleteBed={handleDeleteBed}
            onRemovePlantFromBed={handleRemovePlantFromBed}
            onToggleHarvested={handleToggleHarvested}
            onOpenPlantDetails={(plant) => setDetailPlant(plant)}
            onOpenAddModal={() => {
              setCurrentTab('this_week');
            }}
            onUpdateBedWatering={handleUpdateBedWatering}
            onWaterBedNow={handleWaterBedNow}
            onWaterAllDueBeds={handleWaterAllDueBeds}
          />
        )}

        {currentTab === 'chat' && (
          <GardenAdvisorChat
            location={location}
            seasonState={seasonState}
            onOpenVoiceCall={() => setIsVoiceModalOpen(true)}
          />
        )}

        {currentTab === 'maps' && (
          <MapsGroundingView location={location} />
        )}

        {currentTab === 'search' && (
          <SearchGroundingView
            location={location}
            seasonState={seasonState}
          />
        )}

        {currentTab === 'guide' && <FrostGuideView />}
      </main>

      {/* Clean Human Editorial Footer */}
      <footer className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 py-8 px-4 sm:px-6 lg:px-8 text-xs text-stone-500 dark:text-stone-400 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-serif font-semibold text-stone-800 dark:text-stone-200 text-sm">
            <span>FrostSow Garden Planner</span>
            <span aria-hidden="true" className="text-stone-300 dark:text-stone-700 font-sans">·</span>
            <span className="font-sans font-normal text-xs text-stone-500 dark:text-stone-400">
              Calibrated for {location.name} ({location.usdaZone})
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 font-mono">
            <span>Spring Frost: {location.lastSpringFrost}</span>
            <span aria-hidden="true">·</span>
            <span>Fall Frost: {location.firstFallFrost}</span>
            <span aria-hidden="true">·</span>
            <span>{seasonState.frostFreeSeasonDays} Frost-Free Days</span>
          </div>
        </div>
      </footer>

      {/* Location Selection & Custom Dates Modal */}
      <LocationModal
        currentLocation={location}
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={(newLoc) => setLocation(newLoc)}
      />

      {/* Real-Time Live Voice Assistant Modal (gemini-3.8-live) */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        location={location}
      />

      {/* Plant Botanical Profile Modal with Companion Planting Guide */}
      <PlantDetailModal
        plant={detailPlant}
        isOpen={detailPlant !== null}
        onClose={() => setDetailPlant(null)}
        onAddToBed={(p, m) => {
          const actionMap: Record<SowingMethod, PlantingAction['actionType']> = {
            indoor: 'sow_indoors',
            direct: 'direct_sow',
            transplant: 'transplant',
            overwinter: 'overwinter'
          };
          handleOpenAddModal(p, actionMap[m] || 'direct_sow');
        }}
        isCelsius={isCelsius}
        allPlants={PLANTS}
        beds={beds}
        onSelectPlant={(p) => setDetailPlant(p)}
      />

      {/* Add To Bed Modal */}
      <AddToBedModal
        plant={addToBedPlant}
        defaultMethod={addToBedMethod}
        beds={beds}
        isOpen={addToBedPlant !== null}
        onClose={() => setAddToBedPlant(null)}
        onConfirmAdd={handleConfirmAddToBed}
        onCreateNewBed={handleCreateNewBedInline}
      />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </ThemeProvider>
  );
}

