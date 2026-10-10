import React from 'react';
import { Snowflake, Shield, Sun, Thermometer, Wind, AlertTriangle, Layers, Sprout } from 'lucide-react';

export const FrostGuideView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Title */}
      <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
          Reference & Techniques
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
          The Gardener's Frost & Cold Season Guide
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
          Everything you need to know about navigating spring and autumn frost dates, cold tolerance tiers, and season-extension strategies.
        </p>
      </div>

      {/* 3 Frost Tolerance Tiers */}
      <section className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
          The Three Botanical Cold-Tolerance Tiers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Hardy */}
          <div className="p-4 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 space-y-2">
            <div className="flex items-center gap-2 text-sky-900 dark:text-sky-300 font-semibold text-sm">
              <Snowflake className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Extremely Frost Hardy</span>
            </div>
            <div className="text-xs font-mono text-sky-700 dark:text-sky-400">
              Survives hard freezes down to 10°F – 20°F (-7°C to -12°C)
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              These crops produce natural antifreeze sugars in response to chilling temperatures. Freezing actually enhances their flavor, converting starches into rich natural sugars.
            </p>
            <div className="pt-2 border-t border-sky-200/60 dark:border-sky-800/60 text-xs text-stone-600 dark:text-stone-400">
              <span className="font-semibold text-stone-800 dark:text-stone-200">Crops:</span> Garlic, Winter Kale, Leeks, Spinach, Mâche, Claytonia, Winter Rye, Parsnips.
            </div>
          </div>

          {/* Semi-Hardy */}
          <div className="p-4 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-semibold text-sm">
              <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Semi-Hardy</span>
            </div>
            <div className="text-xs font-mono text-amber-700 dark:text-amber-400">
              Tolerates light frost: 28°F – 32°F (-2°C to 0°C)
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              Young foliage withstands light overnight frost, but repeated hard freezes can scorch leaf margins or soften root shoulders if unprotected.
            </p>
            <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 text-xs text-stone-600 dark:text-stone-400">
              <span className="font-semibold text-stone-800 dark:text-stone-200">Crops:</span> Beets, Head Lettuce, Cauliflower, Swiss Chard, Carrots, Broccoli, Radishes.
            </div>
          </div>

          {/* Tender */}
          <div className="p-4 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-2">
            <div className="flex items-center gap-2 text-rose-900 dark:text-rose-300 font-semibold text-sm">
              <Sun className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Tender (Frost Sensitive)</span>
            </div>
            <div className="text-xs font-mono text-rose-700 dark:text-rose-400">
              Killed or damaged at 32°F (0°C)
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              Originate from tropical/subtropical climates. Water in plant cells freezes and expands, bursting cell membranes. Must be planted strictly after the last spring frost.
            </p>
            <div className="pt-2 border-t border-rose-200/60 dark:border-rose-800/60 text-xs text-stone-600 dark:text-stone-400">
              <span className="font-semibold text-stone-800 dark:text-stone-200">Crops:</span> Tomatoes, Peppers, Eggplants, Basil, Zucchini, Cucumbers, Squash, Sunflowers.
            </div>
          </div>

        </div>
      </section>

      {/* Understanding Frost Dates */}
      <section className="bg-white dark:bg-stone-900 p-6 rounded-lg border border-stone-200 dark:border-stone-800 space-y-4">
        <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
          How Average Frost Dates Work
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
              1. The 50% Probability Benchmark
            </h3>
            <p>
              Your local "Last Spring Frost Date" is the date on which there is historically a 50% chance of temperatures dropping to 32°F or below. That means half of all years experience a frost <em>after</em> that date! For high-value tender crops (like tomatoes or peppers), waiting 1 to 2 weeks after your average last frost provides an 80-90% safety margin.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
              2. Microclimates in Your Yard
            </h3>
            <p>
              Cold air is denser than warm air and flows downhill like water. Valley floors and low spots in your garden can be 5°F to 8°F colder on clear, calm nights than south-facing hillsides or beds adjacent to heat-absorbing brick walls or patio pavers.
            </p>
          </div>
        </div>
      </section>

      {/* Season Extension Toolkit */}
      <section className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
          Frost Protection & Season Extension Toolkit
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-2">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Floating Row Covers (Agfabric / Fleece)
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Lightweight spun-bonded polypropylene rests directly over crops. Transmits 85% sunlight while trapping ground heat, providing 3°F to 5°F of frost buffer.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-2">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Cold Frames & Low Poly-Tunnels
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Glass or clear greenhouse plastic framed boxes trap solar radiation by day. Extends the growing season by 4 to 8 weeks into winter and allows harvest of greens under snow.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-2">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Straw Mulch Blanketing
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Applying 6 to 12 inches of clean straw over carrots, beets, garlic, and parsnips insulates the topsoil from freezing solid, allowing mid-winter harvesting.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-2">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Watering Before Freeze Warning
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Wet soil conducts heat and releases radiant warmth overnight much better than dry soil. Deeply soaking beds the afternoon before a predicted radiation frost protects roots.
            </p>
          </div>

        </div>
      </section>

      {/* Hardening Off Schedule */}
      <section className="bg-stone-100 dark:bg-stone-900/80 p-6 rounded-lg border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
            The 7-Day Hardening Off Protocol
          </h2>
        </div>
        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
          Seedlings grown indoors have soft cuticle layers and weak stem cell walls. Transitioning them directly into outdoor sun, wind, and chilly nights causes transplant shock. Follow this schedule before transplanting:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-stone-800/80 rounded border border-stone-200 dark:border-stone-700">
            <div className="font-semibold text-stone-900 dark:text-stone-100 mb-1">Days 1–2</div>
            <p className="text-stone-600 dark:text-stone-400">2–3 hours in sheltered, dappled shade out of wind. Bring inside before sunset.</p>
          </div>
          <div className="p-3 bg-white dark:bg-stone-800/80 rounded border border-stone-200 dark:border-stone-700">
            <div className="font-semibold text-stone-900 dark:text-stone-100 mb-1">Days 3–4</div>
            <p className="text-stone-600 dark:text-stone-400">4–5 hours with morning sun and light breeze. Return indoors at night.</p>
          </div>
          <div className="p-3 bg-white dark:bg-stone-800/80 rounded border border-stone-200 dark:border-stone-700">
            <div className="font-semibold text-stone-900 dark:text-stone-100 mb-1">Days 5–6</div>
            <p className="text-stone-600 dark:text-stone-400">Full day in garden sunlight. Leave outdoors overnight if temps remain {'>'}45°F.</p>
          </div>
          <div className="p-3 bg-white dark:bg-stone-800/80 rounded border border-stone-200 dark:border-stone-700">
            <div className="font-semibold text-stone-900 dark:text-stone-100 mb-1">Day 7</div>
            <p className="text-stone-600 dark:text-stone-400">Ready to transplant! Water deeply and plant preferably on an overcast afternoon.</p>
          </div>
        </div>
      </section>

    </div>
  );
};
