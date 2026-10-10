import React from 'react';
import {
  WeatherForecastResult,
  WeatherAlert,
  DailyForecast
} from '../services/weatherService';
import { formatTemp } from '../utils/frostCalculator';
import { useLanguage } from '../context/LanguageContext';
import {
  Snowflake,
  Sun,
  Wind,
  Droplets,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Flame,
  CloudRain,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info
} from 'lucide-react';

interface WeatherForecastSectionProps {
  forecast: WeatherForecastResult | null;
  isLoading: boolean;
  isCelsius?: boolean;
  onRefresh: () => void;
  onSelectScenario: (scenario: 'live' | 'hard_freeze' | 'frost_warning' | 'heat_wave' | 'gale_storm') => void;
  activeScenario: 'live' | 'hard_freeze' | 'frost_warning' | 'heat_wave' | 'gale_storm';
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const WeatherForecastSection: React.FC<WeatherForecastSectionProps> = ({
  forecast,
  isLoading,
  isCelsius = false,
  onRefresh,
  onSelectScenario,
  activeScenario,
  isExpanded,
  onToggleExpand,
}) => {
  const { t } = useLanguage();

  if (!forecast) {
    return null;
  }

  const primaryAlert = forecast.alerts[0];

  const getAlertStyles = (type: WeatherAlert['type']) => {
    switch (type) {
      case 'hard_freeze':
        return {
          wrapper: 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100',
          badge: 'bg-rose-600 text-white',
          iconColor: 'text-rose-600 dark:text-rose-400',
        };
      case 'freeze_warning':
        return {
          wrapper: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100',
          badge: 'bg-amber-600 text-white',
          iconColor: 'text-amber-600 dark:text-amber-400',
        };
      case 'frost_risk':
        return {
          wrapper: 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-950 dark:text-sky-100',
          badge: 'bg-sky-600 text-white',
          iconColor: 'text-sky-600 dark:text-sky-400',
        };
      case 'extreme_heat':
        return {
          wrapper: 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-950 dark:text-orange-100',
          badge: 'bg-orange-600 text-white',
          iconColor: 'text-orange-600 dark:text-orange-400',
        };
      case 'high_wind':
        return {
          wrapper: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100',
          badge: 'bg-indigo-600 text-white',
          iconColor: 'text-indigo-600 dark:text-indigo-400',
        };
      case 'heavy_rain':
      case 'storm':
        return {
          wrapper: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-800 text-cyan-950 dark:text-cyan-100',
          badge: 'bg-cyan-700 text-white',
          iconColor: 'text-cyan-600 dark:text-cyan-400',
        };
      default:
        return {
          wrapper: 'bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100',
          badge: 'bg-stone-700 text-white',
          iconColor: 'text-stone-600 dark:text-stone-300',
        };
    }
  };

  const getFrostRiskBadge = (day: DailyForecast) => {
    switch (day.frostRisk) {
      case 'hard_freeze':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white animate-pulse">
            <Snowflake className="w-2.5 h-2.5" /> Hard Freeze
          </span>
        );
      case 'frost_warning':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500 text-stone-950">
            <Snowflake className="w-2.5 h-2.5" /> Frost Alert
          </span>
        );
      case 'light_frost_risk':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
            Ground Frost Watch
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40">
            <ShieldCheck className="w-2.5 h-2.5" /> Frost-Free
          </span>
        );
    }
  };

  const currentDisplayTemp = formatTemp(forecast.current.temperatureF, isCelsius);

  return (
    <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
      
      {/* Primary Weather & Frost Risk Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50/90 dark:bg-stone-800/60 p-3 rounded-lg border border-stone-200 dark:border-stone-700">
        
        {/* Left: Current Conditions & Frost Risk Status */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-stone-200 dark:border-stone-700">
            <span className="text-2xl" role="img" aria-label={forecast.current.weatherDescription}>
              {forecast.current.weatherEmoji}
            </span>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold font-mono text-stone-900 dark:text-stone-100">
                  {currentDisplayTemp}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {forecast.current.weatherDescription}
                </span>
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2">
                <span>💨 {Math.round(forecast.current.windSpeedMph)} mph</span>
                <span>💧 {forecast.current.humidity}% hum</span>
              </div>
            </div>
          </div>

          {/* 7-Day Frost Radar Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-600 dark:text-stone-300 hidden sm:inline">
              {t('weather.frost_risk_7d', '7-Day Frost Risk Outlook')}:
            </span>
            {forecast.highestFrostRisk === 'hard_freeze' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 animate-pulse">
                <Snowflake className="w-3.5 h-3.5 text-rose-600" />
                {t('weather.hard_freeze_alert', 'Hard Freeze Warning (≤ 28°F)')}
              </span>
            )}
            {forecast.highestFrostRisk === 'frost_warning' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                <Snowflake className="w-3.5 h-3.5 text-amber-600" />
                {t('weather.frost_warning_alert', 'Frost & Freeze Alert (29–32°F)')}
              </span>
            )}
            {forecast.highestFrostRisk === 'light_frost_risk' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-800">
                <Snowflake className="w-3.5 h-3.5 text-sky-600" />
                {t('weather.ground_frost_watch', 'Ground Frost Watch (33–36°F)')}
              </span>
            )}
            {forecast.highestFrostRisk === 'none' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {t('weather.no_frost_7d', 'No frost predicted in next 7 days')}
              </span>
            )}

            {/* If simulated scenario is active */}
            {forecast.isSimulatedScenario && (
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                {forecast.scenarioName}
              </span>
            )}
          </div>
        </div>

        {/* Right: Refresh & Toggle Full 7-Day Forecast */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title={t('weather.refresh', 'Refresh Forecast')}
            className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 rounded transition-colors disabled:opacity-40"
            aria-label="Refresh weather data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onToggleExpand}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-stone-200/80 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
          >
            <span>
              {isExpanded
                ? t('weather.hide_7day', 'Hide 7-Day Forecast')
                : t('weather.view_7day', '7-Day Weather & Garden Risks')}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Extreme Weather / Frost Risk Alert Card (if any alerts triggered) */}
      {primaryAlert && (
        <div
          className={`mt-3 p-3.5 rounded-lg border transition-all ${getAlertStyles(primaryAlert.type).wrapper}`}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div className={`p-1.5 rounded-md bg-white/80 dark:bg-stone-900/80 shrink-0 mt-0.5 ${getAlertStyles(primaryAlert.type).iconColor}`}>
              {primaryAlert.type === 'hard_freeze' || primaryAlert.type === 'freeze_warning' ? (
                <Snowflake className="w-5 h-5" />
              ) : primaryAlert.type === 'extreme_heat' ? (
                <Flame className="w-5 h-5" />
              ) : primaryAlert.type === 'high_wind' ? (
                <Wind className="w-5 h-5" />
              ) : primaryAlert.type === 'heavy_rain' ? (
                <CloudRain className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded text-white shadow-xs bg-rose-600">
                  {primaryAlert.severity.toUpperCase()} ALERT
                </span>
                <h4 className="text-sm font-bold">{primaryAlert.title}</h4>
                <span className="text-xs opacity-75 font-mono">
                  Target: {primaryAlert.projectedMetric}
                </span>
              </div>

              <p className="text-xs leading-relaxed mb-2 opacity-90 font-medium">
                {primaryAlert.summary} {primaryAlert.detail}
              </p>

              {/* Plant impact & Action tip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-current/15">
                <div>
                  <span className="font-semibold block mb-0.5">🌱 Plant Vulnerability:</span>
                  <span className="opacity-90">{primaryAlert.plantImpact}</span>
                </div>
                <div>
                  <span className="font-semibold block mb-0.5">🛡️ Recommended Protection:</span>
                  <span className="opacity-90">{primaryAlert.actionTip}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expandable 7-Day Detailed Forecast & Scenarios */}
      {isExpanded && (
        <div className="mt-3 p-4 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header Strip with Live status & Scenario Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-3 border-b border-stone-200 dark:border-stone-700 text-xs">
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <span className={`w-2 h-2 rounded-full ${forecast.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-purple-500'}`} />
              <span className="font-medium text-stone-700 dark:text-stone-300">
                {forecast.isLive ? t('weather.live_radar', 'Live Open-Meteo Radar') : 'Scenario Simulation Mode'}
              </span>
              <span>·</span>
              <span className="text-[11px]">
                {forecast.isLive ? `Updated ${forecast.lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : forecast.scenarioName}
              </span>
            </div>

            {/* Test Simulation Controls */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mr-1">
                {t('weather.scenarios', 'Test Scenarios')}:
              </span>
              <button
                onClick={() => onSelectScenario('live')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  activeScenario === 'live'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:bg-stone-100'
                }`}
              >
                📡 Live
              </button>
              <button
                onClick={() => onSelectScenario('hard_freeze')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  activeScenario === 'hard_freeze'
                    ? 'bg-rose-600 text-white font-medium'
                    : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:bg-stone-100'
                }`}
              >
                ❄️ 26°F Hard Freeze
              </button>
              <button
                onClick={() => onSelectScenario('frost_warning')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  activeScenario === 'frost_warning'
                    ? 'bg-amber-600 text-white font-medium'
                    : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:bg-stone-100'
                }`}
              >
                🍂 30°F Fall Frost
              </button>
              <button
                onClick={() => onSelectScenario('heat_wave')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  activeScenario === 'heat_wave'
                    ? 'bg-orange-600 text-white font-medium'
                    : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:bg-stone-100'
                }`}
              >
                🔥 99°F Heat Wave
              </button>
              <button
                onClick={() => onSelectScenario('gale_storm')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  activeScenario === 'gale_storm'
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:bg-stone-100'
                }`}
              >
                🌪️ 48mph Gale
              </button>
            </div>
          </div>

          {/* 7-Day Weather Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {forecast.daily.map((day, idx) => {
              const isToday = idx === 0;
              const minDisplay = formatTemp(day.minTempF, isCelsius);
              const maxDisplay = formatTemp(day.maxTempF, isCelsius);

              const isDangerCold = day.minTempF <= 32;
              const isDangerHot = day.maxTempF >= 92;

              return (
                <div
                  key={day.date}
                  className={`p-2.5 rounded-lg border flex flex-col justify-between transition-colors ${
                    isToday
                      ? 'bg-white dark:bg-stone-900 border-emerald-500/60 dark:border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/20'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700/80 hover:border-stone-300 dark:hover:border-stone-600'
                  }`}
                >
                  {/* Day Header */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isToday ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-800 dark:text-stone-200'}`}>
                        {day.dayName}
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                        {day.date.slice(5)}
                      </span>
                    </div>

                    {/* Condition Emoji & Label */}
                    <div className="flex items-center gap-1.5 my-1.5">
                      <span className="text-xl" role="img" aria-label={day.weatherDescription}>
                        {day.weatherEmoji}
                      </span>
                      <span className="text-[11px] text-stone-600 dark:text-stone-400 truncate">
                        {day.weatherDescription}
                      </span>
                    </div>
                  </div>

                  {/* Temperature Bar */}
                  <div className="my-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-baseline justify-between font-mono text-xs font-semibold">
                      <span className={isDangerHot ? 'text-orange-600 dark:text-orange-400 font-bold' : 'text-stone-900 dark:text-stone-100'}>
                        {maxDisplay}
                      </span>
                      <span className="text-[10px] text-stone-400">/</span>
                      <span className={isDangerCold ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-stone-500 dark:text-stone-400'}>
                        {minDisplay}
                      </span>
                    </div>

                    {/* Visual Temp Mini Gradient Bar */}
                    <div className="h-1 rounded-full bg-stone-100 dark:bg-stone-800 my-1 overflow-hidden flex">
                      <div
                        className={`h-full ${
                          isDangerCold
                            ? 'bg-sky-500'
                            : isDangerHot
                            ? 'bg-orange-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(20, (day.maxTempF - 20) * 1.2))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Frost Risk Status Badge */}
                  <div className="mb-2">
                    {getFrostRiskBadge(day)}
                  </div>

                  {/* Precipitation & Wind Footers */}
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
                    <span className="flex items-center gap-0.5">
                      <Droplets className="w-2.5 h-2.5 text-sky-500" />
                      {day.precipitationProbability}%
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Wind className="w-2.5 h-2.5 text-stone-400" />
                      {Math.round(day.windGustMph)}m
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actionable Botanical Protection Checklist */}
          <div className="mt-3.5 p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('weather.action_tips', 'Garden Protection Advice for Upcoming Forecast')}:</span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-emerald-950 dark:text-emerald-200">
              {forecast.highestFrostRisk === 'hard_freeze' && (
                <>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span><strong>Strip Harvest All Tender Crops:</strong> Pick tomatoes (even green ones will ripen in paper bags), peppers, eggplant, and melons before the freeze.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span><strong>Insulate Root Crops:</strong> Apply 4–6 inches of straw or leaf mulch over carrots, beets, and parsnips so the ground doesn't freeze solid.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span><strong>Drain Drip Irrigation:</strong> Disconnect hoses, drain timers, and blow out irrigation lines before temperatures drop below 28°F.</span>
                  </li>
                </>
              )}
              {forecast.highestFrostRisk === 'frost_warning' && (
                <>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><strong>Cover Tender Beds Before Sunset:</strong> Drape frost blankets or floating row cover over hoops. Seal edges to trap radiant ground warmth.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><strong>Water Soil in the Afternoon:</strong> Moist soil retains up to 4x more heat than dry soil, radiating warmth upward through plant canopies overnight.</span>
                  </li>
                </>
              )}
              {forecast.highestFrostRisk === 'light_frost_risk' && (
                <>
                  <li className="flex items-start gap-1.5">
                    <span className="text-sky-600 font-bold">•</span>
                    <span><strong>Watch Low-Lying Cold Pockets:</strong> Cold air flows downhill like water. Beds at bottom slopes or walled corners frost first.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-sky-600 font-bold">•</span>
                    <span><strong>Cold-Hardy Greens are Safe:</strong> Kale, spinach, carrots, and mache thrive and generate protective plant sugars below 36°F.</span>
                  </li>
                </>
              )}
              {forecast.highestFrostRisk === 'none' && (
                <>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Favorable Growing Window:</strong> Temperatures remain safely above freezing. Ideal for active transplanting and succession sowing.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Maintain Soil Moisture:</strong> Water according to weekly rainfall totals ({forecast.daily.reduce((sum, d) => sum + d.precipitationInches, 0).toFixed(1)}" predicted this week).</span>
                  </li>
                </>
              )}
            </ul>
          </div>

        </div>
      )}

    </div>
  );
};
