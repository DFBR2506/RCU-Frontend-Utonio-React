import { useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastContext } from '../../contexts/toastContextObject.js';
import './Toast.css';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const AUTO_DISMISS_MS = 3500;
const MAX_VISIBLE = 4;

function ToastItem({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || Info;

  return (
    <div
      className={`toast toast-${toast.type}`}
      role="status"
      aria-live="polite"
      onClick={() => onDismiss(toast.id)}
    >
      <span className="toast-icon">
        <Icon size={18} />
      </span>
      <div className="toast-body">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
      </div>
      <button
        className="toast-close"
        onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
      {toast.duration !== 0 && (
        <div
          className="toast-progress"
          style={{ animationDuration: `${toast.duration ?? AUTO_DISMISS_MS}ms` }}
        />
      )}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback((type, message, options = {}) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const toast = {
      id,
      type,
      message,
      title: options.title,
      duration: options.duration ?? AUTO_DISMISS_MS,
    };
    setToasts((prev) => [...prev, toast].slice(-MAX_VISIBLE));
    if (toast.duration > 0) {
      const timer = setTimeout(() => dismiss(id), toast.duration);
      timers.current.set(id, timer);
    }
    return id;
  }, [dismiss]);

  const api = {
    success: (message, options) => show('success', message, options),
    error: (message, options) => show('error', message, options),
    info: (message, options) => show('info', message, options),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-viewport" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
