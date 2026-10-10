import React, { useState, useEffect } from 'react';
import { Calendar, Snowflake, Sun, Clock, ChevronRight, AlertCircle, Compass } from 'lucide-react';
import { LocationData, CurrentSeasonState } from '../types/garden';
import { useLanguage } from '../context/LanguageContext';
import {
  WeatherForecastResult,
  fetchWeatherForecast,
  getSimulatedScenario
} from '../services/weatherService';
import { WeatherForecastSection } from './WeatherForecastSection';

interface LocationBannerProps {
  location: LocationData;
  seasonState: CurrentSeasonState;
  onOpenLocationModal: () => void;
  selectedWeek: number;
  currentRealWeek: number;
  onResetToCurrentWeek: () => void;
  onWeekChange: (newWeek: number) => void;
  isCelsius?: boolean;
}

export const LocationBanner: React.FC<LocationBannerProps> = ({
  location,
  seasonState,
  onOpenLocationModal,
  selectedWeek,
  currentRealWeek,
  onResetToCurrentWeek,
  onWeekChange,
  isCelsius = false
}) => {
  const { t, language } = useLanguage();
  const isViewingFutureOrPast = selectedWeek !== currentRealWeek;
  const daysToFall = seasonState.daysUntilFallFrost;
  const isApproachingFallFrost = daysToFall >= 0 && daysToFall <= 21;

  // Weather Forecast Service State
  const [forecast, setForecast] = useState<WeatherForecastResult | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isWeatherExpanded, setIsWeatherExpanded] = useState(false);
  const [activeScenario, setActiveScenario] = useState<
    'live' | 'hard_freeze' | 'frost_warning' | 'heat_wave' | 'gale_storm'
  >('live');

  useEffect(() => {
    let isMounted = true;
    setIsLoadingWeather(true);
    setActiveScenario('live');

    fetchWeatherForecast(location).then((data) => {
      if (isMounted) {
        setForecast(data);
        setIsLoadingWeather(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [location.id, location.lat, location.lon]);

  const handleRefresh = async () => {
    setIsLoadingWeather(true);
    if (activeScenario === 'live') {
      const data = await fetchWeatherForecast(location, true);
      setForecast(data);
    } else {
      const data = getSimulatedScenario(location, activeScenario);
      setForecast(data);
    }
    setIsLoadingWeather(false);
  };

  const handleSelectScenario = (
    sc: 'live' | 'hard_freeze' | 'frost_warning' | 'heat_wave' | 'gale_storm'
  ) => {
    setActiveScenario(sc);
    if (sc === 'live') {
      setIsLoadingWeather(true);
      fetchWeatherForecast(location).then((data) => {
        setForecast(data);
        setIsLoadingWeather(false);
      });
    } else {
      const data = getSimulatedScenario(location, sc);
      setForecast(data);
    }
  };

  const locale = language === 'ja' ? 'ja-JP' : language === 'de' ? 'de-DE' : language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : language === 'it' ? 'it-IT' : language === 'pt' ? 'pt-PT' : 'en-US';

  return (
    <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Top Info Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1">
              <span>{location.country}</span>
              <span aria-hidden="true">·</span>
              <span>{location.region}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-stone-700 dark:text-stone-300">{location.usdaZone}</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {location.name}
              </h2>
              <button
                onClick={onOpenLocationModal}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium underline flex items-center gap-0.5"
              >
                {t('banner.change_dates', 'Change Frost Dates')} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Frost Dates Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Spring Frost */}
            <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-0.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('banner.last_spring_frost', 'Last Spring Frost')}</span>
              </div>
              <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 font-mono tabular-nums">
                {seasonState.springFrostDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
              </div>
            </div>

            {/* Fall Frost */}
            <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-0.5">
                <Snowflake className="w-3.5 h-3.5 text-sky-500" />
                <span>{t('banner.first_fall_frost', 'First Fall Frost')}</span>
              </div>
              <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 font-mono tabular-nums">
                {seasonState.fallFrostDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
              </div>
            </div>

            {/* Growing Season Length */}
            <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-0.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('banner.frost_free_window', 'Frost-Free Window')}</span>
              </div>
              <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 font-mono tabular-nums">
                {seasonState.frostFreeSeasonDays} {t('banner.days', 'days')}
              </div>
            </div>
          </div>
        </div>

        {/* Integrated Weather Forecast & Upcoming Frost / Extreme Weather Alert Section */}
        <WeatherForecastSection
          forecast={forecast}
          isLoading={isLoadingWeather}
          isCelsius={isCelsius}
          onRefresh={handleRefresh}
          onSelectScenario={handleSelectScenario}
          activeScenario={activeScenario}
          isExpanded={isWeatherExpanded}
          onToggleExpand={() => setIsWeatherExpanded((prev) => !prev)}
        />

        {/* Imminent Fall Frost Warning if fall frost is within 21 days */}
        {isApproachingFallFrost && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg flex items-start gap-3 text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <span className="font-semibold">{t('banner.imminent_frost', 'First frost is expected in approximately')} {daysToFall} {t('banner.imminent_frost_desc', 'days. Pick all mature green tomatoes and peppers, cure pumpkins/squash, and prepare frost blankets.')}</span>
            </div>
          </div>
        )}

        {/* Current Season Phase & Week Scrub Toolbar */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 dark:bg-stone-800/60 p-3 rounded-lg border border-stone-200 dark:border-stone-700">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0 mt-1 sm:mt-0" />
            <div>
              <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                {seasonState.seasonPhaseLabel}
              </span>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {seasonState.seasonPhaseDescription}
              </p>
            </div>
          </div>

          {/* Interactive Week Scrubber */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => onWeekChange(Math.max(1, selectedWeek - 1))}
              disabled={selectedWeek <= 1}
              className="px-2 py-1 text-xs border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-600 disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            <div className="text-xs font-mono tabular-nums text-stone-700 dark:text-stone-300 px-2 py-1 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded">
              {t('banner.viewing_week', 'Week')} {selectedWeek} / 52
            </div>
            <button
              onClick={() => onWeekChange(Math.min(52, selectedWeek + 1))}
              disabled={selectedWeek >= 52}
              className="px-2 py-1 text-xs border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-600 disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
            {isViewingFutureOrPast && (
              <button
                onClick={onResetToCurrentWeek}
                className="px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 rounded transition-colors whitespace-nowrap"
              >
                {t('banner.reset_today', 'Reset to Current Week')} ({selectedWeek} → {currentRealWeek})
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
