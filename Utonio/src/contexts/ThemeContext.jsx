import { useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeContext } from './themeContextObject.js';

const STORAGE_KEY = 'utonio-theme';
const ACCENT_KEY = 'utonio-accent';
const FONT_KEY = 'utonio-font-scale';

const ACCENT_PRESETS = [
  { id: 'lime',   label: 'Lime',   color: '#C8F55A' },
  { id: 'violet', label: 'Violet', color: '#7B6EF6' },
  { id: 'cyan',   label: 'Cyan',   color: '#00BCD4' },
  { id: 'orange', label: 'Orange', color: '#FF9A3C' },
  { id: 'rose',   label: 'Rose',   color: '#F25C8F' },
];

const FONT_SCALES = {
  small: '0.9rem',
  medium: '1rem',
  large: '1.125rem',
};

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

function applyAccent(accent) {
  if (typeof document === 'undefined') return;
  const preset = ACCENT_PRESETS.find(a => a.id === accent) || ACCENT_PRESETS[0];
  document.documentElement.style.setProperty('--accent-lime', preset.color);
}

function applyFontScale(scale) {
  if (typeof document === 'undefined') return;
  const value = FONT_SCALES[scale] || FONT_SCALES.medium;
  document.documentElement.style.setProperty('--font-scale', value);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [accent, setAccent] = useState(() => {
    if (typeof window === 'undefined') return 'lime';
    return window.localStorage.getItem(ACCENT_KEY) || 'lime';
  });
  const [fontScale, setFontScale] = useState(() => {
    if (typeof window === 'undefined') return 'medium';
    return window.localStorage.getItem(FONT_KEY) || 'medium';
  });

  useEffect(() => {
    applyTheme(theme);
    try { window.localStorage.setItem(STORAGE_KEY, theme); } catch { /* noop */ }
  }, [theme]);

  useEffect(() => {
    applyAccent(accent);
    try { window.localStorage.setItem(ACCENT_KEY, accent); } catch { /* noop */ }
  }, [accent]);

  useEffect(() => {
    applyFontScale(fontScale);
    try { window.localStorage.setItem(FONT_KEY, fontScale); } catch { /* noop */ }
  }, [fontScale]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme,
    accent,
    setAccent,
    accentPresets: ACCENT_PRESETS,
    fontScale,
    setFontScale,
    fontScales: Object.keys(FONT_SCALES),
    isDark: theme === 'dark',
  }), [theme, accent, fontScale, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
