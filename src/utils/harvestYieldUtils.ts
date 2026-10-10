import { GardenBed, GardenBedPlant, HarvestRecord, PlantCategory } from '../types/garden';

// Default realistic yields (in lbs) per typical harvest
export const DEFAULT_PLANT_YIELDS_LBS: Record<string, number> = {
  'garlic-hardneck': 2.0,
  'garlic-softneck': 1.8,
  'spinach': 1.2,
  'kale-lacinato': 2.2,
  'kale-curly': 2.4,
  'swiss-chard': 2.0,
  'lettuce-butterhead': 1.0,
  'lettuce-romaine': 1.3,
  'arugula': 0.8,
  'tomato-indeterminate': 8.5,
  'tomato-determinate': 6.0,
  'tomato-cherry': 4.5,
  'bell-pepper': 3.2,
  'jalapeno': 1.8,
  'eggplant': 4.0,
  'zucchini': 7.5,
  'cucumber-slicing': 4.5,
  'cucumber-pickling': 3.8,
  'bush-beans': 2.5,
  'pole-beans': 3.5,
  'sugar-snap-peas': 1.8,
  'carrots': 3.0,
  'beets': 2.5,
  'radish': 0.9,
  'broccoli': 2.8,
  'cabbage': 4.2,
  'cauliflower': 2.5,
  'basil-genovese': 0.8,
  'cilantro': 0.6,
  'parsley': 0.7,
};

export const CATEGORY_YIELD_FALLBACK_LBS: Record<PlantCategory, number> = {
  cucurbits: 5.0,
  nightshades: 5.5,
  brassicas: 3.0,
  roots: 2.5,
  alliums: 2.0,
  leafy_greens: 1.5,
  legumes: 2.2,
  herbs: 0.8,
  flowers: 0.5,
  cover_crops: 1.0,
};

export const CATEGORY_COLORS: Record<PlantCategory, string> = {
  nightshades: '#ef4444', // Red (tomatoes, peppers)
  cucurbits: '#f59e0b', // Amber/orange (squash, cucumbers)
  brassicas: '#10b981', // Emerald (kale, cabbage)
  leafy_greens: '#22c55e', // Green (spinach, lettuce)
  roots: '#f97316', // Orange (carrots, beets)
  alliums: '#8b5cf6', // Purple (garlic, onions)
  legumes: '#06b6d4', // Cyan (peas, beans)
  herbs: '#84cc16', // Lime (basil, cilantro)
  flowers: '#ec4899', // Pink
  cover_crops: '#64748b', // Slate
};

export function getEstimatedHarvestWeight(plantId: string, category: PlantCategory): number {
  if (DEFAULT_PLANT_YIELDS_LBS[plantId]) {
    return DEFAULT_PLANT_YIELDS_LBS[plantId];
  }
  return CATEGORY_YIELD_FALLBACK_LBS[category] || 2.0;
}

export function lbsToKg(lbs: number): number {
  return lbs * 0.45359237;
}

export function formatWeight(lbs: number, unit: 'lbs' | 'kg'): string {
  if (unit === 'kg') {
    return `${lbsToKg(lbs).toFixed(1)} kg`;
  }
  return `${lbs.toFixed(1)} lbs`;
}

/**
 * Extracts and consolidates all harvest records across all beds
 */
export function getAllHarvestRecords(beds: GardenBed[]): HarvestRecord[] {
  const records: HarvestRecord[] = [];

  for (const bed of beds) {
    // 1. Harvest records from completed plantings
    for (const plant of bed.plants) {
      if (plant.isHarvested) {
        const weight =
          plant.harvestWeightLbs !== undefined && plant.harvestWeightLbs > 0
            ? plant.harvestWeightLbs
            : getEstimatedHarvestWeight(plant.plantId, plant.category);

        const harvestDate =
          plant.harvestedDate ||
          plant.expectedHarvestDate ||
          new Date().toISOString().split('T')[0];

        records.push({
          id: `harvest-${plant.id}`,
          plantId: plant.plantId,
          plantName: plant.plantName,
          category: plant.category,
          bedId: bed.id,
          bedName: bed.name,
          harvestDate,
          weightLbs: weight,
          count: plant.harvestCount,
          notes: plant.harvestNotes || plant.notes,
        });
      }
    }

    // 2. Extra continuous harvest logs on the bed
    if (bed.harvestLogs && bed.harvestLogs.length > 0) {
      for (const log of bed.harvestLogs) {
        records.push({
          ...log,
          bedId: bed.id,
          bedName: bed.name,
        });
      }
    }
  }

  // Sort by harvest date ascending
  records.sort((a, b) => new Date(a.harvestDate).getTime() - new Date(b.harvestDate).getTime());
  return records;
}

/**
 * Prepares monthly aggregated harvest data for Recharts
 */
export function getMonthlyHarvestYieldData(records: HarvestRecord[], unit: 'lbs' | 'kg' = 'lbs') {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Group by month
  const monthMap: Record<number, { monthlyLbs: number; count: number }> = {};
  for (let i = 0; i < 12; i++) {
    monthMap[i] = { monthlyLbs: 0, count: 0 };
  }

  for (const rec of records) {
    const d = new Date(rec.harvestDate + 'T00:00:00');
    if (!isNaN(d.getTime())) {
      const monthIdx = d.getMonth();
      monthMap[monthIdx].monthlyLbs += rec.weightLbs;
      monthMap[monthIdx].count += 1;
    }
  }

  // Only include active garden months (e.g. from earliest harvest month to latest, or Apr-Nov default)
  let cumulativeLbs = 0;
  const result: Array<{
    month: string;
    monthIndex: number;
    weight: number;
    cumulativeWeight: number;
    count: number;
  }> = [];

  // Determine active months
  const activeMonthIndices = Object.keys(monthMap)
    .map(Number)
    .filter((m) => monthMap[m].monthlyLbs > 0);

  const startMonth = activeMonthIndices.length > 0 ? Math.min(3, Math.min(...activeMonthIndices)) : 3; // at least Apr
  const endMonth = activeMonthIndices.length > 0 ? Math.max(9, Math.max(...activeMonthIndices)) : 9; // at least Oct

  for (let m = startMonth; m <= endMonth; m++) {
    const monthlyLbs = monthMap[m].monthlyLbs;
    cumulativeLbs += monthlyLbs;
    const weightVal = unit === 'kg' ? lbsToKg(monthlyLbs) : monthlyLbs;
    const cumVal = unit === 'kg' ? lbsToKg(cumulativeLbs) : cumulativeLbs;

    result.push({
      month: monthNames[m],
      monthIndex: m,
      weight: Number(weightVal.toFixed(1)),
      cumulativeWeight: Number(cumVal.toFixed(1)),
      count: monthMap[m].count,
    });
  }

  return result;
}

/**
 * Prepares category breakdown data for Recharts
 */
export function getCategoryHarvestYieldData(records: HarvestRecord[], unit: 'lbs' | 'kg' = 'lbs') {
  const catMap: Record<string, { weightLbs: number; count: number; name: string }> = {};

  for (const rec of records) {
    if (!catMap[rec.category]) {
      catMap[rec.category] = {
        weightLbs: 0,
        count: 0,
        name: rec.category.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      };
    }
    catMap[rec.category].weightLbs += rec.weightLbs;
    catMap[rec.category].count += 1;
  }

  const result = Object.entries(catMap).map(([category, data]) => {
    const weight = unit === 'kg' ? lbsToKg(data.weightLbs) : data.weightLbs;
    return {
      category: category as PlantCategory,
      name: data.name,
      weight: Number(weight.toFixed(1)),
      rawLbs: data.weightLbs,
      count: data.count,
      fill: CATEGORY_COLORS[category as PlantCategory] || '#10b981',
    };
  });

  result.sort((a, b) => b.weight - a.weight);
  return result;
}

/**
 * Prepares crop-by-crop breakdown data for Recharts
 */
export function getCropHarvestYieldData(records: HarvestRecord[], unit: 'lbs' | 'kg' = 'lbs') {
  const cropMap: Record<string, { plantName: string; category: PlantCategory; weightLbs: number; count: number }> = {};

  for (const rec of records) {
    if (!cropMap[rec.plantName]) {
      cropMap[rec.plantName] = {
        plantName: rec.plantName,
        category: rec.category,
        weightLbs: 0,
        count: 0,
      };
    }
    cropMap[rec.plantName].weightLbs += rec.weightLbs;
    cropMap[rec.plantName].count += 1;
  }

  const result = Object.values(cropMap).map((crop) => {
    const weight = unit === 'kg' ? lbsToKg(crop.weightLbs) : crop.weightLbs;
    return {
      name: crop.plantName,
      category: crop.category,
      weight: Number(weight.toFixed(1)),
      count: crop.count,
      fill: CATEGORY_COLORS[crop.category] || '#10b981',
    };
  });

  result.sort((a, b) => b.weight - a.weight);
  return result.slice(0, 8); // Top 8 crops
}

/**
 * Prepares bed-by-bed comparison data
 */
export function getBedHarvestYieldData(records: HarvestRecord[], unit: 'lbs' | 'kg' = 'lbs') {
  const bedMap: Record<string, { bedName: string; weightLbs: number; count: number }> = {};

  for (const rec of records) {
    if (!bedMap[rec.bedName]) {
      bedMap[rec.bedName] = {
        bedName: rec.bedName,
        weightLbs: 0,
        count: 0,
      };
    }
    bedMap[rec.bedName].weightLbs += rec.weightLbs;
    bedMap[rec.bedName].count += 1;
  }

  const result = Object.values(bedMap).map((bed) => {
    const weight = unit === 'kg' ? lbsToKg(bed.weightLbs) : bed.weightLbs;
    return {
      name: bed.bedName,
      weight: Number(weight.toFixed(1)),
      count: bed.count,
    };
  });

  result.sort((a, b) => b.weight - a.weight);
  return result;
}
