import React, { useState } from 'react';
import { Plant, GardenBed } from '../types/garden';
import { getCompanionGuideForPlant, CompanionDetail, IncompatibleDetail } from '../data/companionData';
import { Heart, HeartCrack, Sparkles, AlertTriangle, ShieldCheck, ArrowRight, ExternalLink, Info, CheckCircle2, Sprout } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CompanionPlantingSectionProps {
  plant: Plant;
  allPlants?: Plant[];
  beds?: GardenBed[];
  onSelectPlant?: (plant: Plant) => void;
}

type FilterView = 'all' | 'friendly' | 'unfriendly' | 'in_beds';

export const CompanionPlantingSection: React.FC<CompanionPlantingSectionProps> = ({
  plant,
  allPlants = [],
  beds = [],
  onSelectPlant
}) => {
  const { t } = useLanguage();
  const [filterView, setFilterView] = useState<FilterView>('all');
  const [showEducationalGuide, setShowEducationalGuide] = useState(false);

  // Compute guide data
  const guide = getCompanionGuideForPlant(plant, allPlants, beds);
  const totalNeighbors = guide.friendly.length + guide.unfriendly.length;
  const totalInBeds = guide.activeBedSynergies.length + guide.activeBedConflicts.length;

  const handleInspect = (matchedId?: string) => {
    if (!matchedId || !onSelectPlant) return;
    const target = allPlants.find(p => p.id === matchedId);
    if (target) {
      onSelectPlant(target);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              {t('companion.guide_title', 'Companion Planting Guide')}
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {guide.summaryNote}
          </p>
        </div>

        <button
          onClick={() => setShowEducationalGuide(!showEducationalGuide)}
          className="self-start sm:self-auto text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showEducationalGuide ? t('companion.hide_principles', 'Hide Botanical Principles') : t('companion.how_it_works', 'How Companion Planting Works')}</span>
        </button>
      </div>

      {/* Educational Collapsible Guide */}
      {showEducationalGuide && (
        <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 space-y-2 animate-in fade-in duration-200">
          <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Core Principles of Botanical Polyculture</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800">
              <span className="font-medium text-emerald-700 dark:text-emerald-400 block mb-0.5">🛡️ Natural Pest Masking</span>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
                Strong aromatic terpenes (e.g. alliums, herbs, marigolds) confuse egg-laying moths and flying insect pests that target specific crops.
              </p>
            </div>
            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800">
              <span className="font-medium text-emerald-700 dark:text-emerald-400 block mb-0.5">🌱 Rhizosphere Synergy</span>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
                Legumes harbor Rhizobium bacteria to fix nitrogen, while deep taproots (carrots) mine subsoil minerals without competing with shallow roots.
              </p>
            </div>
            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800">
              <span className="font-medium text-rose-700 dark:text-rose-400 block mb-0.5">🛑 Allelopathy & Stunting</span>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
                Certain crops (fennel, brassica exudates, allium sulfur) produce biochemical root toxins that retard neighboring cell division or kill bacterial nodules.
              </p>
            </div>
            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800">
              <span className="font-medium text-emerald-700 dark:text-emerald-400 block mb-0.5">⛅ Living Mulch & Canopy</span>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
                Trellised or tall sun lovers cast gentle afternoon shade over cool-season greens, keeping soil moist and delaying premature bolting.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Garden Bed Live Alerts (if user has any matches in their beds) */}
      {guide.activeBedSynergies.length > 0 && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-emerald-900 dark:text-emerald-300 block">
              Active Garden Bed Synergy Detected!
            </span>
            <p className="text-emerald-800 dark:text-emerald-300/90 mt-0.5 leading-relaxed">
              You currently have{' '}
              <span className="font-semibold">
                {guide.activeBedSynergies.map(s => `${s.name} (in ${s.userBedNames?.join(', ')})`).join(' and ')}
              </span>{' '}
              planted in your garden beds. Planting <span className="font-semibold">{plant.name}</span> nearby creates natural pest protection and balanced nutrient exchange!
            </p>
          </div>
        </div>
      )}

      {guide.activeBedConflicts.length > 0 && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-rose-900 dark:text-rose-300 block">
              Garden Bed Spatial Conflict Warning!
            </span>
            <p className="text-rose-800 dark:text-rose-300/90 mt-0.5 leading-relaxed">
              You have{' '}
              <span className="font-semibold">
                {guide.activeBedConflicts.map(c => `${c.name} (in ${c.userBedNames?.join(', ')})`).join(' and ')}
              </span>{' '}
              planted in your garden beds. Do not plant <span className="font-semibold">{plant.name}</span> in the same bed to avoid {guide.activeBedConflicts[0].reason.toLowerCase().slice(0, 80)}... Keep them separated!
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setFilterView('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            filterView === 'all'
              ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-2xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <span>{t('companion.all_neighbors', 'All Neighbors')}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-700 dark:bg-stone-300 text-stone-100 dark:text-stone-900">
            {totalNeighbors}
          </span>
        </button>

        <button
          onClick={() => setFilterView('friendly')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            filterView === 'friendly'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/40'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>{t('companion.friendly_allies', 'Friendly Allies')}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-800 text-emerald-100">
            {guide.friendly.length}
          </span>
        </button>

        <button
          onClick={() => setFilterView('unfriendly')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            filterView === 'unfriendly'
              ? 'bg-rose-700 text-white shadow-2xs'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/40'
          }`}
        >
          <HeartCrack className="w-3.5 h-3.5" />
          <span>{t('companion.unfriendly_foes', 'Incompatible / Avoid')}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-800 text-rose-100">
            {guide.unfriendly.length}
          </span>
        </button>

        {totalInBeds > 0 && (
          <button
            onClick={() => setFilterView('in_beds')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filterView === 'in_beds'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/40'
            }`}
          >
            <span>{t('companion.bed_alerts', 'In Your Garden Beds')}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-700 text-amber-100">
              {totalInBeds}
            </span>
          </button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="space-y-4">
        {/* Friendly Allies Section */}
        {(filterView === 'all' || filterView === 'friendly' || filterView === 'in_beds') && (
          <div>
            {(filterView === 'all' || filterView === 'in_beds') && (
              <div className="flex items-center gap-2 mb-2.5">
                <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                <h4 className="font-semibold text-xs uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  Beneficial Companion Plants ({guide.friendly.length})
                </h4>
              </div>
            )}

            {guide.friendly.length === 0 ? (
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-center text-xs text-stone-500">
                No specific companions recorded for this variety. It grows comfortably alongside most standard garden crops.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {guide.friendly
                  .filter(f => filterView !== 'in_beds' || f.isInUserBed)
                  .map((friend, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                        friend.isInUserBed
                          ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 ring-1 ring-emerald-400/40'
                          : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                      }`}
                    >
                      <div>
                        {/* Top Badge & Plant Name */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                {friend.name}
                              </span>
                              {friend.isInUserBed && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-emerald-600 text-white text-[10px] font-semibold">
                                  ✓ In Bed
                                </span>
                              )}
                            </div>
                            {friend.isInUserBed && friend.userBedNames && (
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
                                Growing in: {friend.userBedNames.join(', ')}
                              </span>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 shrink-0">
                            <span>{friend.badgeEmoji}</span>
                            <span>{friend.synergyLabel}</span>
                          </span>
                        </div>

                        {/* Botanical Benefit */}
                        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed mb-2">
                          {friend.reason}
                        </p>

                        {/* Practical Planting Tip */}
                        <div className="p-2 rounded-lg bg-white/70 dark:bg-stone-900/70 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
                          <span className="font-semibold text-emerald-900 dark:text-emerald-300">Tip: </span>
                          {friend.plantingTip}
                        </div>
                      </div>

                      {/* Inspect Companion Button (if matched in catalog) */}
                      {friend.matchedPlantId && onSelectPlant && (
                        <div className="pt-2.5 mt-2 border-t border-emerald-100 dark:border-emerald-900/40 flex justify-end">
                          <button
                            onClick={() => handleInspect(friend.matchedPlantId)}
                            className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 flex items-center gap-1 group transition-colors"
                          >
                            <span>Inspect {friend.name}</span>
                            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Unfriendly / Incompatible Section */}
        {(filterView === 'all' || filterView === 'unfriendly' || filterView === 'in_beds') && (
          <div className="pt-2">
            {(filterView === 'all' || filterView === 'in_beds') && (
              <div className="flex items-center gap-2 mb-2.5">
                <HeartCrack className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h4 className="font-semibold text-xs uppercase tracking-wider text-rose-900 dark:text-rose-300">
                  Antagonistic Neighbors: Avoid Planting Near ({guide.unfriendly.length})
                </h4>
              </div>
            )}

            {guide.unfriendly.length === 0 ? (
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-center text-xs text-stone-500">
                No known antagonistic or inhibitory crop pairings for this plant.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {guide.unfriendly
                  .filter(u => filterView !== 'in_beds' || u.isInUserBed)
                  .map((foe, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                        foe.isInUserBed
                          ? 'bg-rose-50/90 dark:bg-rose-950/50 border-rose-400 dark:border-rose-700 ring-1 ring-rose-400/40'
                          : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50'
                      }`}
                    >
                      <div>
                        {/* Top Badge & Plant Name */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                {foe.name}
                              </span>
                              {foe.isInUserBed && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-rose-600 text-white text-[10px] font-semibold animate-pulse">
                                  ⚠️ In Bed
                                </span>
                              )}
                            </div>
                            {foe.isInUserBed && foe.userBedNames && (
                              <span className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold block">
                                In your bed: {foe.userBedNames.join(', ')} — Separate Beds!
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 shrink-0">
                              <span>{foe.badgeEmoji}</span>
                              <span>{foe.conflictLabel}</span>
                            </span>
                          </div>
                        </div>

                        {/* Conflict Reason */}
                        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed mb-2">
                          {foe.reason}
                        </p>

                        {/* Separation Advice */}
                        <div className="p-2 rounded-lg bg-white/70 dark:bg-stone-900/70 border border-rose-100 dark:border-rose-900/40 text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
                          <span className="font-semibold text-rose-900 dark:text-rose-300">Separation Guidance: </span>
                          {foe.separationAdvice}
                        </div>
                      </div>

                      {/* Inspect Antagonist Button (if matched in catalog) */}
                      {foe.matchedPlantId && onSelectPlant && (
                        <div className="pt-2.5 mt-2 border-t border-rose-100 dark:border-rose-900/40 flex justify-end">
                          <button
                            onClick={() => handleInspect(foe.matchedPlantId)}
                            className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-200 flex items-center gap-1 group transition-colors"
                          >
                            <span>Inspect {foe.name}</span>
                            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
