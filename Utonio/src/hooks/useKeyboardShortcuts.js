import { useEffect } from 'react';

function normalizeKey(e) {
  const parts = [];
  if (e.ctrlKey || e.metaKey) parts.push('mod');
  if (e.shiftKey) parts.push('shift');
  if (e.altKey) parts.push('alt');
  let key = e.key;
  if (key === ' ') key = 'space';
  else if (key.length === 1) key = key.toLowerCase();
  parts.push(key);
  return parts.join('+');
}

function isTypingTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

export default function useKeyboardShortcuts(map, { ignoreInputs = true } = {}) {
  useEffect(() => {
    const handler = (e) => {
      if (ignoreInputs && isTypingTarget(e.target)) {
        if (e.key !== 'Escape') return;
      }
      const combo = normalizeKey(e);
      const entry = map[combo];
      if (entry) {
        const fn = typeof entry === 'function' ? entry : entry.handler;
        const allowInInput = typeof entry === 'object' && entry.allowInInput;
        if (isTypingTarget(e.target) && !allowInInput && e.key !== 'Escape') return;
        e.preventDefault();
        fn(e);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [map, ignoreInputs]);
}

export { normalizeKey };
