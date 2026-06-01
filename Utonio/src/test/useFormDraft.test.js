import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useFormDraft, { draftAge } from '../hooks/useFormDraft';

describe('useFormDraft', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with the initial state when no draft exists', () => {
    const { result } = renderHook(() => useFormDraft('test', { name: '', email: '' }));
    expect(result.current.state).toEqual({ name: '', email: '' });
    expect(result.current.hasDraft).toBe(false);
  });

  it('restores state from localStorage on init', () => {
    localStorage.setItem('utonio-draft-test', JSON.stringify({
      values: { name: 'Alice', email: 'a@x.com' },
      savedAt: Date.now(),
    }));
    const { result } = renderHook(() => useFormDraft('test', { name: '', email: '' }));
    expect(result.current.state.name).toBe('Alice');
    expect(result.current.hasDraft).toBe(true);
  });

  it('clear() removes the draft and resets hasDraft', () => {
    localStorage.setItem('utonio-draft-test', JSON.stringify({
      values: { name: 'Bob' },
      savedAt: Date.now(),
    }));
    const { result } = renderHook(() => useFormDraft('test', { name: '' }));
    expect(result.current.hasDraft).toBe(true);
    act(() => result.current.clear());
    expect(result.current.hasDraft).toBe(false);
    expect(localStorage.getItem('utonio-draft-test')).toBeNull();
  });

  it('reset() returns state to the initial baseline', () => {
    localStorage.setItem('utonio-draft-test', JSON.stringify({
      values: { name: 'Carl' },
      savedAt: Date.now(),
    }));
    const { result } = renderHook(() => useFormDraft('test', { name: 'INIT' }));
    act(() => result.current.reset());
    expect(result.current.state).toEqual({ name: 'INIT' });
  });
});

describe('draftAge', () => {
  it('returns null when no timestamp is provided', () => {
    expect(draftAge(null)).toBeNull();
    expect(draftAge(undefined)).toBeNull();
  });

  it('returns "just now" for under a minute', () => {
    expect(draftAge(Date.now() - 5000)).toBe('just now');
  });

  it('returns minutes for under an hour', () => {
    expect(draftAge(Date.now() - 5 * 60 * 1000)).toBe('5 min ago');
  });

  it('returns hours for under a day', () => {
    expect(draftAge(Date.now() - 3 * 60 * 60 * 1000)).toBe('3 hr ago');
  });

  it('returns days for over a day', () => {
    expect(draftAge(Date.now() - 2 * 24 * 60 * 60 * 1000)).toBe('2 days ago');
  });

  it('returns "1 day ago" (singular) for exactly one day', () => {
    expect(draftAge(Date.now() - 24 * 60 * 60 * 1000)).toBe('1 day ago');
  });
});
