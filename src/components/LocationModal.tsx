import React, { useState } from 'react';
import { LocationData } from '../types/garden';
import { POPULAR_LOCATIONS, USDA_ZONE_PRESETS } from '../data/locations';
import { X, Search, MapPin, Compass, Calendar, Check } from 'lucide-react';

interface LocationModalProps {
  currentLocation: LocationData;
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: LocationData) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  currentLocation,
  isOpen,
  onClose,
  onSelectLocation
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'cities' | 'zones' | 'custom'>('cities');
  const [isLocating, setIsLocating] = useState(false);
  const [locatingError, setLocatingError] = useState<string | null>(null);

  // Custom inputs
  const [customName, setCustomName] = useState(currentLocation.name);
  const [customZone, setCustomZone] = useState(currentLocation.usdaZone);
  const [customSpringFrost, setCustomSpringFrost] = useState(currentLocation.lastSpringFrost);
  const [customFallFrost, setCustomFallFrost] = useState(currentLocation.firstFallFrost);

  if (!isOpen) return null;

  const filteredCities = POPULAR_LOCATIONS.filter((loc) => {
    const q = search.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.region.toLowerCase().includes(q) ||
      loc.country.toLowerCase().includes(q) ||
      loc.usdaZone.toLowerCase().includes(q)
    );
  });

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setLocatingError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocatingError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;

        // Find closest preset location by Euclidean distance
        let closest: LocationData | null = null;
        let minDist = Infinity;

        for (const loc of POPULAR_LOCATIONS) {
          if (loc.lat && loc.lon) {
            const dist = Math.hypot(loc.lat - latitude, loc.lon - longitude);
            if (dist < minDist) {
              minDist = dist;
              closest = loc;
            }
          }
        }

        if (closest) {
          onSelectLocation({
            ...closest,
            name: `Near ${closest.name} (Local GPS)`
          });
          onClose();
        } else {
          // Fallback based on latitude
          let zone = 'Zone 6';
          let spring = '04-25';
          let fall = '10-20';
          if (latitude > 45) {
            zone = 'Zone 4';
            spring = '05-15';
            fall = '09-25';
          } else if (latitude < 32) {
            zone = 'Zone 9';
            spring = '02-15';
            fall = '12-05';
          }
          onSelectLocation({
            id: 'gps-custom',
            name: `GPS Location (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
            region: 'Detected Coordinates',
            country: 'Custom',
            usdaZone: zone,
            lastSpringFrost: spring,
            firstFallFrost: fall,
            lat: latitude,
            lon: longitude
          });
          onClose();
        }
      },
      (err) => {
        setIsLocating(false);
        setLocatingError(err.message || 'Unable to retrieve location.');
      },
      { timeout: 10000 }
    );
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectLocation({
      id: `custom-${Date.now()}`,
      name: customName.trim() || 'My Garden Microclimate',
      region: 'Custom Microclimate',
      country: 'Custom',
      usdaZone: customZone,
      lastSpringFrost: customSpringFrost,
      firstFallFrost: customFallFrost,
      lat: currentLocation.lat || 41.8781,
      lon: currentLocation.lon || -87.6298
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              Set Your Local Frost Dates & Zone
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Accurate frost dates ensure your weekly planting advice matches your climate.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 px-5 pt-2 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('cities')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'cities'
                ? 'border-emerald-600 dark:border-emerald-500 text-stone-900 dark:text-stone-100 font-semibold'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Cities & Regions
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'zones'
                ? 'border-emerald-600 dark:border-emerald-500 text-stone-900 dark:text-stone-100 font-semibold'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            USDA Hardiness Zones (3–10)
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-emerald-600 dark:border-emerald-500 text-stone-900 dark:text-stone-100 font-semibold'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Custom Microclimate Dates
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: Cities & Regions */}
          {activeTab === 'cities' && (
            <div className="space-y-3">
              {/* Geolocation Button */}
              <button
                onClick={handleUseGPS}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900 active:bg-emerald-200 dark:active:bg-emerald-800 border border-emerald-200 dark:border-emerald-800/60 rounded-lg transition-colors"
              >
                <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting Nearest Weather Station...' : 'Use My Current Location (GPS)'}</span>
              </button>

              {locatingError && (
                <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded border border-rose-200 dark:border-rose-800/60">
                  {locatingError}
                </div>
              )}

              {/* Search filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search city, state, or zone (e.g. Seattle, Denver, Chicago, 7b)..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white dark:focus:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                />
              </div>

              {/* City List */}
              <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-60 overflow-y-auto border border-stone-200 dark:border-stone-800 rounded-lg">
                {filteredCities.map((loc) => {
                  const isSelected = loc.id === currentLocation.id;

                  return (
                    <button
                      key={loc.id}
                      onClick={() => {
                        onSelectLocation(loc);
                        onClose();
                      }}
                      className={`w-full p-3 text-left flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors ${
                        isSelected ? 'bg-emerald-50/60 dark:bg-emerald-950/40' : ''
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                          {loc.name}
                        </div>
                        <div className="text-xs text-stone-500 dark:text-stone-400">
                          {loc.region}, {loc.country} · <span className="font-medium text-stone-700 dark:text-stone-300">{loc.usdaZone}</span>
                        </div>
                        <div className="text-[11px] text-stone-400 dark:text-stone-500 font-mono mt-0.5">
                          Spring Frost: {loc.lastSpringFrost} · Fall Frost: {loc.firstFallFrost}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: USDA Zones Presets */}
          {activeTab === 'zones' && (
            <div className="space-y-2">
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
                Select your general USDA Plant Hardiness Zone to apply average regional frost dates:
              </p>
              <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
                {USDA_ZONE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectLocation(preset);
                      onClose();
                    }}
                    className={`w-full p-3 text-left flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors ${
                      currentLocation.id === preset.id ? 'bg-emerald-50/60 dark:bg-emerald-950/40' : ''
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                        {preset.name}
                      </div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">
                        {preset.region}
                      </div>
                      <div className="text-[11px] text-stone-400 dark:text-stone-500 font-mono mt-0.5">
                        Spring Frost: {preset.lastSpringFrost} · Fall Frost: {preset.firstFallFrost}
                      </div>
                    </div>
                    {currentLocation.id === preset.id && (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Custom Microclimate */}
          {activeTab === 'custom' && (
            <form onSubmit={handleSaveCustom} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="font-medium text-stone-700 dark:text-stone-300 block mb-1">
                  Location / Garden Nickname
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. My Backyard (Valley Floor)"
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-stone-700 dark:text-stone-300 block mb-1">
                  Hardiness Zone Label
                </label>
                <input
                  type="text"
                  value={customZone}
                  onChange={(e) => setCustomZone(e.target.value)}
                  placeholder="e.g. Zone 7b"
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-stone-700 dark:text-stone-300 block mb-1">
                    Last Spring Frost (MM-DD)
                  </label>
                  <input
                    type="text"
                    value={customSpringFrost}
                    onChange={(e) => setCustomSpringFrost(e.target.value)}
                    placeholder="04-15"
                    pattern="[0-1][0-9]-[0-3][0-9]"
                    title="Format: MM-DD (e.g. 04-15)"
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg font-mono focus:border-emerald-600 focus:outline-hidden"
                    required
                  />
                  <span className="text-[11px] text-stone-400 dark:text-stone-500 block mt-0.5">Format: MM-DD</span>
                </div>

                <div>
                  <label className="font-medium text-stone-700 dark:text-stone-300 block mb-1">
                    First Fall Frost (MM-DD)
                  </label>
                  <input
                    type="text"
                    value={customFallFrost}
                    onChange={(e) => setCustomFallFrost(e.target.value)}
                    placeholder="10-25"
                    pattern="[0-1][0-9]-[0-3][0-9]"
                    title="Format: MM-DD (e.g. 10-25)"
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg font-mono focus:border-emerald-600 focus:outline-hidden"
                    required
                  />
                  <span className="text-[11px] text-stone-400 dark:text-stone-500 block mt-0.5">Format: MM-DD</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors mt-2"
              >
                Apply Custom Frost Dates
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
