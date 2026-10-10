import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Search, Loader2, Compass, Store } from 'lucide-react';
import { LocationData } from '../types/garden';

interface MapsGroundingViewProps {
  location: LocationData;
}

interface PlaceResult {
  title: string;
  uri?: string;
  snippet?: string;
}

export const MapsGroundingView: React.FC<MapsGroundingViewProps> = ({ location }) => {
  const [query, setQuery] = useState(`Organic plant nurseries, seed suppliers, and garden centers near ${location.name}`);
  const [isLoading, setIsLoading] = useState(false);
  const [responseMarkdown, setResponseMarkdown] = useState<string | null>(null);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearchPlaces = async (customPrompt?: string) => {
    const promptToSend = customPrompt || query;
    if (!promptToSend.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          lat: location.lat,
          lon: location.lon
        })
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      setResponseMarkdown(data.text || '');

      // Extract places from groundingChunks
      const extractedPlaces: PlaceResult[] = [];
      if (Array.isArray(data.groundingChunks)) {
        for (const chunk of data.groundingChunks) {
          if (chunk.maps) {
            extractedPlaces.push({
              title: chunk.maps.title || 'Local Place',
              uri: chunk.maps.uri,
              snippet: chunk.maps.placeAnswerSources?.reviewSnippets?.[0]
            });
          }
        }
      }

      setPlaces(extractedPlaces);
    } catch (err: any) {
      setError(err.message || 'Failed to search nearby places');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
          Google Maps Grounding
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
          Find Local Nurseries & Supplies
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          Grounded with Google Maps data for {location.name}. Discover organic seedlings, soil compost suppliers, seed libraries, and extension offices.
        </p>
      </div>

      {/* Search Bar & Quick Buttons */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search local garden supplies or plant nurseries..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white dark:focus:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
          </div>

          <button
            onClick={() => handleSearchPlaces()}
            disabled={isLoading || !query.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-40 rounded-lg transition-colors shadow-2xs shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Find with Google Maps</span>
          </button>
        </div>

        {/* Quick query buttons */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pt-1">
          <span className="text-stone-400 dark:text-stone-500 shrink-0">Suggestions:</span>
          <button
            onClick={() => {
              const q = `Organic seed starter trays and potting mix suppliers in ${location.name}`;
              setQuery(q);
              handleSearchPlaces(q);
            }}
            className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md transition-colors whitespace-nowrap"
          >
            Seedling supplies & soil
          </button>
          <button
            onClick={() => {
              const q = `Plant nurseries selling garlic bulbs and fruit trees near ${location.name}`;
              setQuery(q);
              handleSearchPlaces(q);
            }}
            className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md transition-colors whitespace-nowrap"
          >
            Garlic & fruit trees
          </button>
          <button
            onClick={() => {
              const q = `Master gardener cooperative extension offices and community gardens near ${location.name}`;
              setQuery(q);
              handleSearchPlaces(q);
            }}
            className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md transition-colors whitespace-nowrap"
          >
            Extension offices & soil testing
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-lg text-rose-700 dark:text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Results Section */}
      {responseMarkdown && (
        <div className="space-y-6">
          
          {/* Extracted Google Maps Links (MANDATORY REQUIREMENT) */}
          {places.length > 0 && (
            <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
                <Store className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span>Verified Google Maps Locations ({places.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {places.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-stone-800/80 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{p.title}</h4>
                      {p.snippet && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 italic mt-1 line-clamp-2">
                          "{p.snippet}"
                        </p>
                      )}
                    </div>
                    {p.uri && (
                      <a
                        href={p.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>View on Google Maps</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model Commentary */}
          <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
            <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg">
              Horticultural Guide & Local Directory
            </h3>
            <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
              {responseMarkdown}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
