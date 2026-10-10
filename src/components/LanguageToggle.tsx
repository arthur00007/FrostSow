import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '../context/LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, currentOption, t } = useLanguage();
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Symbol + Lang Code Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Language: ${currentOption.label}`}
        className="flex items-center gap-1 h-8 px-2 rounded-lg text-xs font-mono text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white transition-colors border border-stone-200 dark:border-stone-700 shadow-2xs"
        title={`Language: ${currentOption.nativeName} (${currentOption.label}) - Click to change`}
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="font-semibold uppercase tracking-wider text-[11px]">{language}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-xl py-1 z-50 text-xs text-stone-700 dark:text-stone-200 animate-in fade-in">
          <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800">
            {t('lang.language', 'Language')}
          </div>

          <div className="max-h-60 overflow-y-auto py-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as LanguageCode);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/80 transition-colors ${
                    isSelected
                      ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/60 dark:bg-emerald-950/30'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium text-stone-900 dark:text-stone-100">
                        {lang.nativeName}
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500">
                        {lang.label}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
