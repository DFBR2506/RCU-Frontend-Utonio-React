import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Compass, Keyboard, CalendarPlus, BarChart2, ArrowRight, ArrowLeft, X, Sparkles,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import './OnboardingTour.css';

const STORAGE_KEY = 'utonio-onboarding-seen-v1';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Utonio',
    body: 'Utonio is your medical office reservation platform. Let us show you around in 30 seconds.',
    Icon: Sparkles,
    accent: 'var(--accent-lime)',
  },
  {
    id: 'dock',
    title: 'The Dock is your home base',
    body: 'Use the dock at the bottom of the screen to jump between Dashboard, Patients, Doctors, Appointments, Availability, Reports and Settings. It even magnifies when you hover, just like macOS.',
    Icon: Compass,
    accent: 'var(--accent-lime)',
  },
  {
    id: 'shortcuts',
    title: 'Move at the speed of thought',
    body: 'Press N anywhere to create a new appointment, then G followed by D, A, P, or R to jump to Dashboard, Appointments, Patients, or Reports. Press ? to see them all.',
    Icon: Keyboard,
    accent: 'var(--accent-violet)',
  },
  {
    id: 'first-appointment',
    title: 'Schedule in seconds',
    body: 'From the Dashboard or Appointments page, hit the green "New Appointment" button. The 6-step wizard saves your progress as you go, so you can close the tab and pick up where you left off.',
    Icon: CalendarPlus,
    accent: 'var(--accent-green)',
  },
  {
    id: 'insights',
    title: 'Insights that matter',
    body: 'The Reports page has three tabs: office occupancy, doctor productivity, and patient no-show patterns. Everything updates live as you change filters.',
    Icon: BarChart2,
    accent: 'var(--accent-cyan)',
  },
];

export default function OnboardingTour() {
  const toast = useToast();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        Promise.resolve().then(() => setOpen(true));
      }
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') finish(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;
  if (location.pathname === '/login') return null;

  const current = STEPS[step];
  const Icon = current.Icon;
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  function next() {
    if (isLast) {
      finish();
    } else {
      setStep(step + 1);
    }
  }

  function prev() {
    if (!isFirst) setStep(step - 1);
  }

  function finish(silent = false) {
    try { window.localStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
    setOpen(false);
    if (!silent) {
      Promise.resolve().then(() => {
        toast.success('Tour complete — enjoy Utonio!', { title: 'Ready to go' });
      });
    }
  }

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding-backdrop" onClick={() => finish(true)} />
      <div className="onboarding-card" style={{ '--tour-accent': current.accent }}>
        <button className="onboarding-close" onClick={() => finish(true)} aria-label="Close tour">
          <X size={14} />
        </button>

        <div className="onboarding-icon">
          <Icon size={28} color="white" strokeWidth={2} />
        </div>

        <h2 id="onboarding-title" className="onboarding-title">{current.title}</h2>
        <p className="onboarding-body">{current.body}</p>

        <div className="onboarding-progress">
          {STEPS.map((s, i) => (
            <span
              key={s.id}
              className={`onboarding-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
            />
          ))}
        </div>

        <div className="onboarding-footer">
          <span className="onboarding-step-count">
            {step + 1} of {STEPS.length}
          </span>
          <div className="onboarding-actions">
            {!isFirst ? (
              <button className="onboarding-btn ghost" onClick={prev}>
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <button className="onboarding-btn ghost" onClick={() => finish()}>
                Skip tour
              </button>
            )}
            <button className="onboarding-btn primary" onClick={next}>
              {isLast ? 'Finish' : 'Next'}
              {!isLast && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
