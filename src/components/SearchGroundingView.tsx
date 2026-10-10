import React, { useState } from 'react';
import { Search, Globe, ExternalLink, Loader2, AlertTriangle, Snowflake, Wind } from 'lucide-react';
import { LocationData, CurrentSeasonState } from '../types/garden';

interface SearchGroundingViewProps {
  location: LocationData;
  seasonState: CurrentSeasonState;
}

interface WebSource {
  title: string;
  uri: string;
}

export const SearchGroundingView: React.FC<SearchGroundingViewProps> = ({
  location,
  seasonState
}) => {
  const [query, setQuery] = useState(`Current freeze warnings, frost date forecasts, and fall gardening weather advisory for ${location.name}`);
  const [isLoading, setIsLoading] = useState(false);
  const [responseMarkdown, setResponseMarkdown] = useState<string | null>(null);
  const [sources, setSources] = useState<WebSource[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (customPrompt?: string) => {
    const promptToSend = customPrompt || query;
    if (!promptToSend.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToSend })
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      setResponseMarkdown(data.text || '');

      // Extract sources from groundingChunks
      const extractedSources: WebSource[] = [];
      if (Array.isArray(data.groundingChunks)) {
        for (const chunk of data.groundingChunks) {
          if (chunk.web && chunk.web.uri) {
            extractedSources.push({
              title: chunk.web.title || chunk.web.uri,
              uri: chunk.web.uri
            });
          }
        }
      }

      setSources(extractedSources);
    } catch (err: any) {
      setError(err.message || 'Failed to search Google data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
          Google Search Grounding
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
          Live Weather, Frost & Pest Alerts
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          Grounded with real-time Google Search data. Get up-to-date regional frost advisories, agricultural extension alerts, and seasonal disease bulletins.
        </p>
      </div>

      {/* Search Input & Quick Queries */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search current frost alerts, extension updates, or pest bulletins..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white dark:focus:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-40 rounded-lg transition-colors shadow-2xs shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search with Google</span>
          </button>
        </div>

        {/* Quick query buttons */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pt-1">
          <span className="text-stone-400 dark:text-stone-500 shrink-0">Quick topics:</span>
          <button
            onClick={() => {
              const q = `Current frost warnings, overnight temperature forecast, and first frost dates for ${location.name}`;
              setQuery(q);
              handleSearch(q);
            }}
            className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md transition-colors whitespace-nowrap"
          >
            Overnight freeze & frost forecast
          </button>
          <button
            onClick={() => {
              const q = `University Extension late autumn planting guide and soil moisture conditions for ${location.region}`;
              setQuery(q);
              handleSearch(q);
            }}
            className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md transition-colors whitespace-nowrap"
          >
            Extension planting advisory
          </button>
          <button
            onClick={() => {
              const q = `Current garden pest alerts, flea beetles, and fungal blight warnings in ${location.region}`;
              setQuery(q);
              handleSearch(q);
            }}
            className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md transition-colors whitespace-nowrap"
          >
            Regional pest & blight alerts
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-lg text-rose-700 dark:text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Search Grounding Results */}
      {responseMarkdown && (
        <div className="space-y-6">
          
          {/* Grounding Sources (Mandatory Requirement) */}
          {sources.length > 0 && (
            <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
                <Globe className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span>Verified Google Search Sources ({sources.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-white dark:bg-stone-800/80 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors flex items-center justify-between gap-2 group"
                  >
                    <span className="font-medium text-stone-800 dark:text-stone-200 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 truncate">
                      {src.title}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Model Synthesis */}
          <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
            <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg">
              Live Weather & Agronomic Intelligence
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
