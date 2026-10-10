import { GardenBed, BedMoistureLevel, WaterScheduleSetting } from '../types/garden';
import { WeatherForecastResult } from '../services/weatherService';

export interface BedWaterReminder {
  bedId: string;
  bedName: string;
  status: 'overdue' | 'due_today' | 'due_soon' | 'adequate' | 'rain_delay' | 'untracked';
  urgencyLevel: 'high' | 'medium' | 'low';
  daysSinceWatered: number | null;
  lastWateredLabel: string;
  recommendedIntervalDays: number;
  nextWaterDate: string; // YYYY-MM-DD
  nextWaterDateLabel: string;
  rainDelayActive: boolean;
  expectedRainInchesNext48h: number;
  heatAdvisoryActive: boolean;
  highTempF: number;
  botanicalReason: string;
  actionRecommendation: string;
  soilMoistureEstimate: BedMoistureLevel;
}

/**
 * Calculates days between two date strings (YYYY-MM-DD)
 */
export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffMs = d2.getTime() - d1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Returns formatted friendly relative date string
 */
export function formatRelativeWateredDate(lastWatered?: string, lastWateredTime?: string): string {
  if (!lastWatered) return 'Not recorded';

  const todayStr = new Date().toISOString().split('T')[0];
  const diffDays = getDaysDifference(lastWatered, todayStr);

  let label = '';
  if (diffDays === 0) {
    label = 'Today';
  } else if (diffDays === 1) {
    label = 'Yesterday';
  } else if (diffDays > 1) {
    label = `${diffDays} days ago`;
  } else {
    label = 'Future date';
  }

  if (lastWateredTime) {
    label += ` (${lastWateredTime})`;
  } else {
    label += ` (${lastWatered})`;
  }

  return label;
}

/**
 * Analyzes upcoming weather from Open-Meteo forecast for water requirements
 */
export function analyzeLocalWaterWeather(weather?: WeatherForecastResult | null): {
  highTempF: number;
  isHighHeat: boolean;
  rainInchesNext48h: number;
  rainProbabilityNext48h: number;
  nextRainDayLabel: string | null;
  humidity: number;
  windSpeedMph: number;
  evaporationRate: 'high' | 'moderate' | 'low';
} {
  if (!weather || !weather.daily || weather.daily.length === 0) {
    return {
      highTempF: 75,
      isHighHeat: false,
      rainInchesNext48h: 0,
      rainProbabilityNext48h: 0,
      nextRainDayLabel: null,
      humidity: 50,
      windSpeedMph: 8,
      evaporationRate: 'moderate',
    };
  }

  // Next 2 days
  const next2Days = weather.daily.slice(0, 2);
  const highTempF = Math.max(...next2Days.map((d) => d.maxTempF));
  const rainInchesNext48h = next2Days.reduce((acc, d) => acc + (d.precipitationInches || 0), 0);
  const rainProbabilityNext48h = Math.max(...next2Days.map((d) => d.precipitationProbability || 0));

  // Find first significant rain day (>= 0.25 inches) in the 7-day outlook
  const rainDay = weather.daily.find((d) => d.precipitationInches >= 0.25);
  const nextRainDayLabel = rainDay
    ? `${rainDay.dayName} (${rainDay.precipitationInches.toFixed(1)}")`
    : null;

  const currentHum = weather.current?.humidity ?? 50;
  const currentWind = weather.current?.windSpeedMph ?? 8;
  const isHighHeat = highTempF >= 86;

  let evaporationRate: 'high' | 'moderate' | 'low' = 'moderate';
  if (highTempF >= 86 || (highTempF >= 80 && currentHum < 40) || currentWind > 18) {
    evaporationRate = 'high';
  } else if (highTempF < 60 && currentHum > 65) {
    evaporationRate = 'low';
  }

  return {
    highTempF,
    isHighHeat,
    rainInchesNext48h,
    rainProbabilityNext48h,
    nextRainDayLabel,
    humidity: currentHum,
    windSpeedMph: currentWind,
    evaporationRate,
  };
}

/**
 * Calculates smart water reminder and moisture status for an individual bed
 */
export function calculateBedWaterReminder(
  bed: GardenBed,
  weather?: WeatherForecastResult | null
): BedWaterReminder {
  const todayStr = new Date().toISOString().split('T')[0];
  const weatherAnalysis = analyzeLocalWaterWeather(weather);

  // 1. Determine baseline interval in days based on Bed Type
  let baseInterval = 3;
  switch (bed.type) {
    case 'Container':
      baseInterval = 2; // Shallow soil, fast drainage
      break;
    case 'Raised Bed':
      baseInterval = 3; // Excellent drainage, slightly elevated soil temp
      break;
    case 'In-ground':
      baseInterval = 4; // High moisture retention, deep soil capillary
      break;
    case 'Greenhouse':
      baseInterval = 2; // High temp, fully sheltered from rain
      break;
    case 'Cold Frame':
      baseInterval = 3; // Sheltered, high relative humidity
      break;
  }

  // 2. Adjust for crop composition (active crops)
  const activePlants = bed.plants.filter((p) => !p.isHarvested);
  const hasHighDemandCrops = activePlants.some((p) =>
    ['cucurbits', 'nightshades', 'leafy_greens'].includes(p.category)
  );
  const hasLowDemandCrops = activePlants.length > 0 && activePlants.every((p) =>
    ['alliums', 'herbs'].includes(p.category)
  );

  if (hasHighDemandCrops) {
    baseInterval = Math.max(1, baseInterval - 1);
  } else if (hasLowDemandCrops) {
    baseInterval += 1;
  }

  // 3. User custom schedule override
  const scheduleSetting: WaterScheduleSetting = bed.waterSchedule || 'auto_weather';
  let recommendedIntervalDays = baseInterval;

  if (scheduleSetting === 'daily') {
    recommendedIntervalDays = 1;
  } else if (scheduleSetting === 'every_2_days') {
    recommendedIntervalDays = 2;
  } else if (scheduleSetting === 'every_3_days') {
    recommendedIntervalDays = 3;
  } else if (scheduleSetting === 'every_4_days') {
    recommendedIntervalDays = 4;
  } else if (scheduleSetting === 'weekly') {
    recommendedIntervalDays = 7;
  } else {
    // 'auto_weather': adapt dynamically to local weather
    if (weatherAnalysis.evaporationRate === 'high') {
      recommendedIntervalDays = Math.max(1, recommendedIntervalDays - 1);
    } else if (weatherAnalysis.evaporationRate === 'low') {
      recommendedIntervalDays += 1;
    }
  }

  // 4. Calculate days since last watered
  const daysSinceWatered = bed.lastWatered ? getDaysDifference(bed.lastWatered, todayStr) : null;
  const lastWateredLabel = formatRelativeWateredDate(bed.lastWatered, bed.lastWateredTime);

  // 5. Calculate Next Projected Water Date
  let nextWaterDate = todayStr;
  if (bed.lastWatered) {
    const lastDate = new Date(bed.lastWatered + 'T00:00:00');
    const nextDate = new Date(lastDate.getTime() + recommendedIntervalDays * 86400000);
    nextWaterDate = nextDate.toISOString().split('T')[0];
  }

  const daysUntilNext = getDaysDifference(todayStr, nextWaterDate);
  const nextWaterDateLabel =
    daysUntilNext === 0
      ? 'Today'
      : daysUntilNext === 1
      ? 'Tomorrow'
      : daysUntilNext > 1
      ? `In ${daysUntilNext} days (${nextWaterDate})`
      : daysUntilNext === -1
      ? '1 day overdue'
      : `${Math.abs(daysUntilNext)} days overdue`;

  // 6. Check natural rainfall delay
  // Sheltered beds (Greenhouse, Cold Frame) don't get outdoor rain!
  const isShelteredBed = bed.type === 'Greenhouse' || bed.type === 'Cold Frame';
  const hasSubstantialUpcomingRain =
    !isShelteredBed &&
    (weatherAnalysis.rainInchesNext48h >= 0.35 ||
      (weatherAnalysis.rainInchesNext48h >= 0.2 && weatherAnalysis.rainProbabilityNext48h >= 70));

  // 7. Determine status & soil moisture estimate
  let status: BedWaterReminder['status'] = 'adequate';
  let urgencyLevel: BedWaterReminder['urgencyLevel'] = 'low';
  let soilMoistureEstimate: BedMoistureLevel = 'moist';
  let botanicalReason = '';
  let actionRecommendation = '';

  if (daysSinceWatered === null) {
    status = 'untracked';
    urgencyLevel = 'medium';
    soilMoistureEstimate = 'moderate';
    botanicalReason = 'No watering has been recorded for this bed yet.';
    actionRecommendation = 'Check soil moisture with a finger probe 2 inches deep. Water thoroughly if dry.';
  } else if (hasSubstantialUpcomingRain && daysUntilNext <= 1) {
    status = 'rain_delay';
    urgencyLevel = 'low';
    soilMoistureEstimate = 'moist';
    botanicalReason = `Forecast predicts ${weatherAnalysis.rainInchesNext48h.toFixed(1)}" of rain in the next 48 hours (${weatherAnalysis.rainProbabilityNext48h}% chance). Natural precipitation will hydrate this open bed.`;
    actionRecommendation = 'Delay manual watering to prevent waterlogging, nutrient leaching, and root suffocation.';
  } else if (daysSinceWatered > recommendedIntervalDays) {
    status = 'overdue';
    urgencyLevel = 'high';
    soilMoistureEstimate = 'dry';
    const overdueDays = daysSinceWatered - recommendedIntervalDays;
    botanicalReason = `Last watered ${daysSinceWatered} days ago (${overdueDays} day${overdueDays > 1 ? 's' : ''} past optimal ${recommendedIntervalDays}-day schedule). ${
      weatherAnalysis.isHighHeat
        ? `High temperature (${weatherAnalysis.highTempF}°F) is accelerating soil evaporation.`
        : `${bed.type} soils require steady replenishment.`
    }`;
    actionRecommendation = 'Deeply soak the root zone until water penetrates 4–6 inches. Water early morning to minimize fungal spores.';
  } else if (daysSinceWatered === recommendedIntervalDays || daysUntilNext === 0) {
    status = 'due_today';
    urgencyLevel = 'medium';
    soilMoistureEstimate = 'moderate';
    botanicalReason = `Due for watering on the ${recommendedIntervalDays}-day cadence. ${
      weatherAnalysis.isHighHeat ? 'Warm weather detected — water before mid-day heat.' : 'Maintain consistent root zone moisture.'
    }`;
    actionRecommendation = 'Provide 0.5 to 1.0 inch of water at the plant base. Avoid wetting foliage in late afternoon.';
  } else if (daysUntilNext === 1) {
    status = 'due_soon';
    urgencyLevel = 'low';
    soilMoistureEstimate = 'moist';
    botanicalReason = `Soil moisture is still adequate from watering ${daysSinceWatered === 0 ? 'today' : daysSinceWatered === 1 ? 'yesterday' : `${daysSinceWatered} days ago`}. Next scheduled session tomorrow.`;
    actionRecommendation = 'No watering needed today unless topsoil feels parched under direct midday sun.';
  } else {
    status = 'adequate';
    urgencyLevel = 'low';
    soilMoistureEstimate = 'moist';
    botanicalReason = `Optimal hydration preserved. Next watering scheduled for ${nextWaterDate} (${recommendedIntervalDays}-day cycle).`;
    actionRecommendation = 'Allow soil surface to lightly breathe between waterings to encourage deep root growth.';
  }

  // Microclimate note for greenhouses
  if (isShelteredBed && hasSubstantialUpcomingRain) {
    botanicalReason += ` (Note: ${bed.type} is covered; natural rain will not reach these crops, so maintain indoor watering.)`;
  }

  return {
    bedId: bed.id,
    bedName: bed.name,
    status,
    urgencyLevel,
    daysSinceWatered,
    lastWateredLabel,
    recommendedIntervalDays,
    nextWaterDate,
    nextWaterDateLabel,
    rainDelayActive: status === 'rain_delay',
    expectedRainInchesNext48h: weatherAnalysis.rainInchesNext48h,
    heatAdvisoryActive: weatherAnalysis.isHighHeat,
    highTempF: weatherAnalysis.highTempF,
    botanicalReason,
    actionRecommendation,
    soilMoistureEstimate,
  };
}
