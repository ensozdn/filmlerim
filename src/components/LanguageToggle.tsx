'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
      className="relative inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 border border-white/10 hover:border-white/20 group"
      title={language === 'tr' ? 'Switch to English' : 'Türkçeye Geç'}
      aria-label="Change language"
    >
      <div className="flex items-center gap-1">
        <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">
          {language === 'tr' ? 'TR' : 'EN'}
        </span>
        <svg className="w-3 h-3 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      </div>
    </button>
  );
}
