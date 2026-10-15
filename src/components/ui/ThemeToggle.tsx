import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'dropdown' | 'pill';
  showLabel?: boolean;
}

export function ThemeToggle({ className, variant = 'icon', showLabel = false }: ThemeToggleProps) {
  const { theme, themeMode, setThemeMode, toggleTheme, isDark } = useTheme();

  if (variant === 'pill') {
    return (
      <div 
        className={cn(
          "inline-flex items-center p-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 transition-colors",
          className
        )}
      >
        <button
          type="button"
          onClick={() => setThemeMode('light')}
          aria-label="Light mode"
          title="Light mode"
          className={cn(
            "p-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 text-xs font-medium",
            themeMode === 'light'
              ? "bg-white text-amber-600 shadow-xs dark:bg-slate-800 dark:text-amber-400"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
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
            "p-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 text-xs font-medium",
            themeMode === 'dark'
              ? "bg-white text-amber-600 shadow-xs dark:bg-slate-800 dark:text-amber-400"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
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
            "p-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 text-xs font-medium",
            themeMode === 'system'
              ? "bg-white text-amber-600 shadow-xs dark:bg-slate-800 dark:text-amber-400"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          )}
        >
          <Laptop className="w-3.5 h-3.5" />
          {showLabel && <span>Auto</span>}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all duration-200 shadow-xs inline-flex items-center justify-center gap-2",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-amber-400 transition-transform duration-200 rotate-0" />
        ) : (
          <Sun className="w-4 h-4 text-amber-600 transition-transform duration-200 rotate-0" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
}
