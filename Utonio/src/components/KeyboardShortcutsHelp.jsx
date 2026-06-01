import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import './KeyboardShortcutsHelp.css';

const SHORTCUTS = [
  { combo: 'N', label: 'New appointment' },
  { combo: '/', label: 'Focus search' },
  { combo: 'Esc', label: 'Close panel / dialog' },
  { combo: 'G then D', label: 'Go to Dashboard' },
  { combo: 'G then A', label: 'Go to Appointments' },
  { combo: 'G then P', label: 'Go to Patients' },
  { combo: 'G then R', label: 'Go to Reports' },
  { combo: '?', label: 'Show keyboard shortcuts' },
];

export default function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useKeyboardShortcuts({
    '?': () => setOpen(true),
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="shortcuts-overlay" onClick={() => setOpen(false)}>
      <div className="shortcuts-panel" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2 className="shortcuts-title">Keyboard Shortcuts</h2>
          <button className="shortcuts-close" onClick={() => setOpen(false)} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <ul className="shortcuts-list">
          {SHORTCUTS.map((s) => (
            <li key={s.combo} className="shortcuts-item">
              <span className="shortcuts-label">{s.label}</span>
              <kbd className="shortcuts-keys">{s.combo}</kbd>
            </li>
          ))}
        </ul>
        <p className="shortcuts-hint">Press <kbd>?</kbd> any time to reopen this dialog.</p>
      </div>
    </div>
  );
}
