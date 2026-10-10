import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { GardenBed, HarvestRecord, PlantCategory } from '../types/garden';
import {
  getAllHarvestRecords,
  getMonthlyHarvestYieldData,
  getCategoryHarvestYieldData,
  getCropHarvestYieldData,
  getBedHarvestYieldData,
  formatWeight,
  lbsToKg,
  CATEGORY_COLORS,
} from '../utils/harvestYieldUtils';
import {
  Sprout,
  TrendingUp,
  Scale,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Plus,
  DollarSign,
  ChevronRight,
  Info,
} from 'lucide-react';

interface HarvestYieldVisualizationProps {
  beds: GardenBed[];
  isCelsius?: boolean;
  onOpenLogHarvestModal?: () => void;
  onSeedSampleHarvests?: () => void;
}

type ChartViewMode = 'timeline' | 'crops' | 'categories' | 'beds';
type TimelineMetric = 'cumulative' | 'monthly';

export const HarvestYieldVisualization: React.FC<HarvestYieldVisualizationProps> = ({
  beds,
  isCelsius = false,
  onOpenLogHarvestModal,
  onSeedSampleHarvests,
}) => {
  // Unit toggle: default to kg if celsius is selected, or lbs if fahrenheit
  const [unit, setUnit] = useState<'lbs' | 'kg'>(isCelsius ? 'kg' : 'lbs');
  const [viewMode, setChartViewMode] = useState<ChartViewMode>('timeline');
  const [timelineMetric, setTimelineMetric] = useState<TimelineMetric>('cumulative');

  // Consolidate all logged harvests
  const harvestRecords: HarvestRecord[] = useMemo(() => {
    return getAllHarvestRecords(beds);
  }, [beds]);

  // Aggregate stats
  const totalLbs = useMemo(() => {
    return harvestRecords.reduce((sum, r) => sum + r.weightLbs, 0);
  }, [harvestRecords]);

  const totalHarvestsCount = harvestRecords.length;

  // Chart datasets
  const monthlyData = useMemo(() => {
    return getMonthlyHarvestYieldData(harvestRecords, unit);
  }, [harvestRecords, unit]);

  const categoryData = useMemo(() => {
    return getCategoryHarvestYieldData(harvestRecords, unit);
  }, [harvestRecords, unit]);

  const cropData = useMemo(() => {
    return getCropHarvestYieldData(harvestRecords, unit);
  }, [harvestRecords, unit]);

  const bedData = useMemo(() => {
    return getBedHarvestYieldData(harvestRecords, unit);
  }, [harvestRecords, unit]);

  // Top producing crop
  const topCrop = cropData.length > 0 ? cropData[0] : null;

  // Est organic market grocery savings ($4.25 / lb avg)
  const estimatedSavings = Math.round(totalLbs * 4.25);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-stone-900/95 dark:bg-stone-950/95 text-stone-100 p-2.5 rounded-lg shadow-lg border border-stone-700 text-xs backdrop-blur-xs">
          <div className="font-semibold text-stone-200 mb-1">{label || data.name}</div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.color || data.payload?.fill || '#10b981' }}
            />
            <span className="font-mono font-medium text-emerald-400">
              {data.value} {unit}
            </span>
          </div>
          {data.payload?.count !== undefined && (
            <div className="text-[11px] text-stone-400 mt-0.5">
              {data.payload.count} harvest session{data.payload.count === 1 ? '' : 's'}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              Seasonal Harvest Yield & Biomass
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Total vegetable weight and harvest progression logged across all garden beds this season.
          </p>
        </div>

        {/* Action & Unit Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Unit Toggle */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 text-xs border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setUnit('lbs')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                unit === 'lbs'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-semibold shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
              }`}
            >
              lbs (Pounds)
            </button>
            <button
              onClick={() => setUnit('kg')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                unit === 'kg'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-semibold shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
              }`}
            >
              kg (Kilograms)
            </button>
          </div>

          {onOpenLogHarvestModal && (
            <button
              onClick={onOpenLogHarvestModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Harvest</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Yield */}
        <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
          <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
            Total Season Yield
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-900 dark:text-emerald-100">
              {unit === 'kg' ? lbsToKg(totalLbs).toFixed(1) : totalLbs.toFixed(1)}
            </span>
            <span className="text-xs font-mono font-medium text-emerald-700 dark:text-emerald-300">
              {unit}
            </span>
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            Across {totalHarvestsCount} logged harvest{totalHarvestsCount === 1 ? '' : 's'}
          </div>
        </div>

        {/* Top Producer */}
        <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
          <div className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
            Top Producing Crop
          </div>
          <div className="flex items-baseline gap-1.5 mt-1 truncate">
            <span className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 truncate">
              {topCrop ? topCrop.name : 'No harvests yet'}
            </span>
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            {topCrop ? `${topCrop.weight} ${unit} harvested` : 'Harvest crops to view top yield'}
          </div>
        </div>

        {/* Active Crop Varieties */}
        <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
          <div className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
            Crops Harvested
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-stone-900 dark:text-stone-100 font-mono">
              {cropData.length}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">varieties</span>
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            {categoryData.length} botanical categories
          </div>
        </div>

        {/* Estimated Organic Grocery Value */}
        <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/40">
          <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>Organic Produce Value</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-serif font-bold text-amber-900 dark:text-amber-100">
              ${estimatedSavings}
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-300">est. savings</span>
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            Based on $4.25/lb market rate
          </div>
        </div>
      </div>

      {/* Chart View Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b sm:border-b-0 border-stone-200 dark:border-stone-800 pb-2 sm:pb-0 overflow-x-auto">
          <button
            onClick={() => setChartViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'timeline'
                ? 'bg-emerald-700 text-white dark:bg-emerald-600 font-semibold shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Seasonal Progression</span>
          </button>
          <button
            onClick={() => setChartViewMode('crops')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'crops'
                ? 'bg-emerald-700 text-white dark:bg-emerald-600 font-semibold shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>By Crop ({cropData.length})</span>
          </button>
          <button
            onClick={() => setChartViewMode('categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'categories'
                ? 'bg-emerald-700 text-white dark:bg-emerald-600 font-semibold shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>By Category</span>
          </button>
          <button
            onClick={() => setChartViewMode('beds')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'beds'
                ? 'bg-emerald-700 text-white dark:bg-emerald-600 font-semibold shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>By Bed ({bedData.length})</span>
          </button>
        </div>

        {/* Secondary timeline toggle */}
        {viewMode === 'timeline' && (
          <div className="flex items-center gap-1 text-xs bg-stone-100 dark:bg-stone-800 p-0.5 rounded-md self-end sm:self-auto">
            <button
              onClick={() => setTimelineMetric('cumulative')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                timelineMetric === 'cumulative'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-semibold shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              Cumulative Total ({unit})
            </button>
            <button
              onClick={() => setTimelineMetric('monthly')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                timelineMetric === 'monthly'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-semibold shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              Monthly Harvests ({unit})
            </button>
          </div>
        )}
      </div>

      {/* Main Chart Area */}
      {harvestRecords.length === 0 ? (
        <div className="py-12 px-4 text-center bg-stone-50 dark:bg-stone-800/40 rounded-lg border border-dashed border-stone-200 dark:border-stone-700 space-y-3">
          <Scale className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
          <div>
            <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
              No harvest yields recorded yet
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mt-1">
              Mark planted crops in your garden beds as harvested or log pickings to generate your seasonal vegetable weight graph!
            </p>
          </div>
          {onSeedSampleHarvests && (
            <div className="pt-2">
              <button
                onClick={onSeedSampleHarvests}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md text-xs font-medium transition-colors shadow-2xs inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Seasonal Harvests</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full">
          {/* VIEW 1: Seasonal Timeline (Area / Bar) */}
          {viewMode === 'timeline' && (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {timelineMetric === 'cumulative' ? (
                  <AreaChart
                    data={monthlyData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-stone-800" />
                    <XAxis
                      dataKey="month"
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      unit={` ${unit}`}
                      width={65}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="cumulativeWeight"
                      name={`Cumulative Yield (${unit})`}
                      stroke="#059669"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#yieldGradient)"
                      activeDot={{ r: 6, fill: '#047857' }}
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-stone-800" />
                    <XAxis
                      dataKey="month"
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      unit={` ${unit}`}
                      width={65}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="weight"
                      name={`Monthly Harvest (${unit})`}
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}

          {/* VIEW 2: By Crop Varieties (BarChart) */}
          {viewMode === 'crops' && (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cropData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-stone-800" />
                  <XAxis
                    type="number"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    unit={` ${unit}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="weight" name={`Weight (${unit})`} radius={[0, 4, 4, 0]}>
                    {cropData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* VIEW 3: By Botanical Category (Bar / Pie) */}
          {viewMode === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Donut chart */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="weight"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-cat-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown legend table */}
              <div className="space-y-2 text-xs max-h-64 overflow-y-auto pr-1">
                {categoryData.map((cat) => {
                  const pct = totalLbs > 0 ? Math.round((cat.rawLbs / totalLbs) * 100) : 0;
                  return (
                    <div
                      key={cat.category}
                      className="p-2 rounded bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: cat.fill }}
                        />
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-stone-500 dark:text-stone-400 font-mono">
                          {pct}%
                        </span>
                        <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                          {cat.weight} {unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 4: By Bed Comparison (BarChart) */}
          {viewMode === 'beds' && (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bedData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-stone-800" />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    unit={` ${unit}`}
                    width={65}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="weight"
                    name={`Total Yield (${unit})`}
                    fill="#0284c7"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
