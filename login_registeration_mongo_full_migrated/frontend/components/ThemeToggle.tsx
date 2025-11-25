'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    { id: 'system', label: '🌗 System', icon: 'ri-computer-line' },
    { id: 'light', label: '☀️ Light', icon: 'ri-sun-line' },
    { id: 'dark', label: '🌙 Dark', icon: 'ri-moon-line' },
  ];

  const currentIcon = resolvedTheme === 'dark' ? 'ri-moon-line' : 'ri-sun-line';

  if (!mounted) return null;

  return (
    <div className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
        aria-label="Toggle theme"
      >
        <i className={`${currentIcon} text-lg text-gray-700 dark:text-gray-200`}></i>
      </button>

      {open && (
        <>
          {/* Background click layer */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          ></div>

          <div className="absolute right-0 top-12 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 w-44 animate-in fade-in zoom-in duration-200">
            {themes.map(({ id, label, icon }) => {
              const active =
                theme === id || (theme === 'system' && id === 'system');

              return (
                <button
                  key={id}
                  onClick={() => {
                    setTheme(id);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <i className={`${icon} w-4 h-4`}></i>
                  <span>{label}</span>
                  {active && <i className="ri-check-line ml-auto" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
