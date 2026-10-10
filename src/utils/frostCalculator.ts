import { LocationData, Plant, PlantingAction, CurrentSeasonState, SowingMethod } from '../types/garden';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function parseFrostDate(monthDayStr: string, year: number): Date {
  const [monthStr, dayStr] = monthDayStr.split('-');
  const month = parseInt(monthStr, 10) - 1; // 0-indexed
  const day = parseInt(dayStr, 10);
  return new Date(year, month, day, 0, 0, 0, 0);
}

export function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getDateFromWeek(year: number, week: number): Date {
  // Simple approximation of the Monday of that week
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return ISOweekStart;
}

export function calculateSeasonState(location: LocationData, targetDate: Date): CurrentSeasonState {
  const year = targetDate.getFullYear();
  let springFrost = parseFrostDate(location.lastSpringFrost, year);
  let fallFrost = parseFrostDate(location.firstFallFrost, year);

  // If target date is past fall frost or before spring frost
  const diffSpringDays = Math.round((springFrost.getTime() - targetDate.getTime()) / MS_PER_DAY);
  const diffFallDays = Math.round((fallFrost.getTime() - targetDate.getTime()) / MS_PER_DAY);

  const isFrostFreeNow = targetDate >= springFrost && targetDate <= fallFrost;
  const frostFreeSeasonDays = Math.max(0, Math.round((fallFrost.getTime() - springFrost.getTime()) / MS_PER_DAY));
  const currentWeekNumber = getWeekNumber(targetDate);

  let seasonPhase: CurrentSeasonState['seasonPhase'] = 'summer_succession';
  let seasonPhaseLabel = 'Mid-Summer Harvest & Succession';
  let seasonPhaseDescription = 'Maintain summer vegetables, water deeply, and mulch against heat.';

  if (targetDate < springFrost) {
    if (diffSpringDays > 42) {
      seasonPhase = 'early_spring_starting';
      seasonPhaseLabel = 'Early Indoor Seed Starting';
      seasonPhaseDescription = `${Math.ceil(diffSpringDays / 7)} weeks before your final spring frost. Start slow-growing nightshades, alliums, and brassicas under lights.`;
    } else {
      seasonPhase = 'spring_planting';
      seasonPhaseLabel = 'Spring Sowing & Early Transplants';
      seasonPhaseDescription = `${Math.ceil(diffSpringDays / 7)} weeks until last spring frost. Direct sow cold-hardy peas, spinach, and harden off cold-frame brassicas.`;
    }
  } else if (targetDate <= fallFrost) {
    if (diffFallDays <= 42) {
      seasonPhase = 'late_autumn_overwintering';
      seasonPhaseLabel = 'Autumn Overwintering & Garlic Window';
      seasonPhaseDescription = `${diffFallDays} days until your average first fall frost. The prime window to plant garlic, shallots, winter greens, and cover crops.`;
    } else if (diffFallDays <= 84) {
      seasonPhase = 'late_summer_fall_planting';
      seasonPhaseLabel = 'Fall Garden Second Season';
      seasonPhaseDescription = `${Math.ceil(diffFallDays / 7)} weeks before first autumn frost. Sow fall crops like radishes, turnips, winter kale, and fast greens.`;
    } else {
      seasonPhase = 'summer_succession';
      seasonPhaseLabel = 'Peak Summer Season';
      seasonPhaseDescription = 'Tomatoes, peppers, and summer squash are fruiting. Maintain hydration and succession-sow cilantro or bush beans.';
    }
  } else {
    // After fall frost
    seasonPhase = 'winter_rest';
    seasonPhaseLabel = 'Winter Rest & Garden Planning';
    seasonPhaseDescription = 'The garden is dormant outside. Protect overwintered beds, plan next season\'s varieties, and test stored seed viability.';
  }

  return {
    currentDate: targetDate,
    currentWeekNumber,
    springFrostDate: springFrost,
    fallFrostDate: fallFrost,
    daysUntilSpringFrost: diffSpringDays,
    daysUntilFallFrost: diffFallDays,
    isFrostFreeNow,
    frostFreeSeasonDays,
    seasonPhase,
    seasonPhaseLabel,
    seasonPhaseDescription,
  };
}

export function getPlantingActionsForDate(
  plants: Plant[],
  location: LocationData,
  targetDate: Date
): {
  sowIndoors: PlantingAction[];
  directSow: PlantingAction[];
  transplant: PlantingAction[];
  overwinter: PlantingAction[];
  frostWatchAlerts: PlantingAction[];
} {
  const year = targetDate.getFullYear();
  const springFrost = parseFrostDate(location.lastSpringFrost, year);
  const fallFrost = parseFrostDate(location.firstFallFrost, year);

  // Weeks relative to Spring Last Frost Date (LFD)
  // Negative = before LFD, Positive = after LFD
  const diffDaysFromLFD = (targetDate.getTime() - springFrost.getTime()) / MS_PER_DAY;
  const weeksRelativeLFD = Math.round(diffDaysFromLFD / 7);

  // Weeks before Fall First Frost Date (FFD)
  // Positive = weeks BEFORE fall frost
  const diffDaysUntilFFD = (fallFrost.getTime() - targetDate.getTime()) / MS_PER_DAY;
  const weeksBeforeFFD = Math.round(diffDaysUntilFFD / 7);

  const sowIndoors: PlantingAction[] = [];
  const directSow: PlantingAction[] = [];
  const transplant: PlantingAction[] = [];
  const overwinter: PlantingAction[] = [];
  const frostWatchAlerts: PlantingAction[] = [];

  for (const plant of plants) {
    // 1. INDOOR SEED STARTING (Spring)
    if (plant.indoorStartWeeksBeforeLFD) {
      const [maxWksBefore, minWksBefore] = plant.indoorStartWeeksBeforeLFD;
      // When target is before LFD, weeksRelativeLFD is negative, e.g. -8
      const weeksBefore = -weeksRelativeLFD;
      if (weeksBefore >= minWksBefore - 1 && weeksBefore <= maxWksBefore + 1) {
        const isOptimal = weeksBefore >= minWksBefore && weeksBefore <= maxWksBefore;
        sowIndoors.push({
          plant,
          actionType: 'sow_indoors',
          actionTitle: `Sow Seeds Indoors Under Lights`,
          urgency: isOptimal ? 'optimal' : weeksBefore > maxWksBefore ? 'early_window' : 'late_window',
          windowDescription: `${minWksBefore}-${maxWksBefore} weeks before last spring frost`,
          timingContext: `Currently ~${weeksBefore} weeks before ${springFrost.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        });
      }
    }

    // 2. SPRING DIRECT SOW
    if (plant.directSowWeeksRelativeLFD) {
      const [minWks, maxWks] = plant.directSowWeeksRelativeLFD;
      if (weeksRelativeLFD >= minWks - 1 && weeksRelativeLFD <= maxWks + 1) {
        const isOptimal = weeksRelativeLFD >= minWks && weeksRelativeLFD <= maxWks;
        directSow.push({
          plant,
          actionType: 'direct_sow',
          actionTitle: `Direct Sow Outdoors (Spring)`,
          urgency: isOptimal ? 'optimal' : weeksRelativeLFD < minWks ? 'early_window' : 'late_window',
          windowDescription: minWks < 0 
            ? `${Math.abs(minWks)}-${Math.abs(maxWks)} weeks before spring frost` 
            : `${minWks}-${maxWks} weeks after spring frost`,
          timingContext: `Soil temp min: ${plant.soilTempMinF}°F`
        });
      }
    }

    // 3. SPRING TRANSPLANT
    if (plant.transplantWeeksRelativeLFD) {
      const [minWks, maxWks] = plant.transplantWeeksRelativeLFD;
      if (weeksRelativeLFD >= minWks - 1 && weeksRelativeLFD <= maxWks + 1) {
        const isOptimal = weeksRelativeLFD >= minWks && weeksRelativeLFD <= maxWks;
        transplant.push({
          plant,
          actionType: 'transplant',
          actionTitle: `Transplant Seedlings Outdoors`,
          urgency: isOptimal ? 'optimal' : weeksRelativeLFD < minWks ? 'early_window' : 'late_window',
          windowDescription: minWks < 0 
            ? `${Math.abs(minWks)} weeks before last frost` 
            : `${minWks}-${maxWks} weeks after last frost`,
          timingContext: `Harden off starts 7-10 days first`
        });
      }
    }

    // 4. FALL DIRECT SOW (Summer/Early Autumn)
    if (plant.hasFallPlanting && plant.fallDirectSowWeeksBeforeFFD) {
      const [maxWksBefore, minWksBefore] = plant.fallDirectSowWeeksBeforeFFD;
      if (weeksBeforeFFD >= minWksBefore - 1 && weeksBeforeFFD <= maxWksBefore + 1) {
        const isOptimal = weeksBeforeFFD >= minWksBefore && weeksBeforeFFD <= maxWksBefore;
        directSow.push({
          plant,
          actionType: 'direct_sow',
          actionTitle: `Direct Sow Outdoors (Fall Harvest)`,
          urgency: isOptimal ? 'optimal' : weeksBeforeFFD > maxWksBefore ? 'early_window' : 'late_window',
          windowDescription: `${minWksBefore}-${maxWksBefore} weeks before first fall frost`,
          timingContext: `${diffDaysUntilFFD} days until first frost (${fallFrost.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
        });
      }
    }

    // 5. FALL TRANSPLANT
    if (plant.hasFallPlanting && plant.fallTransplantWeeksBeforeFFD) {
      const [maxWksBefore, minWksBefore] = plant.fallTransplantWeeksBeforeFFD;
      if (weeksBeforeFFD >= minWksBefore - 1 && weeksBeforeFFD <= maxWksBefore + 1) {
        const isOptimal = weeksBeforeFFD >= minWksBefore && weeksBeforeFFD <= maxWksBefore;
        transplant.push({
          plant,
          actionType: 'transplant',
          actionTitle: `Transplant Starts (Fall Garden)`,
          urgency: isOptimal ? 'optimal' : weeksBeforeFFD > maxWksBefore ? 'early_window' : 'late_window',
          windowDescription: `${minWksBefore}-${maxWksBefore} weeks before fall frost`,
          timingContext: `Matures in crisp cooling autumn weather`
        });
      }
    }

    // 6. OVERWINTER / GARLIC / COVER CROPS
    if (plant.overwinterWeeksBeforeFFD) {
      const [maxWksBefore, minWksBefore] = plant.overwinterWeeksBeforeFFD;
      // Can plant if within the window, or if mild autumn within 2 weeks of frost
      if (weeksBeforeFFD >= minWksBefore - 1 && weeksBeforeFFD <= maxWksBefore + 2) {
        const isOptimal = weeksBeforeFFD >= minWksBefore && weeksBeforeFFD <= maxWksBefore;
        overwinter.push({
          plant,
          actionType: 'overwinter',
          actionTitle: `Plant for Overwintering & Spring`,
          urgency: isOptimal ? 'optimal' : weeksBeforeFFD > maxWksBefore ? 'early_window' : 'late_window',
          windowDescription: `${minWksBefore}-${maxWksBefore} weeks before first frost`,
          timingContext: `Establishes roots before ground freeze, harvests next spring/summer`
        });
      }
    }

    // 7. FROST WATCH ALERTS (if plant is tender and frost is within 14 days)
    if (plant.frostTolerance === 'tender' && diffDaysUntilFFD <= 14 && diffDaysUntilFFD >= -7) {
      frostWatchAlerts.push({
        plant,
        actionType: 'direct_sow',
        actionTitle: `Harvest or Protect Tender Crop`,
        urgency: 'optimal',
        windowDescription: `First fall frost in ${Math.max(0, diffDaysUntilFFD)} days`,
        timingContext: `Will take frost damage below 32°F / 0°C. Harvest fruit or drape fabric.`
      });
    }
  }

  return {
    sowIndoors,
    directSow,
    transplant,
    overwinter,
    frostWatchAlerts
  };
}

export interface PlantTimelineBar {
  week: number; // 1-52
  action: SowingMethod | 'harvest' | null;
}

export function generatePlantYearSchedule(plant: Plant, location: LocationData, year: number): Record<number, SowingMethod[]> {
  const springFrost = parseFrostDate(location.lastSpringFrost, year);
  const fallFrost = parseFrostDate(location.firstFallFrost, year);

  const schedule: Record<number, SowingMethod[]> = {};

  for (let w = 1; w <= 52; w++) {
    const weekDate = getDateFromWeek(year, w);
    const actions: SowingMethod[] = [];

    const diffDaysLFD = (weekDate.getTime() - springFrost.getTime()) / MS_PER_DAY;
    const wksLFD = Math.round(diffDaysLFD / 7);

    const diffDaysFFD = (fallFrost.getTime() - weekDate.getTime()) / MS_PER_DAY;
    const wksBeforeFFD = Math.round(diffDaysFFD / 7);

    // Indoor
    if (plant.indoorStartWeeksBeforeLFD) {
      const [maxW, minW] = plant.indoorStartWeeksBeforeLFD;
      const wksBefore = -wksLFD;
      if (wksBefore >= minW && wksBefore <= maxW) {
        actions.push('indoor');
      }
    }

    // Direct Spring
    if (plant.directSowWeeksRelativeLFD) {
      const [minW, maxW] = plant.directSowWeeksRelativeLFD;
      if (wksLFD >= minW && wksLFD <= maxW) {
        actions.push('direct');
      }
    }

    // Direct Fall
    if (plant.hasFallPlanting && plant.fallDirectSowWeeksBeforeFFD) {
      const [maxW, minW] = plant.fallDirectSowWeeksBeforeFFD;
      if (wksBeforeFFD >= minW && wksBeforeFFD <= maxW) {
        actions.push('direct');
      }
    }

    // Transplant Spring
    if (plant.transplantWeeksRelativeLFD) {
      const [minW, maxW] = plant.transplantWeeksRelativeLFD;
      if (wksLFD >= minW && wksLFD <= maxW) {
        actions.push('transplant');
      }
    }

    // Transplant Fall
    if (plant.hasFallPlanting && plant.fallTransplantWeeksBeforeFFD) {
      const [maxW, minW] = plant.fallTransplantWeeksBeforeFFD;
      if (wksBeforeFFD >= minW && wksBeforeFFD <= maxW) {
        actions.push('transplant');
      }
    }

    // Overwinter
    if (plant.overwinterWeeksBeforeFFD) {
      const [maxW, minW] = plant.overwinterWeeksBeforeFFD;
      if (wksBeforeFFD >= minW && wksBeforeFFD <= maxW) {
        actions.push('overwinter');
      }
    }

    if (actions.length > 0) {
      schedule[w] = actions;
    }
  }

  return schedule;
}

export function formatTemp(tempF: number, isCelsius: boolean): string {
  if (isCelsius) {
    const c = Math.round(((tempF - 32) * 5) / 9);
    return `${c}°C`;
  }
  return `${tempF}°F`;
}
