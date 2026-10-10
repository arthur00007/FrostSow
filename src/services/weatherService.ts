import { LocationData } from '../types/garden';

export type FrostRiskLevel = 'none' | 'light_frost_risk' | 'frost_warning' | 'hard_freeze';

export type WeatherAlertType =
  | 'hard_freeze'
  | 'freeze_warning'
  | 'frost_risk'
  | 'extreme_heat'
  | 'high_wind'
  | 'heavy_rain'
  | 'storm';

export interface WeatherAlert {
  id: string;
  type: WeatherAlertType;
  severity: 'critical' | 'warning' | 'advisory';
  title: string;
  summary: string;
  detail: string;
  actionTip: string;
  plantImpact: string;
  effectiveDate: string; // e.g. "Tuesday, Oct 14"
  projectedMetric: string; // e.g. "27°F (-3°C)"
}

export interface DailyForecast {
  date: string; // "YYYY-MM-DD"
  dayName: string; // "Today", "Mon", "Tue"
  fullDateLabel: string;
  weatherCode: number;
  weatherDescription: string;
  weatherEmoji: string;
  minTempF: number;
  maxTempF: number;
  minTempC: number;
  maxTempC: number;
  precipitationProbability: number;
  precipitationInches: number;
  windSpeedMph: number;
  windGustMph: number;
  frostRisk: FrostRiskLevel;
  frostRiskLabel: string;
  isBelowFreezing: boolean;
}

export interface CurrentWeather {
  temperatureF: number;
  temperatureC: number;
  apparentTempF: number;
  apparentTempC: number;
  weatherCode: number;
  weatherDescription: string;
  weatherEmoji: string;
  humidity: number;
  windSpeedMph: number;
  time: string;
}

export interface WeatherForecastResult {
  locationName: string;
  lat: number;
  lon: number;
  current: CurrentWeather;
  daily: DailyForecast[];
  alerts: WeatherAlert[];
  highestFrostRisk: FrostRiskLevel;
  daysWithFrostRiskCount: number;
  isLive: boolean;
  isSimulatedScenario?: boolean;
  scenarioName?: string;
  lastFetched: Date;
  errorMessage?: string;
}

// In-memory cache to avoid duplicate API calls within 15 minutes
interface CacheEntry {
  timestamp: number;
  data: WeatherForecastResult;
}
const weatherCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 mins

/**
 * Maps standard WMO Weather interpretation codes (0-99)
 */
export function getWmoWeatherInfo(code: number): { label: string; emoji: string } {
  switch (code) {
    case 0:
      return { label: 'Clear Sky', emoji: '☀️' };
    case 1:
      return { label: 'Mainly Clear', emoji: '🌤️' };
    case 2:
      return { label: 'Partly Cloudy', emoji: '⛅' };
    case 3:
      return { label: 'Overcast', emoji: '☁️' };
    case 45:
    case 48:
      return { label: 'Fog & Mist', emoji: '🌫️' };
    case 51:
      return { label: 'Light Drizzle', emoji: '🌦️' };
    case 53:
      return { label: 'Moderate Drizzle', emoji: '🌦️' };
    case 55:
      return { label: 'Dense Drizzle', emoji: '🌧️' };
    case 56:
    case 57:
      return { label: 'Freezing Drizzle', emoji: '🧊' };
    case 61:
      return { label: 'Slight Rain', emoji: '🌦️' };
    case 63:
      return { label: 'Moderate Rain', emoji: '🌧️' };
    case 65:
      return { label: 'Heavy Rain', emoji: '🌧️' };
    case 66:
    case 67:
      return { label: 'Freezing Rain', emoji: '❄️' };
    case 71:
      return { label: 'Slight Snowfall', emoji: '🌨️' };
    case 73:
      return { label: 'Moderate Snowfall', emoji: '❄️' };
    case 75:
      return { label: 'Heavy Snowfall', emoji: '🌨️' };
    case 77:
      return { label: 'Snow Grains', emoji: '❄️' };
    case 80:
    case 81:
    case 82:
      return { label: 'Rain Showers', emoji: '🌦️' };
    case 85:
    case 86:
      return { label: 'Snow Showers', emoji: '🌨️' };
    case 95:
      return { label: 'Thunderstorm', emoji: '⛈️' };
    case 96:
    case 99:
      return { label: 'Thunderstorm with Hail', emoji: '⛈️' };
    default:
      return { label: 'Partly Cloudy', emoji: '⛅' };
  }
}

/**
 * Evaluates minimum overnight temperature to determine microclimate frost risk.
 */
export function evaluateFrostRisk(minTempF: number): {
  level: FrostRiskLevel;
  label: string;
} {
  if (minTempF <= 28) {
    return { level: 'hard_freeze', label: 'Hard Freeze (≤ 28°F)' };
  }
  if (minTempF <= 32) {
    return { level: 'frost_warning', label: 'Frost / Freeze (29–32°F)' };
  }
  if (minTempF <= 36) {
    return { level: 'light_frost_risk', label: 'Ground Frost Risk (33–36°F)' };
  }
  return { level: 'none', label: 'No Frost Risk' };
}

/**
 * Derives botanical alerts from 7-day forecast series
 */
export function generateGardenWeatherAlerts(daily: DailyForecast[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  // 1. Frost & Freeze Alerts
  for (const day of daily) {
    if (day.frostRisk === 'hard_freeze') {
      alerts.push({
        id: `hard-freeze-${day.date}`,
        type: 'hard_freeze',
        severity: 'critical',
        title: `Hard Freeze Warning (${day.dayName})`,
        summary: `Overnight low dropping to ${Math.round(day.minTempF)}°F (${Math.round(day.minTempC)}°C) on ${day.fullDateLabel}.`,
        detail: `Severe freezing will cause ice crystals to rupture plant cell membranes. Even cold-tolerant crops will suffer foliage damage unless protected.`,
        plantImpact: `Killing frost for all tender crops (tomatoes, peppers, basil, zucchini, cucumbers). Semi-hardy greens (chard, lettuce) need heavy cover.`,
        actionTip: `Harvest all remaining tender fruits now. Apply 4–6" straw mulch over root crops (carrots, beets). Cover beds with double floating row cover or greenhouse plastic before dusk.`,
        effectiveDate: day.fullDateLabel,
        projectedMetric: `${Math.round(day.minTempF)}°F / ${Math.round(day.minTempC)}°C`,
      });
      break; // Show most imminent or primary
    }
  }

  // Freeze warning (29-32°F) if no hard freeze or separate day
  for (const day of daily) {
    if (day.frostRisk === 'frost_warning' && !alerts.some(a => a.id === `hard-freeze-${day.date}`)) {
      alerts.push({
        id: `freeze-warning-${day.date}`,
        type: 'freeze_warning',
        severity: 'warning',
        title: `Frost & Freeze Alert (${day.dayName})`,
        summary: `Temperatures dipping to ${Math.round(day.minTempF)}°F (${Math.round(day.minTempC)}°C) overnight on ${day.fullDateLabel}.`,
        detail: `Freezing temperatures at plant canopy height will terminate active vegetative growth on warm-season crops.`,
        plantImpact: `Lethal to tender summer crops. Cold-hardy brassicas (kale, collards, Brussels sprouts) and spinach will survive and become sweeter.`,
        actionTip: `Drape frost fabric (Agribon or fleece) over hoops, weighing edges to the ground with stones. Move tender potted plants indoors. Water soil earlier in the day to enhance thermal absorption.`,
        effectiveDate: day.fullDateLabel,
        projectedMetric: `${Math.round(day.minTempF)}°F / ${Math.round(day.minTempC)}°C`,
      });
      break;
    }
  }

  // Light Frost Risk (33-36°F)
  for (const day of daily) {
    if (day.frostRisk === 'light_frost_risk' && alerts.length === 0) {
      alerts.push({
        id: `frost-risk-${day.date}`,
        type: 'frost_risk',
        severity: 'advisory',
        title: `Ground Frost Advisory (${day.dayName})`,
        summary: `Forecast low of ${Math.round(day.minTempF)}°F (${Math.round(day.minTempC)}°C) on ${day.fullDateLabel}.`,
        detail: `Under clear skies and calm winds, radiational ground cooling can chill soil level 3°F to 5°F colder than official ambient air sensors, creating patchy white frost.`,
        plantImpact: `May singe delicate young seedlings, cucumber leaves, and tender flowering tops.`,
        actionTip: `Keep lightweight row covers or inverted buckets ready for sensitive plants in low-lying garden hollows where cold air pools.`,
        effectiveDate: day.fullDateLabel,
        projectedMetric: `${Math.round(day.minTempF)}°F / ${Math.round(day.minTempC)}°C`,
      });
      break;
    }
  }

  // 2. Extreme Heat Alert (Max temp ≥ 92°F)
  for (const day of daily) {
    if (day.maxTempF >= 92) {
      alerts.push({
        id: `heat-warning-${day.date}`,
        type: 'extreme_heat',
        severity: day.maxTempF >= 98 ? 'critical' : 'warning',
        title: `Extreme Heat Warning (${day.dayName})`,
        summary: `Highs soaring to ${Math.round(day.maxTempF)}°F (${Math.round(day.maxTempC)}°C) on ${day.fullDateLabel}.`,
        detail: `Intense heat accelerates plant evapotranspiration, causes pollen sterility in flowering nightshades, and scorches exposed foliage.`,
        plantImpact: `Tomatoes & peppers drop blossoms without setting fruit; cilantro and spinach will bolt to seed; shallow-rooted greens wilt quickly.`,
        actionTip: `Erect 30%–40% shade cloth over vulnerable beds. Irrigate deeply before 8:00 AM so roots take up moisture before heat peaks. Avoid overhead wetting in full afternoon sun.`,
        effectiveDate: day.fullDateLabel,
        projectedMetric: `${Math.round(day.maxTempF)}°F / ${Math.round(day.maxTempC)}°C`,
      });
      break;
    }
  }

  // 3. High Wind / Gale Alert (Gusts ≥ 35 mph)
  for (const day of daily) {
    if (day.windGustMph >= 35) {
      alerts.push({
        id: `wind-warning-${day.date}`,
        type: 'high_wind',
        severity: day.windGustMph >= 45 ? 'critical' : 'warning',
        title: `High Wind Warning (${day.dayName})`,
        summary: `Gusts reaching ${Math.round(day.windGustMph)} mph (${Math.round(day.windGustMph * 1.609)} km/h) on ${day.fullDateLabel}.`,
        detail: `Severe wind gusts can uproot trellises, snap heavy tomato vine leaders, shred broad squash leaves, and dislodge floating row covers.`,
        plantImpact: `Risk of snapped trellises, wind desiccation on young leaves, and toppled indeterminate tomato cages.`,
        actionTip: `Secure stakes and bamboo tripods with extra guy-lines. Batten down garden hoops with heavy bricks or earth pins. Harvest heavy dangling squashes or melons before gusts hit.`,
        effectiveDate: day.fullDateLabel,
        projectedMetric: `${Math.round(day.windGustMph)} mph gusts`,
      });
      break;
    }
  }

  // 4. Heavy Rain Alert (Rain ≥ 1.25 inches)
  for (const day of daily) {
    if (day.precipitationInches >= 1.25) {
      alerts.push({
        id: `heavy-rain-${day.date}`,
        type: 'heavy_rain',
        severity: 'advisory',
        title: `Heavy Rain Alert (${day.dayName})`,
        summary: `Excess rainfall predicted at ${day.precipitationInches.toFixed(1)}" (${Math.round(day.precipitationInches * 25.4)} mm) on ${day.fullDateLabel}.`,
        detail: `Heavy deluge can saturate bed soil, leach soluble nitrogen nutrients, and trigger fruit cracking or blossom end rot in ripening tomatoes.`,
        plantImpact: `Waterlogging in in-ground clay beds; skin cracking on ripe tomatoes; splash-borne fungal spore dispersion (early blight).`,
        actionTip: `Turn off automated irrigation timers. Pick ripe and blushing tomatoes before rain begins. Ensure pathway trenches allow runoff away from raised bed foundations.`,
        effectiveDate: day.fullDateLabel,
        projectedMetric: `${day.precipitationInches.toFixed(1)}" rain`,
      });
      break;
    }
  }

  // 5. Severe Thunderstorm / Hail Risk (WMO 95, 96, 99)
  for (const day of daily) {
    if ([95, 96, 99].includes(day.weatherCode)) {
      alerts.push({
        id: `storm-warning-${day.date}`,
        type: 'storm',
        severity: day.weatherCode >= 96 ? 'critical' : 'warning',
        title: day.weatherCode >= 96 ? `Severe Storm & Hail Risk (${day.dayName})` : `Thunderstorm Advisory (${day.dayName})`,
        summary: `Storm systems forecasted on ${day.fullDateLabel} with potential for hail and downpours.`,
        detail: `Hailstones can shred large leaves, bruise fruit, and break tender stems in minutes.`,
        plantImpact: `Severe mechanical foliage damage to brassicas, cucurbits, and tomatoes.`,
        actionTip: `Deploy wire mesh or durable shade cloth over high-value garden beds as an emergency hail shield.`,
        effectiveDate: day.fullDateLabel,
        projectedMetric: day.weatherDescription,
      });
      break;
    }
  }

  return alerts;
}

/**
 * Fetches real weather from Open-Meteo for the user's location
 */
export async function fetchWeatherForecast(
  location: LocationData,
  forceRefresh = false
): Promise<WeatherForecastResult> {
  const lat = location.lat ?? 41.8781;
  const lon = location.lon ?? -87.6298;
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;

  if (!forceRefresh) {
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Weather service responded with status ${res.status}`);
    }

    const data = await res.json();
    const currentRaw = data.current || {};
    const dailyRaw = data.daily || {};

    const currentWeatherCode = currentRaw.weather_code ?? 0;
    const currentWmo = getWmoWeatherInfo(currentWeatherCode);

    const current: CurrentWeather = {
      temperatureF: currentRaw.temperature_2m ?? 65,
      temperatureC: Math.round((((currentRaw.temperature_2m ?? 65) - 32) * 5) / 9),
      apparentTempF: currentRaw.apparent_temperature ?? currentRaw.temperature_2m ?? 65,
      apparentTempC: Math.round((((currentRaw.apparent_temperature ?? 65) - 32) * 5) / 9),
      weatherCode: currentWeatherCode,
      weatherDescription: currentWmo.label,
      weatherEmoji: currentWmo.emoji,
      humidity: currentRaw.relative_humidity_2m ?? 50,
      windSpeedMph: currentRaw.wind_speed_10m ?? 8,
      time: currentRaw.time ?? new Date().toISOString(),
    };

    const dates: string[] = dailyRaw.time || [];
    const daily: DailyForecast[] = dates.map((dateStr, idx) => {
      const wCode = dailyRaw.weather_code?.[idx] ?? 0;
      const wInfo = getWmoWeatherInfo(wCode);
      const minF = dailyRaw.temperature_2m_min?.[idx] ?? 45;
      const maxF = dailyRaw.temperature_2m_max?.[idx] ?? 65;
      const precipProb = dailyRaw.precipitation_probability_max?.[idx] ?? 0;
      const precipInches = dailyRaw.precipitation_sum?.[idx] ?? 0;
      const windSpeed = dailyRaw.wind_speed_10m_max?.[idx] ?? 10;
      const windGust = dailyRaw.wind_gusts_10m_max?.[idx] ?? 15;

      const dateObj = new Date(dateStr + 'T12:00:00');
      const isToday = idx === 0;
      const dayName = isToday
        ? 'Today'
        : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDateLabel = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      const frostEval = evaluateFrostRisk(minF);

      return {
        date: dateStr,
        dayName,
        fullDateLabel,
        weatherCode: wCode,
        weatherDescription: wInfo.label,
        weatherEmoji: wInfo.emoji,
        minTempF: minF,
        maxTempF: maxF,
        minTempC: Math.round(((minF - 32) * 5) / 9),
        maxTempC: Math.round(((maxF - 32) * 5) / 9),
        precipitationProbability: precipProb,
        precipitationInches: precipInches,
        windSpeedMph: windSpeed,
        windGustMph: windGust,
        frostRisk: frostEval.level,
        frostRiskLabel: frostEval.label,
        isBelowFreezing: minF <= 32,
      };
    });

    const alerts = generateGardenWeatherAlerts(daily);

    let highestFrostRisk: FrostRiskLevel = 'none';
    let daysWithFrostRiskCount = 0;

    for (const d of daily) {
      if (d.frostRisk === 'hard_freeze') {
        highestFrostRisk = 'hard_freeze';
        daysWithFrostRiskCount++;
      } else if (d.frostRisk === 'frost_warning') {
        if (highestFrostRisk !== 'hard_freeze') highestFrostRisk = 'frost_warning';
        daysWithFrostRiskCount++;
      } else if (d.frostRisk === 'light_frost_risk') {
        if (highestFrostRisk === 'none') highestFrostRisk = 'light_frost_risk';
        daysWithFrostRiskCount++;
      }
    }

    const result: WeatherForecastResult = {
      locationName: location.name,
      lat,
      lon,
      current,
      daily,
      alerts,
      highestFrostRisk,
      daysWithFrostRiskCount,
      isLive: true,
      lastFetched: new Date(),
    };

    weatherCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  } catch (error) {
    console.warn('Weather fetch failed, falling back to seasonal projection:', error);
    return getFallbackSeasonalForecast(location, error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * Resilient fallback projection when offline or API is inaccessible
 */
export function getFallbackSeasonalForecast(
  location: LocationData,
  errorMessage?: string
): WeatherForecastResult {
  const lat = location.lat ?? 41.8781;
  const lon = location.lon ?? -87.6298;
  const now = new Date();

  // Approximate baseline temperature based on USDA zone number and month
  const zoneNum = parseInt(location.usdaZone.replace(/\D/g, '') || '6', 10);
  const month = now.getMonth(); // 0-11
  
  // Summer peak around month 6, 7 (July/August)
  // Winter trough around month 0, 1 (January/February)
  const seasonFactor = Math.sin(((month - 3) / 12) * 2 * Math.PI); // -1 in Jan, 1 in July
  const baseAvg = 30 + zoneNum * 5 + seasonFactor * 25; // Zone 6 in Oct ~ 55F
  
  const daily: DailyForecast[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() + i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const dayName = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const fullDateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    // Slight variance
    const variance = Math.sin(i * 1.5) * 6;
    const maxF = Math.round(baseAvg + 10 + variance);
    const minF = Math.round(baseAvg - 10 + variance);

    const frostEval = evaluateFrostRisk(minF);
    const wCode = minF <= 32 ? (Math.random() > 0.5 ? 71 : 2) : 1;
    const wInfo = getWmoWeatherInfo(wCode);

    return {
      date: dateStr,
      dayName,
      fullDateLabel,
      weatherCode: wCode,
      weatherDescription: wInfo.label,
      weatherEmoji: wInfo.emoji,
      minTempF: minF,
      maxTempF: maxF,
      minTempC: Math.round(((minF - 32) * 5) / 9),
      maxTempC: Math.round(((maxF - 32) * 5) / 9),
      precipitationProbability: 20 + i * 5,
      precipitationInches: 0.05,
      windSpeedMph: 8 + (i % 4),
      windGustMph: 15 + (i % 5),
      frostRisk: frostEval.level,
      frostRiskLabel: frostEval.label,
      isBelowFreezing: minF <= 32,
    };
  });

  const alerts = generateGardenWeatherAlerts(daily);
  let highestFrostRisk: FrostRiskLevel = 'none';
  let daysWithFrostRiskCount = 0;

  for (const d of daily) {
    if (d.frostRisk === 'hard_freeze') {
      highestFrostRisk = 'hard_freeze';
      daysWithFrostRiskCount++;
    } else if (d.frostRisk === 'frost_warning') {
      if (highestFrostRisk !== 'hard_freeze') highestFrostRisk = 'frost_warning';
      daysWithFrostRiskCount++;
    } else if (d.frostRisk === 'light_frost_risk') {
      if (highestFrostRisk === 'none') highestFrostRisk = 'light_frost_risk';
      daysWithFrostRiskCount++;
    }
  }

  const currentF = Math.round(daily[0].maxTempF - 4);

  return {
    locationName: location.name,
    lat,
    lon,
    current: {
      temperatureF: currentF,
      temperatureC: Math.round(((currentF - 32) * 5) / 9),
      apparentTempF: currentF,
      apparentTempC: Math.round(((currentF - 32) * 5) / 9),
      weatherCode: daily[0].weatherCode,
      weatherDescription: daily[0].weatherDescription,
      weatherEmoji: daily[0].weatherEmoji,
      humidity: 55,
      windSpeedMph: daily[0].windSpeedMph,
      time: now.toISOString(),
    },
    daily,
    alerts,
    highestFrostRisk,
    daysWithFrostRiskCount,
    isLive: false,
    lastFetched: now,
    errorMessage: errorMessage || 'Offline mode: displaying USDA zone historical seasonal forecast.',
  };
}

/**
 * Built-in garden scenario simulator so users can test how their LocationBanner responds
 * to upcoming frost risks and extreme weather warnings in any season!
 */
export function getSimulatedScenario(
  location: LocationData,
  scenario: 'hard_freeze' | 'frost_warning' | 'heat_wave' | 'gale_storm'
): WeatherForecastResult {
  const now = new Date();
  const lat = location.lat ?? 41.8781;
  const lon = location.lon ?? -87.6298;

  let currentF = 60;
  let currentCode = 2;
  let scenarioName = 'Simulated Test';

  const daily: DailyForecast[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() + i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const dayName = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const fullDateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    let minF = 50;
    let maxF = 70;
    let wCode = 1;
    let precipProb = 10;
    let precipInches = 0;
    let windGust = 12;

    if (scenario === 'hard_freeze') {
      scenarioName = 'Hard Freeze Warning (26°F)';
      currentF = 38;
      currentCode = 3;
      if (i === 1 || i === 2) {
        minF = 26; // Hard Freeze!
        maxF = 44;
        wCode = 0; // Clear radiative night
        windGust = 18;
      } else if (i === 0) {
        minF = 34;
        maxF = 52;
      } else {
        minF = 38;
        maxF = 56;
      }
    } else if (scenario === 'frost_warning') {
      scenarioName = 'First Autumn Frost Watch (31°F)';
      currentF = 46;
      currentCode = 1;
      if (i === 2) {
        minF = 30; // Freeze warning
        maxF = 55;
        wCode = 0;
      } else if (i === 3) {
        minF = 34; // Light frost
        maxF = 58;
      } else {
        minF = 42;
        maxF = 62;
      }
    } else if (scenario === 'heat_wave') {
      scenarioName = 'Extreme Heat Wave (99°F)';
      currentF = 94;
      currentCode = 0;
      if (i === 1 || i === 2) {
        maxF = 99; // Extreme Heat!
        minF = 76;
        wCode = 0;
      } else {
        maxF = 93;
        minF = 72;
      }
    } else if (scenario === 'gale_storm') {
      scenarioName = 'Gale Storm & Downpour (48 mph)';
      currentF = 58;
      currentCode = 95;
      if (i === 1) {
        maxF = 62;
        minF = 48;
        wCode = 95; // Thunderstorm
        precipProb = 95;
        precipInches = 2.1; // Deluge
        windGust = 48; // High wind
      } else {
        maxF = 65;
        minF = 50;
        precipProb = 30;
      }
    }

    const wInfo = getWmoWeatherInfo(wCode);
    const frostEval = evaluateFrostRisk(minF);

    return {
      date: dateStr,
      dayName,
      fullDateLabel,
      weatherCode: wCode,
      weatherDescription: wInfo.label,
      weatherEmoji: wInfo.emoji,
      minTempF: minF,
      maxTempF: maxF,
      minTempC: Math.round(((minF - 32) * 5) / 9),
      maxTempC: Math.round(((maxF - 32) * 5) / 9),
      precipitationProbability: precipProb,
      precipitationInches: precipInches,
      windSpeedMph: Math.round(windGust * 0.6),
      windGustMph: windGust,
      frostRisk: frostEval.level,
      frostRiskLabel: frostEval.label,
      isBelowFreezing: minF <= 32,
    };
  });

  const alerts = generateGardenWeatherAlerts(daily);
  let highestFrostRisk: FrostRiskLevel = 'none';
  let daysWithFrostRiskCount = 0;

  for (const d of daily) {
    if (d.frostRisk === 'hard_freeze') {
      highestFrostRisk = 'hard_freeze';
      daysWithFrostRiskCount++;
    } else if (d.frostRisk === 'frost_warning') {
      if (highestFrostRisk !== 'hard_freeze') highestFrostRisk = 'frost_warning';
      daysWithFrostRiskCount++;
    } else if (d.frostRisk === 'light_frost_risk') {
      if (highestFrostRisk === 'none') highestFrostRisk = 'light_frost_risk';
      daysWithFrostRiskCount++;
    }
  }

  const currentWmo = getWmoWeatherInfo(currentCode);

  return {
    locationName: location.name,
    lat,
    lon,
    current: {
      temperatureF: currentF,
      temperatureC: Math.round(((currentF - 32) * 5) / 9),
      apparentTempF: currentF,
      apparentTempC: Math.round(((currentF - 32) * 5) / 9),
      weatherCode: currentCode,
      weatherDescription: currentWmo.label,
      weatherEmoji: currentWmo.emoji,
      humidity: 62,
      windSpeedMph: 12,
      time: now.toISOString(),
    },
    daily,
    alerts,
    highestFrostRisk,
    daysWithFrostRiskCount,
    isLive: false,
    isSimulatedScenario: true,
    scenarioName,
    lastFetched: now,
  };
}
