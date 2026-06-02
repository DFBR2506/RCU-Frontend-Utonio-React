import { useState, useEffect } from 'react';
import { Globe, Palette, Sun, Moon, Bell, User as UserIcon, Lock, AlertTriangle, Check, Eye, EyeOff, Save, Compass, Building2, Stethoscope, Plus, Power, X } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../hooks/useTheme';
import { getOffices, createOffice, updateOffice } from '../api/officesApi';
import { getAppointmentTypes, createAppointmentType } from '../api/appointmentTypesApi';
import CustomToggle from '../components/UI/CustomToggle';
import FloatingField from '../components/UI/FloatingField';
import SlideOver from '../components/UI/SlideOver';
import ErrorBoundary from '../components/UI/ErrorBoundary';
import './Settings.css';

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Spanish' },
  { id: 'pt', label: 'Portuguese' },
];

const DATE_FORMATS = [
  { id: 'mdy', label: 'MM/DD/YYYY', sample: '06/01/2026' },
  { id: 'dmy', label: 'DD/MM/YYYY', sample: '01/06/2026' },
];

const TIMEZONES = [
  { id: 'utc', label: 'UTC' },
  { id: 'america-new_york', label: 'America / New York' },
  { id: 'america-los_angeles', label: 'America / Los Angeles' },
  { id: 'america-mexico_city', label: 'America / Mexico City' },
  { id: 'america-bogota', label: 'America / Bogota' },
  { id: 'america-sao_paulo', label: 'America / Sao Paulo' },
  { id: 'europe-london', label: 'Europe / London' },
  { id: 'europe-madrid', label: 'Europe / Madrid' },
];

const FONT_SIZE_OPTIONS = [
  { id: 'small', label: 'Small', preview: 'Aa' },
  { id: 'medium', label: 'Medium', preview: 'Aa' },
  { id: 'large', label: 'Large', preview: 'Aa' },
];

function SettingsInner() {
  const { user } = useAuth();
  const toast = useToast();
  const { theme, setTheme, accent, setAccent, accentPresets, fontScale, setFontScale } = useTheme();

  // ── Administration state ──────────────────────────────────────────────────
  const [offices, setOffices] = useState([]);
  const [apptTypes, setApptTypes] = useState([]);
  const [adminLoading, setAdminLoading] = useState(true);

  const [officeSlideOpen, setOfficeSlideOpen] = useState(false);
  const [officeForm, setOfficeForm] = useState({ code: '', floor: '' });
  const [officeErrors, setOfficeErrors] = useState({});
  const [savingOffice, setSavingOffice] = useState(false);

  const [typeSlideOpen, setTypeSlideOpen] = useState(false);
  const [typeForm, setTypeForm] = useState({ name: '', description: '', durationMinutes: '30' });
  const [typeErrors, setTypeErrors] = useState({});
  const [savingType, setSavingType] = useState(false);

  useEffect(() => {
    Promise.all([getOffices(), getAppointmentTypes()])
      .then(([offsData, typesData]) => {
        setOffices(offsData.content || (Array.isArray(offsData) ? offsData : []));
        setApptTypes(typesData.content || (Array.isArray(typesData) ? typesData : []));
      })
      .catch(() => toast.error('Could not load administration data'))
      .finally(() => setAdminLoading(false));
  }, []);

  async function handleCreateOffice(e) {
    e.preventDefault();
    const errs = {};
    if (!officeForm.code.trim()) errs.code = 'Required';
    if (!officeForm.floor || isNaN(parseInt(officeForm.floor)) || parseInt(officeForm.floor) < 1) errs.floor = 'Must be a positive number';
    setOfficeErrors(errs);
    if (Object.keys(errs).length) return;
    setSavingOffice(true);
    try {
      await createOffice({ code: officeForm.code.trim(), floor: parseInt(officeForm.floor) });
      toast.success(`Office ${officeForm.code} created`);
      const fresh = await getOffices();
      setOffices(fresh.content || (Array.isArray(fresh) ? fresh : []));
      setOfficeSlideOpen(false);
      setOfficeForm({ code: '', floor: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not create office');
    } finally {
      setSavingOffice(false);
    }
  }

  async function toggleOffice(office) {
    try {
      await updateOffice(office.id, { active: !office.active });
      setOffices(prev => prev.map(o => o.id === office.id ? { ...o, active: !o.active } : o));
      toast.info(`Office ${office.code} marked as ${!office.active ? 'active' : 'inactive'}`);
    } catch {
      toast.error('Could not update office');
    }
  }

  async function handleCreateType(e) {
    e.preventDefault();
    const errs = {};
    if (!typeForm.name.trim()) errs.name = 'Required';
    if (!typeForm.durationMinutes || isNaN(parseInt(typeForm.durationMinutes)) || parseInt(typeForm.durationMinutes) < 1) errs.durationMinutes = 'Must be a positive number';
    setTypeErrors(errs);
    if (Object.keys(errs).length) return;
    setSavingType(true);
    try {
      await createAppointmentType({
        name: typeForm.name.trim(),
        description: typeForm.description.trim() || typeForm.name.trim(),
        durationMinutes: typeForm.durationMinutes,
      });
      toast.success(`Appointment type "${typeForm.name}" created`);
      const fresh = await getAppointmentTypes();
      setApptTypes(fresh.content || (Array.isArray(fresh) ? fresh : []));
      setTypeSlideOpen(false);
      setTypeForm({ name: '', description: '', durationMinutes: '30' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not create appointment type');
    } finally {
      setSavingType(false);
    }
  }

  const [language, setLanguage] = useState('en');
  const [dateFormat, setDateFormat] = useState('mdy');
  const [timezone, setTimezone] = useState('america-mexico_city');

  const [notifications, setNotifications] = useState({
    email: true,
    reminders: true,
    dailySummary: false,
    noShowAlerts: true,
  });

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwError, setPwError] = useState('');

  const [confirmText, setConfirmText] = useState('');
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);

  function showToast(msg) {
    toast.success(msg);
  }

  function handleSaveAccount() {
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }
    showToast('Account settings saved');
  }

  function handleSavePassword() {
    setPwError('');
    if (!pwCurrent || !pwNew || !pwConfirm) {
      setPwError('All password fields are required');
      return;
    }
    if (pwNew.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError('New passwords do not match');
      return;
    }
    setPwCurrent(''); setPwNew(''); setPwConfirm('');
    showToast('Password updated');
  }

  function handleDeactivate() {
    if (confirmText !== 'CONFIRM') {
      toast.error('Type CONFIRM to proceed');
      return;
    }
    toast.info('Account deactivation requested — support will follow up');
    setConfirmText('');
    setConfirmingDeactivate(false);
  }

  return (
    <div className="app-layout fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Customize Utonio to fit your workflow and preferences.</p>
      </div>

      <div className="settings-grid">
        <Section icon={<Globe size={16} />} title="General" subtitle="Language, date format, and timezone.">
          <Row label="Language" description="Used across the app for all UI text.">
            <select
              className="form-input settings-select"
              value={language}
              onChange={(e) => { setLanguage(e.target.value); showToast('Language updated'); }}
            >
              {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </Row>

          <Row label="Date Format" description="How dates are displayed in tables and forms.">
            <div className="settings-radio-group">
              {DATE_FORMATS.map(d => (
                <label key={d.id} className={`settings-radio-pill ${dateFormat === d.id ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="dateFormat"
                    value={d.id}
                    checked={dateFormat === d.id}
                    onChange={() => { setDateFormat(d.id); showToast('Date format updated'); }}
                  />
                  <span className="settings-radio-label">{d.label}</span>
                  <span className="settings-radio-sample">{d.sample}</span>
                </label>
              ))}
            </div>
          </Row>

          <Row label="Timezone" description="All times shown in your selected zone.">
            <select
              className="form-input settings-select"
              value={timezone}
              onChange={(e) => { setTimezone(e.target.value); showToast('Timezone updated'); }}
            >
              {TIMEZONES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Row>

          <Row label="Product Tour" description="Take a quick tour of the key features. Useful if you skipped it on first login.">
            <button
              className="btn-secondary"
              onClick={() => {
                try { window.localStorage.removeItem('utonio-onboarding-seen-v1'); } catch { /* noop */ }
                showToast('Tour re-opened — welcome back!');
                setTimeout(() => window.location.reload(), 400);
              }}
            >
              <Compass size={14} /> Restart tour
            </button>
          </Row>
        </Section>

        <Section icon={<Palette size={16} />} title="Appearance" subtitle="Theme, accent color, and font size.">
          <Row label="Theme" description="Choose how Utonio looks. Light mode has its own tuned palette.">
            <div className="settings-radio-group">
              <button
                className={`settings-theme-card ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => { setTheme('dark'); showToast('Theme set to dark'); }}
                type="button"
              >
                <div className="settings-theme-preview dark">
                  <span className="settings-theme-dot" style={{ background: '#C8F55A' }} />
                  <span className="settings-theme-line" />
                  <span className="settings-theme-line short" />
                </div>
                <div className="settings-theme-meta">
                  <Moon size={14} />
                  <span>Dark</span>
                  {theme === 'dark' && <Check size={12} className="settings-theme-check" />}
                </div>
              </button>
              <button
                className={`settings-theme-card ${theme === 'light' ? 'active' : ''}`}
                onClick={() => { setTheme('light'); showToast('Theme set to light'); }}
                type="button"
              >
                <div className="settings-theme-preview light">
                  <span className="settings-theme-dot" style={{ background: '#7CB800' }} />
                  <span className="settings-theme-line" />
                  <span className="settings-theme-line short" />
                </div>
                <div className="settings-theme-meta">
                  <Sun size={14} />
                  <span>Light</span>
                  {theme === 'light' && <Check size={12} className="settings-theme-check" />}
                </div>
              </button>
            </div>
          </Row>

          <Row label="Accent Color" description="Applied to primary actions, active states, and CTAs.">
            <div className="settings-accent-grid">
              {accentPresets.map(preset => (
                <button
                  key={preset.id}
                  className={`settings-accent-swatch ${accent === preset.id ? 'active' : ''}`}
                  onClick={() => { setAccent(preset.id); showToast(`Accent set to ${preset.label}`); }}
                  style={{ '--swatch-color': preset.color }}
                  type="button"
                  aria-label={`Accent ${preset.label}`}
                >
                  <span className="settings-accent-dot" />
                  <span className="settings-accent-label">{preset.label}</span>
                  {accent === preset.id && (
                    <span className="settings-accent-check">
                      <Check size={12} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Row>

          <Row label="Font Size" description="Scales the body text across the app.">
            <div className="settings-radio-group">
              {FONT_SIZE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`settings-font-pill ${fontScale === opt.id ? 'active' : ''}`}
                  onClick={() => { setFontScale(opt.id); showToast(`Font size set to ${opt.label}`); }}
                  type="button"
                  style={{ fontSize: opt.id === 'small' ? '0.875rem' : opt.id === 'large' ? '1.125rem' : '1rem' }}
                >
                  <span className="settings-font-preview">Aa</span>
                  <span>{opt.label}</span>
                  {fontScale === opt.id && <Check size={12} />}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        <Section icon={<Bell size={16} />} title="Notifications" subtitle="Decide what reaches your inbox.">
          <CustomToggle
            label="Email notifications"
            description="Receive transactional emails for key events."
            checked={notifications.email}
            onChange={(v) => { setNotifications(n => ({ ...n, email: v })); showToast('Email notifications updated'); }}
          />
          <CustomToggle
            label="Appointment reminders"
            description="Get a ping 1 hour before each appointment."
            checked={notifications.reminders}
            onChange={(v) => { setNotifications(n => ({ ...n, reminders: v })); showToast('Reminders updated'); }}
          />
          <CustomToggle
            label="Daily summary report"
            description="A morning digest of the day's appointments."
            checked={notifications.dailySummary}
            onChange={(v) => { setNotifications(n => ({ ...n, dailySummary: v })); showToast('Daily summary updated'); }}
          />
          <CustomToggle
            label="No-show alerts"
            description="Be notified when a patient doesn't arrive."
            checked={notifications.noShowAlerts}
            onChange={(v) => { setNotifications(n => ({ ...n, noShowAlerts: v })); showToast('No-show alerts updated'); }}
          />
        </Section>

        <Section icon={<UserIcon size={16} />} title="Account" subtitle="Your profile and password.">
          <Row label="Display Name" description="Shown in the navbar and across the app.">
            <div className="settings-save-row">
              <input
                className="form-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
              <button className="btn-primary settings-save-btn" onClick={handleSaveAccount}>
                <Save size={14} /> Save
              </button>
            </div>
          </Row>

          <Row label="Email" description="Used to sign in. Contact support to change.">
            <div className="settings-save-row">
              <input
                className="form-input"
                value={user?.email || ''}
                readOnly
              />
              <button
                className="btn-secondary"
                onClick={() => toast.info('A change-email link would be sent here.')}
              >
                Change Email
              </button>
            </div>
          </Row>

          <div className="settings-password-block">
            <div className="settings-password-header">
              <Lock size={14} />
              <span>Change Password</span>
            </div>
            {pwError && <div className="settings-pw-error">{pwError}</div>}
            <div className="settings-pw-grid">
              <PasswordField
                label="Current"
                value={pwCurrent}
                onChange={setPwCurrent}
                shown={showPw.current}
                onToggle={() => setShowPw(s => ({ ...s, current: !s.current }))}
              />
              <PasswordField
                label="New"
                value={pwNew}
                onChange={setPwNew}
                shown={showPw.new}
                onToggle={() => setShowPw(s => ({ ...s, new: !s.new }))}
              />
              <PasswordField
                label="Confirm New"
                value={pwConfirm}
                onChange={setPwConfirm}
                shown={showPw.confirm}
                onToggle={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
              />
            </div>
            <button className="btn-primary" onClick={handleSavePassword}>
              <Save size={14} /> Update Password
            </button>
          </div>
        </Section>

        <Section icon={<Building2 size={16} />} title="Offices" subtitle="Register and manage physical consultation rooms (HU-03).">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => { setOfficeForm({ code: '', floor: '' }); setOfficeErrors({}); setOfficeSlideOpen(true); }}>
              <Plus size={14} /> Add Office
            </button>
          </div>
          {adminLoading ? (
            <div className="skeleton" style={{ height: '60px' }} />
          ) : offices.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No offices registered yet.</p>
          ) : (
            <div className="admin-list">
              {offices.map(o => (
                <div key={o.id} className="admin-list-item">
                  <div>
                    <span className="admin-item-name">{o.code}</span>
                    <span className="admin-item-meta">Floor {o.floor}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`admin-status-badge ${o.active ? 'active' : 'inactive'}`}>
                      {o.active ? 'Active' : 'Inactive'}
                    </span>
                    <button className="row-action" onClick={() => toggleOffice(o)} title={o.active ? 'Deactivate' : 'Activate'}>
                      <Power size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section icon={<Stethoscope size={16} />} title="Appointment Types" subtitle="Define consultation types with their duration in minutes (HU-04).">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => { setTypeForm({ name: '', description: '', durationMinutes: '30' }); setTypeErrors({}); setTypeSlideOpen(true); }}>
              <Plus size={14} /> Add Type
            </button>
          </div>
          {adminLoading ? (
            <div className="skeleton" style={{ height: '60px' }} />
          ) : apptTypes.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No appointment types registered yet.</p>
          ) : (
            <div className="admin-list">
              {apptTypes.map(t => (
                <div key={t.id} className="admin-list-item">
                  <div>
                    <span className="admin-item-name">{t.name}</span>
                    <span className="admin-item-meta">{t.durationMinutes} min · {t.description}</span>
                  </div>
                  <span className={`admin-status-badge ${t.active ? 'active' : 'inactive'}`}>
                    {t.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section
          icon={<AlertTriangle size={16} />}
          title="Danger Zone"
          subtitle="Irreversible actions. Proceed with caution."
          variant="danger"
        >
          <div className="settings-danger-row">
            <div>
              <div className="settings-danger-title">Deactivate Account</div>
              <div className="settings-danger-description">
                Your account will be marked inactive. You can reactivate within 30 days by contacting support.
              </div>
            </div>
            {!confirmingDeactivate ? (
              <button
                className="btn-danger-outline"
                onClick={() => setConfirmingDeactivate(true)}
              >
                Deactivate
              </button>
            ) : (
              <div className="settings-danger-confirm">
                <input
                  className="form-input"
                  placeholder='Type "CONFIRM" to proceed'
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
                <button
                  className="btn-danger"
                  disabled={confirmText !== 'CONFIRM'}
                  onClick={handleDeactivate}
                >
                  Confirm Deactivation
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => { setConfirmingDeactivate(false); setConfirmText(''); }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </Section>
      </div>

      <SlideOver isOpen={officeSlideOpen} onClose={() => setOfficeSlideOpen(false)} title="Add Office">
        <form onSubmit={handleCreateOffice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FloatingField
            id="office-code"
            label="Office Code"
            value={officeForm.code}
            onChange={e => setOfficeForm({ ...officeForm, code: e.target.value })}
            error={officeErrors.code}
            required
            placeholder="e.g. C-101"
          />
          <FloatingField
            id="office-floor"
            label="Floor"
            type="number"
            value={officeForm.floor}
            onChange={e => setOfficeForm({ ...officeForm, floor: e.target.value })}
            error={officeErrors.floor}
            required
            placeholder="e.g. 2"
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" className="btn-primary" disabled={savingOffice} style={{ flex: 1 }}>
              {savingOffice ? 'Saving...' : 'Create Office'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setOfficeSlideOpen(false)}>
              <X size={16} /> Cancel
            </button>
          </div>
        </form>
      </SlideOver>

      <SlideOver isOpen={typeSlideOpen} onClose={() => setTypeSlideOpen(false)} title="Add Appointment Type">
        <form onSubmit={handleCreateType} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FloatingField
            id="type-name"
            label="Name"
            value={typeForm.name}
            onChange={e => setTypeForm({ ...typeForm, name: e.target.value })}
            error={typeErrors.name}
            required
            placeholder="e.g. General Consultation"
          />
          <FloatingField
            id="type-description"
            label="Description"
            value={typeForm.description}
            onChange={e => setTypeForm({ ...typeForm, description: e.target.value })}
            placeholder="Optional description"
          />
          <FloatingField
            id="type-duration"
            label="Duration (minutes)"
            type="number"
            value={typeForm.durationMinutes}
            onChange={e => setTypeForm({ ...typeForm, durationMinutes: e.target.value })}
            error={typeErrors.durationMinutes}
            required
            placeholder="e.g. 30"
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" className="btn-primary" disabled={savingType} style={{ flex: 1 }}>
              {savingType ? 'Saving...' : 'Create Type'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setTypeSlideOpen(false)}>
              <X size={16} /> Cancel
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

function Section({ icon, title, subtitle, children, variant }) {
  return (
    <section className={`settings-section card ${variant === 'danger' ? 'danger' : ''}`}>
      <header className="settings-section-header">
        <div className="settings-section-icon">{icon}</div>
        <div>
          <h2 className="settings-section-title">{title}</h2>
          {subtitle && <p className="settings-section-subtitle">{subtitle}</p>}
        </div>
      </header>
      <div className="settings-section-body">
        {children}
      </div>
    </section>
  );
}

function Row({ label, description, children }) {
  return (
    <div className="settings-row">
      <div className="settings-row-meta">
        <div className="settings-row-label">{label}</div>
        {description && <div className="settings-row-description">{description}</div>}
      </div>
      <div className="settings-row-control">
        {children}
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, shown, onToggle }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="login-password-wrap">
        <input
          type={shown ? 'text' : 'password'}
          className="form-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
        <button
          type="button"
          className="login-password-toggle"
          onClick={onToggle}
          aria-label={shown ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {shown ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <ErrorBoundary>
      <SettingsInner />
    </ErrorBoundary>
  );
}
