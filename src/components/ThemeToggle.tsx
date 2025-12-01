'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sistem tercihini kontrol et
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem('theme');
    
    if (saved) {
      setIsDark(saved === 'dark');
      applyTheme(saved === 'dark');
    } else {
      setIsDark(prefersDark);
      applyTheme(prefersDark);
    }
  }, []);

  const applyTheme = (dark: boolean) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.remove('light-mode');
      html.classList.add('dark-mode');
      html.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark-mode');
      html.classList.add('light-mode');
      html.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    applyTheme(newIsDark);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 border border-white/10 hover:border-white/20 group"
      title={isDark ? 'Açık tema' : 'Koyu tema'}
      aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon for dark mode (shows sun to switch to light) */}
        <svg
          className={`absolute inset-0 w-5 h-5 text-yellow-400 transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
        
        {/* Moon icon for light mode (shows moon to switch to dark) */}
        <svg
          className={`absolute inset-0 w-5 h-5 text-indigo-400 transition-all duration-300 ${
            !isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </div>
    </button>
  );
}
