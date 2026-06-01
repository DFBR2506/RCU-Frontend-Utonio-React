import './EmptyState.css';

export default function EmptyState({
  variant = 'generic',
  title = 'Nothing here yet',
  message = 'No data to display.',
  action,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-illustration" aria-hidden="true">
        {variant === 'appointments' && <AppointmentsIllustration />}
        {variant === 'patients' && <PatientsIllustration />}
        {variant === 'doctors' && <DoctorsIllustration />}
        {variant === 'search' && <SearchIllustration />}
        {variant === 'generic' && <GenericIllustration />}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

function GenericIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="48" fill="var(--glass-bg)" stroke="var(--border)" strokeWidth="1" />
      <path
        d="M40 70 Q60 50 80 70"
        stroke="var(--text-secondary)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      <circle cx="48" cy="52" r="2.5" fill="var(--text-secondary)" opacity="0.4" />
      <circle cx="72" cy="52" r="2.5" fill="var(--text-secondary)" opacity="0.4" />
    </svg>
  );
}

function AppointmentsIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="24" y="32" width="72" height="64" rx="10" fill="var(--glass-bg)" stroke="var(--border)" strokeWidth="1" />
      <rect x="24" y="32" width="72" height="16" rx="10" fill="var(--accent-lime-dim)" />
      <rect x="34" y="20" width="4" height="16" rx="2" fill="var(--accent-lime)" />
      <rect x="82" y="20" width="4" height="16" rx="2" fill="var(--accent-lime)" />
      <line x1="36" y1="60" x2="60" y2="60" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="36" y1="72" x2="76" y2="72" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <line x1="36" y1="84" x2="64" y2="84" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function PatientsIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="48" r="20" fill="var(--accent-violet-dim)" />
      <circle cx="60" cy="44" r="8" fill="var(--accent-violet)" opacity="0.5" />
      <path
        d="M40 86 Q40 68 60 68 Q80 68 80 86"
        fill="var(--accent-violet)"
        opacity="0.4"
      />
    </svg>
  );
}

function DoctorsIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="40" fill="var(--accent-cyan)" opacity="0.08" />
      <path
        d="M60 44v32M44 60h32"
        stroke="var(--accent-cyan)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

function SearchIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="54" cy="54" r="22" stroke="var(--text-secondary)" strokeWidth="2" opacity="0.4" />
      <line
        x1="70"
        y1="70"
        x2="86"
        y2="86"
        stroke="var(--text-secondary)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}
