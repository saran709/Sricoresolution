import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useWebsiteSettings } from './WebsiteSettingsContext';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextType {
  theme: ResolvedTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const STORAGE_KEY = 'sricore_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch {
    // ignore localStorage errors
  }
  return 'light';
}

function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Convert hex to rgb for rgba tint generation
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16),
    };
  }
  return null;
}

// Lighten hex color slightly for dark mode contrast if needed
function lightenHex(hex: string, percent = 15): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * (percent / 100)));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * (percent / 100)));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * (percent / 100)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getInitialThemeMode);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemPreference);
  const { settings } = useWebsiteSettings();

  // Listen to system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (themeMode === 'system') return systemTheme;
    return themeMode;
  }, [themeMode, systemTheme]);

  const isDark = resolvedTheme === 'dark';

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextMode: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
  }, [resolvedTheme, setThemeMode]);

  // Dynamically update CSS variables and class on document root
  useEffect(() => {
    const root = document.documentElement;
    const brandTheme = settings?.theme;

    const basePrimary = brandTheme?.primary || '#d97706';
    const baseHover = brandTheme?.primaryHover || '#b45309';
    const baseAccent = brandTheme?.accent || '#f59e0b';
    const rgb = hexToRgb(basePrimary) || { r: 217, g: 119, b: 6 };
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    const frameId = requestAnimationFrame(() => {
      // Apply class and attribute
      if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }

      // Dynamic brand colors calibrated for contrast and consistency
      if (isDark) {
        // In dark mode: ensure vibrant high-contrast amber/brand primary
        const darkPrimary = basePrimary === '#d97706' ? '#f59e0b' : lightenHex(basePrimary, 12);
        const darkHover = basePrimary === '#d97706' ? '#fbbf24' : lightenHex(basePrimary, 20);
        const darkLightTint = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`;
        const darkAccent = baseAccent === '#f59e0b' ? '#fbbf24' : lightenHex(baseAccent, 10);

        root.style.setProperty('--theme-primary', darkPrimary);
        root.style.setProperty('--theme-primary-hover', darkHover);
        root.style.setProperty('--theme-primary-light', darkLightTint);
        root.style.setProperty('--theme-accent', darkAccent);
        root.style.setProperty('--theme-ring', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.45)`);

        // Surface & Layout variables (Rich Dark Palette)
        root.style.setProperty('--bg-page', '#090d16');
        root.style.setProperty('--bg-surface', '#0f172a');
        root.style.setProperty('--bg-surface-elevated', '#1e293b');
        root.style.setProperty('--bg-surface-subtle', '#111c30');
        root.style.setProperty('--bg-card', '#0f172a');
        root.style.setProperty('--bg-input', '#1a2438');

        // Typography variables
        root.style.setProperty('--text-primary', '#f8fafc');
        root.style.setProperty('--text-secondary', '#cbd5e1');
        root.style.setProperty('--text-muted', '#94a3b8');
        root.style.setProperty('--text-inverse', '#0f172a');

        // Border variables
        root.style.setProperty('--border-subtle', '#1e293b');
        root.style.setProperty('--border-default', '#223049');
        root.style.setProperty('--border-strong', '#334155');
      } else {
        // In light mode: clean branding
        root.style.setProperty('--theme-primary', basePrimary);
        root.style.setProperty('--theme-primary-hover', baseHover);
        root.style.setProperty('--theme-primary-light', brandTheme?.primaryLight || '#fffbeb');
        root.style.setProperty('--theme-accent', baseAccent);
        root.style.setProperty('--theme-ring', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);

        // Surface & Layout variables (Pure White Standard Theme)
        root.style.setProperty('--bg-page', '#ffffff');
        root.style.setProperty('--bg-surface', '#ffffff');
        root.style.setProperty('--bg-surface-elevated', '#ffffff');
        root.style.setProperty('--bg-surface-subtle', '#f8fafc');
        root.style.setProperty('--bg-card', '#ffffff');
        root.style.setProperty('--bg-input', '#ffffff');

        // Typography variables
        root.style.setProperty('--text-primary', '#0f172a');
        root.style.setProperty('--text-secondary', '#334155');
        root.style.setProperty('--text-muted', '#64748b');
        root.style.setProperty('--text-inverse', '#ffffff');

        // Border variables
        root.style.setProperty('--border-subtle', '#f1f5f9');
        root.style.setProperty('--border-default', '#e2e8f0');
        root.style.setProperty('--border-strong', '#cbd5e1');
      }

      // Sync theme-color meta tag for browser mobile header
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#090d16' : '#d97706');
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [isDark, settings?.theme]);

  const value = useMemo(
    () => ({
      theme: resolvedTheme,
      themeMode,
      setThemeMode,
      toggleTheme,
      isDark,
    }),
    [resolvedTheme, themeMode, setThemeMode, toggleTheme, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
