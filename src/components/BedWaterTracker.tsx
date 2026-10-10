import React, { useState } from 'react';
import {
  GardenBed,
  WaterScheduleSetting
} from '../types/garden';
import { WeatherForecastResult } from '../services/weatherService';
import {
  calculateBedWaterReminder,
  BedWaterReminder
} from '../utils/waterTrackerUtils';
import {
  Droplets,
  Calendar,
  CloudRain,
  Sun,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Bell,
  BellOff,
  History,
  RotateCcw
} from 'lucide-react';

interface BedWaterTrackerProps {
  bed: GardenBed;
  weather?: WeatherForecastResult | null;
  isCelsius?: boolean;
  onUpdateBedWatering: (bedId: string, updates: Partial<GardenBed>) => void;
  onWaterBedNow: (bedId: string, volume?: 'light' | 'moderate' | 'deep', date?: string) => void;
}

export const BedWaterTracker: React.FC<BedWaterTrackerProps> = ({
  bed,
  weather,
  onUpdateBedWatering,
  onWaterBedNow,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [volume, setVolume] = useState<'light' | 'moderate' | 'deep'>(
    bed.wateringVolume || 'moderate'
  );

  const reminder: BedWaterReminder = calculateBedWaterReminder(bed, weather);
  const todayStr = new Date().toISOString().split('T')[0];
  const isWateredToday = bed.lastWatered === todayStr;

  // Handle quick date selection
  const handleQuickWater = (daysAgo: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysAgo);
    const dateStr = targetDate.toISOString().split('T')[0];
    onWaterBedNow(bed.id, volume, dateStr);
  };

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDate) return;
    onWaterBedNow(bed.id, volume, customDate);
    setIsDatePickerOpen(false);
    setCustomDate('');
  };

  const handleToggleClear = () => {
    if (window.confirm('Reset the last watered date for this bed?')) {
      onUpdateBedWatering(bed.id, {
        lastWatered: undefined,
        lastWateredTime: undefined,
      });
    }
  };

  const handleScheduleChange = (schedule: WaterScheduleSetting) => {
    onUpdateBedWatering(bed.id, { waterSchedule: schedule });
  };

  const handleToggleReminder = () => {
    const current = bed.reminderEnabled ?? true;
    onUpdateBedWatering(bed.id, { reminderEnabled: !current });
  };

  // Status visual configurations
  const getStatusBadge = () => {
    switch (reminder.status) {
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Water Overdue</span>
          </span>
        );
      case 'due_today':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Droplets className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Water Due Today</span>
          </span>
        );
      case 'rain_delay':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-900 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
            <CloudRain className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Rain Delay ({reminder.expectedRainInchesNext48h.toFixed(1)}")</span>
          </span>
        );
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Due Tomorrow</span>
          </span>
        );
      case 'adequate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Moisture Optimal</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>Not Recorded</span>
          </span>
        );
    }
  };

  return (
    <div className="mt-4 pt-3.5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 -mx-4 -mb-4 px-4 py-3.5 rounded-b-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Status & Last Watered Label */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-semibold text-stone-800 dark:text-stone-200">
              <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Water Status:</span>
            </div>
            {getStatusBadge()}
            {bed.reminderEnabled !== false && (
              <span
                className="inline-flex items-center gap-0.5 text-[10px] text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded"
                title="Weather-adaptive notifications enabled"
              >
                <Bell className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                <span>Active</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-600 dark:text-stone-400">
            <span>
              <strong className="text-stone-700 dark:text-stone-300 font-medium">Last Watered:</strong>{' '}
              {reminder.lastWateredLabel}
            </span>
            <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
            <span>
              <strong className="text-stone-700 dark:text-stone-300 font-medium">Next:</strong>{' '}
              {reminder.nextWaterDateLabel}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {/* Main Quick Water Toggle Button */}
          {isWateredToday ? (
            <button
              onClick={() => handleQuickWater(0)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 border border-emerald-300 dark:border-emerald-700 rounded-md transition-colors shadow-2xs"
              title="Watered today! Click to re-record timestamp"
            >
              <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
              <span>Watered Today ✓</span>
            </button>
          ) : (
            <button
              onClick={() => handleQuickWater(0)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-md transition-colors shadow-2xs"
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Water Today</span>
            </button>
          )}

          {/* Quick Dates Dropdown / Pill Toggle */}
          <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-md overflow-hidden bg-white dark:bg-stone-800 text-xs">
            <button
              onClick={() => handleQuickWater(1)}
              className="px-2 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors border-r border-stone-200 dark:border-stone-700 text-[11px]"
              title="Mark as watered yesterday"
            >
              Yesterday
            </button>
            <button
              onClick={() => handleQuickWater(2)}
              className="px-2 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors border-r border-stone-200 dark:border-stone-700 text-[11px]"
              title="Mark as watered 2 days ago"
            >
              2d ago
            </button>
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="px-2 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              title="Set custom date"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Expand Details & Settings Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            title={isExpanded ? 'Hide irrigation details' : 'Show irrigation details & weather analysis'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Custom Date Picker Popup / Bar */}
      {isDatePickerOpen && (
        <form
          onSubmit={handleCustomDateSubmit}
          className="mt-3 p-2.5 bg-white dark:bg-stone-800 rounded-md border border-stone-200 dark:border-stone-700 flex items-center gap-2 text-xs shadow-xs"
        >
          <span className="font-medium text-stone-700 dark:text-stone-300">Set Date:</span>
          <input
            type="date"
            max={todayStr}
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="px-2 py-1 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 text-xs focus:outline-hidden focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={!customDate}
            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded font-medium text-xs transition-colors"
          >
            Set
          </button>
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(false)}
            className="px-2 py-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Expanded Botanical & Weather Reminder Section */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800 space-y-3.5">
          {/* Botanical Weather Guidance Card */}
          <div className="p-3 bg-white dark:bg-stone-800/80 rounded-md border border-stone-200 dark:border-stone-700 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100">
                {reminder.heatAdvisoryActive ? (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                ) : reminder.rainDelayActive ? (
                  <CloudRain className="w-3.5 h-3.5 text-cyan-500" />
                ) : (
                  <Droplets className="w-3.5 h-3.5 text-sky-500" />
                )}
                <span>Botanical Moisture Assessment</span>
              </div>
              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                {bed.type} · Est. Soil: <strong className="capitalize">{reminder.soilMoistureEstimate}</strong>
              </span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {reminder.botanicalReason}
            </p>

            <div className="text-[11px] bg-stone-50 dark:bg-stone-900/60 p-2 rounded text-stone-700 dark:text-stone-300 border-l-2 border-sky-500">
              <span className="font-semibold text-stone-900 dark:text-stone-100">Pro-Tip: </span>
              {reminder.actionRecommendation}
            </div>
          </div>

          {/* Schedule Configuration & Reminder Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Schedule Selector */}
            <div className="p-2.5 bg-white dark:bg-stone-800/80 rounded-md border border-stone-200 dark:border-stone-700 space-y-1.5">
              <label className="font-semibold text-stone-800 dark:text-stone-200 block">
                Water Schedule Mode:
              </label>
              <select
                value={bed.waterSchedule || 'auto_weather'}
                onChange={(e) => handleScheduleChange(e.target.value as WaterScheduleSetting)}
                className="w-full px-2 py-1 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 text-xs focus:outline-hidden focus:border-sky-500"
              >
                <option value="auto_weather">
                  Smart Weather-Adaptive (Auto-calculates heat & rain)
                </option>
                <option value="daily">Every Day</option>
                <option value="every_2_days">Every 2 Days</option>
                <option value="every_3_days">Every 3 Days (Standard Bed)</option>
                <option value="every_4_days">Every 4 Days (Deep Root / Clay)</option>
                <option value="weekly">Weekly (Low Demand / Dormant)</option>
              </select>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                {bed.waterSchedule === 'auto_weather' || !bed.waterSchedule
                  ? `Adapts to ${reminder.highTempF}°F temps and forecasted precipitation.`
                  : 'Fixed frequency schedule applied.'}
              </span>
            </div>

            {/* Volume & Notification Toggles */}
            <div className="p-2.5 bg-white dark:bg-stone-800/80 rounded-md border border-stone-200 dark:border-stone-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-stone-800 dark:text-stone-200">
                  Target Watering Depth:
                </label>
                <button
                  type="button"
                  onClick={handleToggleReminder}
                  className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium transition-colors ${
                    bed.reminderEnabled !== false
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300'
                  }`}
                >
                  {bed.reminderEnabled !== false ? (
                    <>
                      <Bell className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Reminders On</span>
                    </>
                  ) : (
                    <>
                      <BellOff className="w-3 h-3 text-stone-400" />
                      <span>Reminders Muted</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1 pt-0.5">
                {(['light', 'moderate', 'deep'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setVolume(v);
                      onUpdateBedWatering(bed.id, { wateringVolume: v });
                    }}
                    className={`py-1 px-1.5 rounded text-[11px] font-medium capitalize text-center border transition-colors ${
                      volume === v
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                        : 'bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    {v === 'light' ? 'Light (0.25")' : v === 'moderate' ? 'Mod (0.5")' : 'Deep (1.0")'}
                  </button>
                ))}
              </div>

              {bed.lastWatered && (
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={handleToggleClear}
                    className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset Date</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Watering History Logs */}
          {bed.wateringHistory && bed.wateringHistory.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                <History className="w-3 h-3" />
                <span>Recent Irrigation Log</span>
              </div>
              <div className="max-h-24 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/80 bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 text-xs">
                {bed.wateringHistory.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-1.5 px-2 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                      <span className="font-mono">{log.date}</span>
                      {log.time && <span className="text-stone-400">({log.time})</span>}
                      {log.volume && (
                        <span className="capitalize text-stone-500 font-medium">· {log.volume} soak</span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Recorded ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
