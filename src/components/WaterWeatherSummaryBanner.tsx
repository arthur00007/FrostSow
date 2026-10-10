import React, { useState } from 'react';
import { GardenBed, LocationData } from '../types/garden';
import { WeatherForecastResult } from '../services/weatherService';
import {
  calculateBedWaterReminder,
  analyzeLocalWaterWeather,
  BedWaterReminder
} from '../utils/waterTrackerUtils';
import { formatTemp } from '../utils/frostCalculator';
import {
  Droplets,
  CloudRain,
  Sun,
  AlertTriangle,
  CheckCircle2,
  Bell,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';

export type BedWaterFilter = 'all' | 'needs_water' | 'adequate' | 'rain_delay';

interface WaterWeatherSummaryBannerProps {
  beds: GardenBed[];
  location: LocationData;
  weather?: WeatherForecastResult | null;
  isLoadingWeather?: boolean;
  onRefreshWeather?: () => void;
  isCelsius?: boolean;
  activeFilter: BedWaterFilter;
  onFilterChange: (filter: BedWaterFilter) => void;
  onWaterAllDueBeds: (dueBedIds: string[]) => void;
}

export const WaterWeatherSummaryBanner: React.FC<WaterWeatherSummaryBannerProps> = ({
  beds,
  location,
  weather,
  isLoadingWeather = false,
  onRefreshWeather,
  isCelsius = false,
  activeFilter,
  onFilterChange,
  onWaterAllDueBeds,
}) => {
  const [notificationPermissionState, setNotificationPermissionState] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });
  const [notificationNotice, setNotificationNotice] = useState<string | null>(null);

  const weatherAnalysis = analyzeLocalWaterWeather(weather);

  // Calculate reminders for all beds
  const reminders: BedWaterReminder[] = beds.map((b) =>
    calculateBedWaterReminder(b, weather)
  );

  const overdueBeds = reminders.filter((r) => r.status === 'overdue' || r.status === 'untracked');
  const dueTodayBeds = reminders.filter((r) => r.status === 'due_today');
  const rainDelayBeds = reminders.filter((r) => r.status === 'rain_delay');
  const adequateBeds = reminders.filter((r) => r.status === 'adequate' || r.status === 'due_soon');

  const allDueIds = [...overdueBeds, ...dueTodayBeds].map((r) => r.bedId);

  const handleEnableNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationNotice('Browser push notifications are not supported in this environment, but in-app weather alerts are active.');
      setTimeout(() => setNotificationNotice(null), 5000);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermissionState(permission);
      if (permission === 'granted') {
        setNotificationNotice('Weather watering reminders enabled! You will be notified when high heat or soil schedules trigger.');
        try {
          new Notification('FrostSow Water Tracking Active', {
            body: `Monitoring weather conditions for ${location.name}. We'll remind you when beds need hydration!`,
            icon: '/favicon.ico',
          });
        } catch {
          // ignore
        }
      } else {
        setNotificationNotice('Notification permission declined. In-app status badges will continue to guide you.');
      }
    } catch {
      setNotificationNotice('In-app weather alerts are active for all your beds.');
    }
    setTimeout(() => setNotificationNotice(null), 6000);
  };

  const currentTempDisplay = weather?.current
    ? formatTemp(weather.current.temperatureF, isCelsius)
    : '--';

  return (
    <div className="bg-gradient-to-r from-sky-900/90 via-sky-800/90 to-emerald-900/80 text-white rounded-xl p-5 shadow-sm border border-sky-700/50 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-36 h-36 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header row: Local conditions & weather context */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-xs flex items-center justify-center text-sky-200">
              <Droplets className="w-6 h-6 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
                  Weather-Adaptive Water Tracking
                </h2>
                <span className="text-[11px] font-mono bg-sky-400/20 text-sky-200 px-2 py-0.5 rounded-full border border-sky-400/30">
                  {location.name}
                </span>
              </div>
              <p className="text-xs text-sky-100/80 mt-0.5">
                Dynamic watering cadence calibrated to local precipitation, evapotranspiration, and bed construction.
              </p>
            </div>
          </div>

          {/* Right: Weather Metrics Capsule & Refresh */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2.5 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10 text-xs">
              <div className="flex items-center gap-1.5" title="Current Temperature">
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-mono font-semibold">{currentTempDisplay}</span>
              </div>
              <span className="text-white/20">|</span>
              <div className="flex items-center gap-1.5" title="Upcoming 48h Rain Forecast">
                <CloudRain className="w-3.5 h-3.5 text-sky-300" />
                <span className="font-mono">
                  {weatherAnalysis.rainInchesNext48h > 0
                    ? `${weatherAnalysis.rainInchesNext48h.toFixed(1)}" rain (48h)`
                    : 'Dry next 48h'}
                </span>
              </div>
              <span className="text-white/20">|</span>
              <div className="text-[11px] text-sky-200" title="Drying rate">
                Evap: <strong className="capitalize">{weatherAnalysis.evaporationRate}</strong>
              </div>
            </div>

            {onRefreshWeather && (
              <button
                onClick={onRefreshWeather}
                disabled={isLoadingWeather}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sky-200 hover:text-white transition-colors"
                title="Refresh local forecast"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin' : ''}`} />
              </button>
            )}

            <button
              onClick={handleEnableNotifications}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-sky-100 hover:text-white transition-colors"
              title="Configure Weather Reminders"
            >
              <Bell className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">
                {notificationPermissionState === 'granted' ? 'Alerts Active' : 'Enable Reminders'}
              </span>
            </button>
          </div>
        </div>

        {/* In-app Notification Feedback Banner if toggled */}
        {notificationNotice && (
          <div className="p-2.5 bg-sky-950/80 border border-sky-400/40 rounded-lg text-xs text-sky-200 flex items-center gap-2 animate-fadeIn">
            <Info className="w-4 h-4 text-sky-300 shrink-0" />
            <span>{notificationNotice}</span>
          </div>
        )}

        {/* Status Metrics Strip & Quick Batch Action */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-lg border border-white/10">
            <div className="text-[11px] text-sky-200/80 font-medium">Overdue / Needs Water</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-mono font-bold text-rose-300">
                {overdueBeds.length}
              </span>
              <span className="text-[11px] text-rose-200/70 font-medium">beds critical</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-lg border border-white/10">
            <div className="text-[11px] text-sky-200/80 font-medium">Due for Water Today</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-mono font-bold text-amber-300">
                {dueTodayBeds.length}
              </span>
              <span className="text-[11px] text-amber-200/70 font-medium">scheduled</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-lg border border-white/10">
            <div className="text-[11px] text-sky-200/80 font-medium">Natural Rain Delay</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-mono font-bold text-cyan-300">
                {rainDelayBeds.length}
              </span>
              <span className="text-[11px] text-cyan-200/70 font-medium">skip manual soak</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-lg border border-white/10">
            <div className="text-[11px] text-sky-200/80 font-medium">Moisture Adequate</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-mono font-bold text-emerald-300">
                {adequateBeds.length}
              </span>
              <span className="text-[11px] text-emerald-200/70 font-medium">well hydrated</span>
            </div>
          </div>
        </div>

        {/* Action & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-sky-200/80 font-medium mr-1">Filter:</span>
            <button
              onClick={() => onFilterChange('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              All Beds ({beds.length})
            </button>
            <button
              onClick={() => onFilterChange('needs_water')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeFilter === 'needs_water'
                  ? 'bg-amber-400 text-stone-950 font-semibold shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Needs Water ({allDueIds.length})
            </button>
            <button
              onClick={() => onFilterChange('rain_delay')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeFilter === 'rain_delay'
                  ? 'bg-cyan-300 text-stone-950 font-semibold shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Rain Delayed ({rainDelayBeds.length})
            </button>
            <button
              onClick={() => onFilterChange('adequate')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeFilter === 'adequate'
                  ? 'bg-emerald-400 text-stone-950 font-semibold shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Adequate ({adequateBeds.length})
            </button>
          </div>

          {/* Quick "Water All Due Beds" Action Button */}
          {allDueIds.length > 0 && (
            <button
              onClick={() => onWaterAllDueBeds(allDueIds)}
              className="flex items-center justify-center gap-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-semibold text-xs rounded-lg transition-colors shadow-sm self-start sm:self-auto"
            >
              <Droplets className="w-4 h-4 fill-current text-sky-900" />
              <span>Mark All {allDueIds.length} Due Beds Watered Today</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
