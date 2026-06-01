import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useTheme } from '../hooks/useTheme';

function wrapper({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('starts in dark mode by default when no preference is stored', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  it('reads stored theme from localStorage on init', () => {
    localStorage.setItem('utonio-theme', 'light');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('light');
  });

  it('toggleTheme flips between dark and light', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('dark');
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('light');
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('setTheme explicitly sets a value', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setTheme('light'));
    expect(result.current.theme).toBe('light');
  });

  it('persists theme to localStorage on change', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setTheme('light'));
    expect(localStorage.getItem('utonio-theme')).toBe('light');
  });

  it('exposes 5 accent presets', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.accentPresets).toHaveLength(5);
    expect(result.current.accentPresets.map(a => a.id)).toEqual(['lime', 'violet', 'cyan', 'orange', 'rose']);
  });

  it('setAccent updates the accent and applies CSS var', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setAccent('violet'));
    expect(result.current.accent).toBe('violet');
    expect(localStorage.getItem('utonio-accent')).toBe('violet');
  });

  it('setFontScale updates font scale and applies CSS var', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setFontScale('large'));
    expect(result.current.fontScale).toBe('large');
    expect(localStorage.getItem('utonio-font-scale')).toBe('large');
  });

  it('isDark reflects current theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.isDark).toBe(true);
    act(() => result.current.setTheme('light'));
    expect(result.current.isDark).toBe(false);
  });

  it('throws if used outside a provider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(/must be used inside/);
  });
});
