import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = () => {
    if (theme === 'auto') {
      return <Laptop className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
    if (theme === 'dark') {
      return <Moon className="w-4 h-4 text-sky-500 dark:text-sky-400" />;
    }
    return <Sun className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Icon-Only Theme Button (Symbol instead of full name) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Theme: ${theme} (active: ${resolvedTheme})`}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white transition-colors border border-stone-200 dark:border-stone-700 shadow-2xs"
        title={`Theme: ${theme.toUpperCase()} (${resolvedTheme === 'dark' ? 'Dark' : 'Light'}) - Click to change`}
      >
        {getIcon()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-xl py-1 z-50 text-xs text-stone-700 dark:text-stone-200 animate-in fade-in">
          <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800">
            {t('theme.appearance', 'Appearance')}
          </div>

          <button
            onClick={() => {
              setTheme('light');
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/80 transition-colors ${
              theme === 'light' ? 'text-amber-600 dark:text-amber-400 font-semibold bg-amber-50/50 dark:bg-amber-950/20' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{t('theme.light', 'Light Mode')}</span>
            </div>
            {theme === 'light' && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
          </button>

          <button
            onClick={() => {
              setTheme('dark');
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/80 transition-colors ${
              theme === 'dark' ? 'text-sky-600 dark:text-sky-400 font-semibold bg-sky-50/50 dark:bg-sky-950/20' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-sky-500" />
              <span>{t('theme.dark', 'Dark Mode')}</span>
            </div>
            {theme === 'dark' && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
          </button>

          <button
            onClick={() => {
              setTheme('auto');
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/80 transition-colors ${
              theme === 'auto' ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/50 dark:bg-emerald-950/20' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-emerald-500" />
              <div>
                <span>{t('theme.auto', 'Auto')}</span>
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-normal">
                  {resolvedTheme === 'dark' ? 'Dark active' : 'Light active'}
                </span>
              </div>
            </div>
            {theme === 'auto' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          </button>
        </div>
      )}
    </div>
  );
};
