import { createContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  /** The user's raw preference — may be 'system'. */
  theme: Theme;
  /** The theme actually applied to the DOM right now ('light' | 'dark'). */
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

// eslint-disable-next-line react-refresh/only-export-components -- context must live next to its Provider
export const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'ltms-theme';

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

/**
 * App-wide theme controller: Light / Dark / System.
 *
 * Why a custom provider instead of a library: the only job here is
 * (1) persist one string in localStorage, (2) toggle a `.dark` class,
 * and (3) listen for OS theme changes when the user picked 'system'.
 * That's ~30 lines — a dependency would cost more than it saves, and we
 * keep full control over SSR-free, Vite-only behavior.
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return stored ?? 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    theme === 'system' ? getSystemTheme() : theme,
  );

  useEffect(() => {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(resolved);
    applyTheme(resolved);

    if (theme !== 'system') return;

    // Keep following the OS if the user is on 'system' and flips it live.
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const next = getSystemTheme();
      setResolvedTheme(next);
      applyTheme(next);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  };

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
