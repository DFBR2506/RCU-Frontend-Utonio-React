import { useState, useEffect } from 'react';
import { Save, Clock } from 'lucide-react';
import { getDoctorSchedules, createDoctorSchedule } from '../../api/doctorSchedulesApi';
import { useToast } from '../../hooks/useToast';
import SlideOver from './SlideOver';
import './ScheduleEditor.css';

const DAYS = [
  { dow: 'MONDAY',    short: 'Mon', long: 'Monday' },
  { dow: 'TUESDAY',   short: 'Tue', long: 'Tuesday' },
  { dow: 'WEDNESDAY', short: 'Wed', long: 'Wednesday' },
  { dow: 'THURSDAY',  short: 'Thu', long: 'Thursday' },
  { dow: 'FRIDAY',    short: 'Fri', long: 'Friday' },
  { dow: 'SATURDAY',  short: 'Sat', long: 'Saturday' },
  { dow: 'SUNDAY',    short: 'Sun', long: 'Sunday' },
];

function buildEmptyDayForm() {
  return { enabled: false, startTime: '08:00', endTime: '17:00' };
}

export default function ScheduleEditor({ doctor, isOpen, onClose, onSaved }) {
  const toast = useToast();
  const [activeDay, setActiveDay] = useState('MONDAY');
  const [existing, setExisting] = useState({});
  const [form, setForm] = useState(() =>
    Object.fromEntries(DAYS.map(d => [d.dow, buildEmptyDayForm()]))
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !doctor) return;
    setLoading(true);
    getDoctorSchedules(doctor.id)
      .then(schedules => {
        const map = {};
        schedules.forEach(s => { map[s.dayOfWeek] = s; });
        setExisting(map);
        setForm(Object.fromEntries(
          DAYS.map(d => [
            d.dow,
            map[d.dow]
              ? { enabled: true, startTime: map[d.dow].startTime, endTime: map[d.dow].endTime }
              : buildEmptyDayForm(),
          ])
        ));
      })
      .catch(() => toast.error('Could not load schedules'))
      .finally(() => setLoading(false));
  }, [isOpen, doctor]);

  if (!doctor) return null;

  const doctorName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();

  function setDayField(dow, field, value) {
    setForm(prev => ({ ...prev, [dow]: { ...prev[dow], [field]: value } }));
  }

  async function save() {
    setSaving(true);
    const toCreate = DAYS.filter(d =>
      form[d.dow].enabled && !existing[d.dow]
    );

    if (toCreate.length === 0) {
      toast.info('No new days to save — existing schedules cannot be modified here.');
      setSaving(false);
      return;
    }

    let saved = 0;
    let failed = 0;
    for (const d of toCreate) {
      const { startTime, endTime } = form[d.dow];
      if (startTime >= endTime) {
        toast.error(`${d.long}: end time must be after start time`);
        failed++;
        continue;
      }
      try {
        await createDoctorSchedule(doctor.id, {
          dayOfWeek: d.dow,
          startTime,
          endTime,
        });
        saved++;
      } catch (err) {
        toast.error(err?.response?.data?.message || `Could not save ${d.long}`);
        failed++;
      }
    }

    setSaving(false);
    if (saved > 0) {
      toast.success(`${saved} day${saved !== 1 ? 's' : ''} saved for ${doctorName}`);
      // Reload existing schedules
      getDoctorSchedules(doctor.id).then(schedules => {
        const map = {};
        schedules.forEach(s => { map[s.dayOfWeek] = s; });
        setExisting(map);
      });
      if (onSaved) onSaved(doctor.id);
    }
  }

  const currentDay = DAYS.find(d => d.dow === activeDay);
  const currentForm = form[activeDay] || buildEmptyDayForm();
  const isExisting = !!existing[activeDay];
  const hasNewDays = DAYS.some(d => form[d.dow].enabled && !existing[d.dow]);

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={`${doctorName} — Weekly Schedule`}
      width={560}
    >
      {loading ? (
        <div style={{ padding: '40px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: '48px', marginBottom: '12px' }} />
          ))}
        </div>
      ) : (
        <div className="schedule-editor">
          <p className="schedule-help">
            Configure working hours per day. Days marked in green already have a schedule saved.
          </p>

          <div className="schedule-day-tabs">
            {DAYS.map(d => {
              const isConf = !!existing[d.dow];
              const isNew = form[d.dow].enabled && !existing[d.dow];
              return (
                <button
                  key={d.dow}
                  className={`schedule-day-tab ${activeDay === d.dow ? 'active' : ''} ${!form[d.dow].enabled ? 'empty' : ''}`}
                  onClick={() => setActiveDay(d.dow)}
                  style={isConf ? { borderColor: 'var(--accent-green)', color: 'var(--accent-green)' } : isNew ? { borderColor: 'var(--accent-lime)', color: 'var(--accent-lime)' } : {}}
                >
                  <span className="day-short">{d.short}</span>
                  <span className="day-count">{isConf ? '✓' : isNew ? '+' : '—'}</span>
                </button>
              );
            })}
          </div>

          <div className="schedule-day-content">
            <div className="schedule-day-header">
              <h4>{currentDay?.long}</h4>
              {isExisting && (
                <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 600 }}>
                  Already configured
                </span>
              )}
            </div>

            {isExisting ? (
              <div className="schedule-existing-info">
                <div className="schedule-time-row">
                  <Clock size={14} color="var(--accent-green)" />
                  <span>
                    {existing[activeDay].startTime} — {existing[activeDay].endTime}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Schedule already exists. Contact an administrator to modify it.
                </p>
              </div>
            ) : (
              <div className="schedule-form-day">
                <label className="schedule-toggle-row">
                  <input
                    type="checkbox"
                    checked={currentForm.enabled}
                    onChange={e => setDayField(activeDay, 'enabled', e.target.checked)}
                  />
                  <span>Enable this day</span>
                </label>

                {currentForm.enabled && (
                  <div className="schedule-time-inputs">
                    <div className="form-group">
                      <label className="form-label">Start time</label>
                      <input
                        type="time"
                        className="form-input"
                        value={currentForm.startTime}
                        onChange={e => setDayField(activeDay, 'startTime', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End time</label>
                      <input
                        type="time"
                        className="form-input"
                        value={currentForm.endTime}
                        onChange={e => setDayField(activeDay, 'endTime', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="schedule-footer">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={save}
              disabled={saving || !hasNewDays}
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </div>
      )}
    </SlideOver>
  );
}
