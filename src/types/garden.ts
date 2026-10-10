export type FrostTolerance = 'hardy' | 'semi-hardy' | 'tender';

export type PlantCategory = 
  | 'nightshades'
  | 'brassicas'
  | 'roots'
  | 'alliums'
  | 'legumes'
  | 'leafy_greens'
  | 'cucurbits'
  | 'herbs'
  | 'flowers'
  | 'cover_crops';

export type SowingMethod = 'indoor' | 'direct' | 'transplant' | 'overwinter';

export interface SowingWindow {
  type: SowingMethod;
  // Offset relative to Last Spring Frost (LFD) or First Fall Frost (FFD)
  // Positive = after frost, Negative = before frost
  relativeTo: 'last_spring_frost' | 'first_fall_frost';
  startWeeks: number; // e.g. -8 (8 weeks before frost)
  endWeeks: number;   // e.g. -6 (6 weeks before frost)
  notes?: string;
}

export interface Plant {
  id: string;
  name: string;
  botanicalName: string;
  category: PlantCategory;
  categoryLabel: string;
  frostTolerance: FrostTolerance;
  frostToleranceLabel: string;
  frostTempToleranceF: number; // Temperature in F where plant takes damage
  
  // Spring schedule relative to Last Spring Frost (LFD)
  indoorStartWeeksBeforeLFD?: [number, number]; // e.g. [8, 6] means 8 to 6 weeks before LFD
  transplantWeeksRelativeLFD?: [number, number]; // e.g. [1, 3] means 1 to 3 weeks after LFD; [-4, -2] for cold-hardy brassicas
  directSowWeeksRelativeLFD?: [number, number];  // e.g. [-4, -2] for peas before LFD, [1, 3] for beans after LFD

  // Fall schedule relative to First Fall Frost (FFD)
  hasFallPlanting: boolean;
  fallDirectSowWeeksBeforeFFD?: [number, number]; // e.g. [10, 8] weeks before FFD
  fallTransplantWeeksBeforeFFD?: [number, number]; // e.g. [8, 6] weeks before FFD
  overwinterWeeksBeforeFFD?: [number, number];     // e.g. [6, 3] weeks before FFD (garlic, cover crops, hardy greens)

  // Growing requirements
  soilTempMinF: number;
  soilTempOptimalF: string;
  sunlight: string;
  spacingInches: number;
  depthInches: string;
  daysToGermination: string;
  daysToMaturity: number; // typical days
  daysToMaturityRange: string;
  
  companions: string[];
  avoidCompanions: string[];
  description: string;
  gardeningTip: string;
  frostTip: string;
}

export interface LocationData {
  id: string;
  name: string;
  region: string;
  country: string;
  usdaZone: string;
  // ISO Month-Day strings "MM-DD"
  lastSpringFrost: string; // e.g. "04-15"
  firstFallFrost: string;  // e.g. "10-20"
  elevationFt?: number;
  lat?: number;
  lon?: number;
}

export interface CurrentSeasonState {
  currentDate: Date;
  currentWeekNumber: number; // 1-52
  springFrostDate: Date;
  fallFrostDate: Date;
  daysUntilSpringFrost: number; // negative if passed
  daysUntilFallFrost: number;   // negative if passed
  isFrostFreeNow: boolean;
  frostFreeSeasonDays: number;
  seasonPhase: 
    | 'early_spring_starting' 
    | 'spring_planting' 
    | 'summer_succession' 
    | 'late_summer_fall_planting' 
    | 'late_autumn_overwintering' 
    | 'winter_rest';
  seasonPhaseLabel: string;
  seasonPhaseDescription: string;
}

export interface PlantingAction {
  plant: Plant;
  actionType: 'sow_indoors' | 'direct_sow' | 'transplant' | 'overwinter';
  actionTitle: string;
  urgency: 'optimal' | 'early_window' | 'late_window';
  windowDescription: string;
  timingContext: string;
}

export type BedMoistureLevel = 'dry' | 'moderate' | 'moist' | 'saturated';
export type WaterScheduleSetting = 'auto_weather' | 'daily' | 'every_2_days' | 'every_3_days' | 'every_4_days' | 'weekly';

export interface BedWateringLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  volume?: 'light' | 'moderate' | 'deep';
  amountInches?: number;
  notes?: string;
  source?: 'manual' | 'natural_rain';
}

export interface HarvestRecord {
  id: string;
  plantId: string;
  plantName: string;
  category: PlantCategory;
  bedId: string;
  bedName: string;
  harvestDate: string; // YYYY-MM-DD
  weightLbs: number; // in pounds
  count?: number;
  notes?: string;
}

export interface GardenBed {
  id: string;
  name: string;
  type: 'Raised Bed' | 'In-ground' | 'Container' | 'Greenhouse' | 'Cold Frame';
  plants: GardenBedPlant[];
  // Water Tracking & Weather Reminders
  lastWatered?: string; // YYYY-MM-DD
  lastWateredTime?: string;
  waterSchedule?: WaterScheduleSetting;
  reminderEnabled?: boolean;
  wateringVolume?: 'light' | 'moderate' | 'deep';
  soilMoistureLevel?: BedMoistureLevel;
  wateringNotes?: string;
  wateringHistory?: BedWateringLogEntry[];
  // Harvest Logs
  harvestLogs?: HarvestRecord[];
}

export interface GardenBedPlant {
  id: string;
  plantId: string;
  plantName: string;
  category: PlantCategory;
  sownDate: string; // YYYY-MM-DD
  expectedHarvestDate: string; // YYYY-MM-DD
  method: SowingMethod;
  notes?: string;
  isHarvested?: boolean;
  harvestedDate?: string; // YYYY-MM-DD
  harvestWeightLbs?: number; // in pounds
  harvestCount?: number;
  harvestNotes?: string;
}
