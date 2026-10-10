import React from 'react';
import { MapPin, Thermometer, Mic } from 'lucide-react';
import { LocationData } from '../types/garden';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../context/LanguageContext';

export type AppTab = 'this_week' | 'calendar' | 'beds' | 'chat' | 'maps' | 'search' | 'guide';

interface HeaderProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  location: LocationData;
  onOpenLocationModal: () => void;
  onOpenVoiceCall: () => void;
  isCelsius: boolean;
  onToggleTempUnit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  location,
  onOpenLocationModal,
  onOpenVoiceCall,
  isCelsius,
  onToggleTempUnit
}) => {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 shadow-xs transition-colors duration-150">
      {/* Strict 3-zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => onSelectTab('this_week')}>
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-serif font-bold text-lg shadow-inner">
            🌱
          </div>
          <span className="text-xl font-serif font-bold tracking-tight text-stone-900 dark:text-white whitespace-nowrap">
            FrostSow
          </span>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-stone-600 dark:text-stone-300">
          <button
            onClick={() => onSelectTab('this_week')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
              currentTab === 'this_week'
                ? 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-white font-semibold'
                : 'border-transparent text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {t('nav.this_week', 'This Week')}
          </button>
          <button
            onClick={() => onSelectTab('calendar')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
              currentTab === 'calendar'
                ? 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-white font-semibold'
                : 'border-transparent text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {t('nav.calendar', 'Calendar')}
          </button>
          <button
            onClick={() => onSelectTab('beds')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
              currentTab === 'beds'
                ? 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-white font-semibold'
                : 'border-transparent text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {t('nav.beds', 'My Beds')}
          </button>
          <button
            onClick={() => onSelectTab('chat')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 flex items-center gap-1 ${
              currentTab === 'chat'
                ? 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-white font-semibold'
                : 'border-transparent text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <span>{t('nav.chat', 'Advisor Chat')}</span>
          </button>
          <button
            onClick={() => onSelectTab('maps')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
              currentTab === 'maps'
                ? 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-white font-semibold'
                : 'border-transparent text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {t('nav.maps', 'Nurseries (Maps)')}
          </button>
          <button
            onClick={() => onSelectTab('search')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
              currentTab === 'search'
                ? 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-white font-semibold'
                : 'border-transparent text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {t('nav.search', 'Frost Alerts (Search)')}
          </button>
          <button
            onClick={() => onSelectTab('guide')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
              currentTab === 'guide'
                ? 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-white font-semibold'
                : 'border-transparent text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {t('nav.guide', 'Frost Guide')}
          </button>
        </nav>

        {/* Zone 3: Actions + Live Voice API + Location + Language + Theme */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Live Voice Call Button */}
          <button
            onClick={onOpenVoiceCall}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700/60 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="Start live voice conversation with gemini-3.8-live"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">{t('nav.voice_call', 'Voice Call')}</span>
          </button>

          {/* Unit Toggle */}
          <button
            onClick={onToggleTempUnit}
            title="Toggle Fahrenheit / Celsius"
            className="flex items-center gap-1 h-8 px-2.5 text-xs font-mono text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white rounded-lg transition-colors border border-stone-200 dark:border-stone-700 shadow-2xs"
          >
            <Thermometer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isCelsius ? '°C' : '°F'}</span>
          </button>

          {/* Language Switcher (feature for user to change language) */}
          <LanguageToggle />

          {/* Theme Toggle (Symbol only instead of full name) */}
          <ThemeToggle />

          {/* Location Button */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
            <span className="truncate max-w-[100px] sm:max-w-none">{location.name}</span>
          </button>
        </div>
      </div>

      {/* Responsive Secondary Nav Strip for mobile/tablet */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto border-t border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/95 py-2 px-3 text-xs font-medium text-stone-600 dark:text-stone-300 scrollbar-none">
        <button
          onClick={() => onSelectTab('this_week')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'this_week' ? 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs' : 'text-stone-600 dark:text-stone-300'}`}
        >
          {t('nav.this_week', 'This Week')}
        </button>
        <button
          onClick={() => onSelectTab('calendar')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'calendar' ? 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs' : 'text-stone-600 dark:text-stone-300'}`}
        >
          {t('nav.calendar', 'Calendar')}
        </button>
        <button
          onClick={() => onSelectTab('beds')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'beds' ? 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs' : 'text-stone-600 dark:text-stone-300'}`}
        >
          {t('nav.beds', 'Beds')}
        </button>
        <button
          onClick={() => onSelectTab('chat')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'chat' ? 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs' : 'text-stone-600 dark:text-stone-300'}`}
        >
          {t('nav.chat', 'Advisor Chat')}
        </button>
        <button
          onClick={() => onSelectTab('maps')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'maps' ? 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs' : 'text-stone-600 dark:text-stone-300'}`}
        >
          {t('nav.maps', 'Nurseries (Maps)')}
        </button>
        <button
          onClick={() => onSelectTab('search')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'search' ? 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs' : 'text-stone-600 dark:text-stone-300'}`}
        >
          {t('nav.search', 'Alerts (Search)')}
        </button>
        <button
          onClick={() => onSelectTab('guide')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'guide' ? 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs' : 'text-stone-600 dark:text-stone-300'}`}
        >
          {t('nav.guide', 'Frost Guide')}
        </button>
      </div>
    </header>
  );
};
