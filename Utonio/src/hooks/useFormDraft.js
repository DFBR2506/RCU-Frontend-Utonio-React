import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const STORAGE_PREFIX = 'utonio-draft-';

function readDraft(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.values) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDraft(key, values) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify({
      values,
      savedAt: Date.now(),
    }));
  } catch {
    /* quota exceeded or storage disabled */
  }
}

function removeDraft(key) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    /* ignore */
  }
}

function shallowEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

export default function useFormDraft(key, initialState) {
  const base = useMemo(
    () => (typeof initialState === 'function' ? initialState() : initialState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [state, setState] = useState(() => {
    const draft = readDraft(key);
    if (draft && draft.values) {
      return { ...base, ...draft.values };
    }
    return base;
  });

  const [hasDraft, setHasDraft] = useState(() => {
    const draft = readDraft(key);
    if (!draft || !draft.values) return false;
    const merged = { ...base, ...draft.values };
    return !shallowEqual(merged, base);
  });

  const [savedAt, setSavedAt] = useState(() => readDraft(key)?.savedAt ?? null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (shallowEqual(state, base)) {
      removeDraft(key);
      Promise.resolve().then(() => {
        setHasDraft(false);
        setSavedAt(null);
      });
      return;
    }
    writeDraft(key, state);
    Promise.resolve().then(() => {
      setHasDraft(true);
      setSavedAt(Date.now());
    });
  }, [state, key, base]);

  const clear = useCallback(() => {
    removeDraft(key);
    setHasDraft(false);
    setSavedAt(null);
  }, [key]);

  const reset = useCallback(() => {
    clear();
    setState(base);
  }, [clear, base]);

  return { state, setState, hasDraft, savedAt, clear, reset };
}

export function draftAge(savedAt) {
  if (!savedAt) return null;
  const diff = Date.now() - savedAt;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day === 1 ? '' : 's'} ago`;
}
