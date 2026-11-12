import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

export interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'switch' | 'dropdown' | 'pill' | 'fab';
  showLabel?: boolean;
}

export function ThemeToggle({
  className,
  variant = 'icon',
  showLabel = false,
}: ThemeToggleProps) {
  const { themeMode, setThemeMode, toggleTheme, isDark } = useTheme();

  if (variant === 'switch') {
    return (
      <div
        role="group"
        aria-label="Theme switcher"
        className={cn(
          'inline-flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 transition-colors',
          className
        )}
      >
        <button
          type="button"
          onClick={() => setThemeMode('light')}
          aria-pressed={!isDark}
          aria-label="Switch to light theme"
          title="Light theme"
          className={cn(
            'px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer',
            !isDark
              ? 'bg-white text-amber-600 shadow-xs dark:bg-slate-800 dark:text-amber-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setThemeMode('dark')}
          aria-pressed={isDark}
          aria-label="Switch to dark theme"
          title="Dark theme"
          className={cn(
            'px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer',
            isDark
              ? 'bg-slate-800 text-amber-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <div
        role="group"
        aria-label="Theme mode selector"
        className={cn(
          'inline-flex items-center p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 transition-colors',
          className
        )}
      >
        <button
          type="button"
          onClick={() => setThemeMode('light')}
          aria-label="Light mode"
          title="Light mode"
          className={cn(
            'p-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 text-xs font-medium cursor-pointer',
            themeMode === 'light'
              ? 'bg-white text-amber-600 shadow-xs dark:bg-slate-800 dark:text-amber-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <Sun className="w-3.5 h-3.5" />
          {showLabel && <span>Light</span>}
        </button>
        <button
          type="button"
          onClick={() => setThemeMode('dark')}
          aria-label="Dark mode"
          title="Dark mode"
          className={cn(
            'p-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 text-xs font-medium cursor-pointer',
            themeMode === 'dark'
              ? 'bg-white text-amber-600 shadow-xs dark:bg-slate-800 dark:text-amber-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <Moon className="w-3.5 h-3.5" />
          {showLabel && <span>Dark</span>}
        </button>
        <button
          type="button"
          onClick={() => setThemeMode('system')}
          aria-label="System preference"
          title="Match system theme"
          className={cn(
            'p-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 text-xs font-medium cursor-pointer',
            themeMode === 'system'
              ? 'bg-white text-amber-600 shadow-xs dark:bg-slate-800 dark:text-amber-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <Laptop className="w-3.5 h-3.5" />
          {showLabel && <span>Auto</span>}
        </button>
      </div>
    );
  }

  if (variant === 'fab') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        className={cn(
          'fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 shadow-lg hover:border-amber-500 dark:hover:border-amber-400 transition-all cursor-pointer',
          className
        )}
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold hidden sm:inline">Light Theme</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold hidden sm:inline">Dark Theme</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all duration-200 shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-amber-400 transition-transform duration-200" />
        ) : (
          <Sun className="w-4 h-4 text-amber-600 transition-transform duration-200" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium">{isDark ? 'Dark' : 'Light'}</span>
      )}
    </button>
  );
}

export default ThemeToggle;
