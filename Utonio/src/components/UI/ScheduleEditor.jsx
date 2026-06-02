import { useState, useEffect, useMemo } from 'react';
import { X, Save, RotateCcw, AlertTriangle, CalendarOff } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import SlideOver from './SlideOver';
import { findScheduleConflicts } from '../../utils/scheduleConflicts';
import './ScheduleEditor.css';

const DAYS = [
  { id: 1, short: 'Mon', long: 'Monday' },
  { id: 2, short: 'Tue', long: 'Tuesday' },
  { id: 3, short: 'Wed', long: 'Wednesday' },
  { id: 4, short: 'Thu', long: 'Thursday' },
  { id: 5, short: 'Fri', long: 'Friday' },
  { id: 6, short: 'Sat', long: 'Saturday' },
  { id: 0, short: 'Sun', long: 'Sunday' },
];

const FULL_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

function buildEmptySchedule() {
  const schedule = {};
  for (let d = 0; d < 7; d++) schedule[d] = [];
  return schedule;
}

function normalizeSchedule(weekly) {
  const out = buildEmptySchedule();
  for (let d = 0; d < 7; d++) {
    out[d] = Array.isArray(weekly?.[d]) ? weekly[d].map(s => ({ ...s })) : [];
  }
  return out;
}

export default function ScheduleEditor({ doctor, isOpen, onClose, onSaved }) {
  const toast = useToast();
  const [schedule, setSchedule] = useState(buildEmptySchedule());
  const [initialSchedule, setInitialSchedule] = useState(buildEmptySchedule());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!isOpen || !doctor) return;
    let cancelled = false;
    Promise.resolve().then(() => setLoading(true));
    Promise.all([
      api.doctors.getSchedule(doctor.id),
      api.appointments.list(),
    ]).then(([s, appts]) => {
      if (cancelled) return;
      const normalized = normalizeSchedule(s?.weeklySchedule);
      setSchedule(normalized);
      setInitialSchedule(normalized);
      setAppointments(appts);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [isOpen, doctor]);

  const isDirty = JSON.stringify(schedule) !== JSON.stringify(initialSchedule);

  const conflicts = useMemo(
    () => (doctor ? findScheduleConflicts(appointments, doctor.id, schedule) : []),
    [appointments, doctor, schedule]
  );

  const conflictsByDay = useMemo(() => {
    const map = {};
    for (const c of conflicts) {
      map[c.day] = (map[c.day] || 0) + 1;
    }
    return map;
  }, [conflicts]);

  if (!doctor) return null;

  function toggleSlot(dayId, time) {
    setSchedule((prev) => {
      const daySlots = prev[dayId] || [];
      const existing = daySlots.find(s => s.time === time);
      const nextDay = existing
        ? daySlots.map(s => s.time === time ? { ...s, available: !s.available } : s)
        : [...daySlots, { time, available: true }].sort((a, b) => a.time.localeCompare(b.time));
      return { ...prev, [dayId]: nextDay };
    });
  }

  function removeSlot(dayId, time) {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: (prev[dayId] || []).filter(s => s.time !== time),
    }));
  }

  function reset() {
    setSchedule(JSON.parse(JSON.stringify(initialSchedule)));
  }

  async function performSave() {
    setSaving(true);
    try {
      await api.doctors.saveSchedule(doctor.id, schedule);
      setInitialSchedule(JSON.parse(JSON.stringify(schedule)));
      toast.success(`Schedule saved for ${doctor.name.replace('Dr. ', 'Dr. ')}`);
      if (onSaved) onSaved(doctor.id, schedule);
    } catch {
      toast.error('Could not save schedule');
    } finally {
      setSaving(false);
      setConfirming(false);
    }
  }

  function save() {
    if (conflicts.length > 0) {
      setConfirming(true);
      return;
    }
    performSave();
  }

  function handleClose() {
    if (isDirty) {
      if (confirm('You have unsaved changes. Discard them?')) onClose();
    } else {
      onClose();
    }
  }

  const dayName = (dayId) => DAYS.find(d => d.id === dayId)?.long;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={handleClose}
      title={`${doctor.name} — Weekly Schedule`}
      width={620}
    >
      {loading ? (
        <div style={{ padding: '40px' }}>
          <div className="skeleton" style={{ height: '24px', width: '60%', marginBottom: '24px' }} />
          <div className="skeleton" style={{ height: '120px', marginBottom: '16px' }} />
          <div className="skeleton" style={{ height: '120px' }} />
        </div>
      ) : (
        <div className="schedule-editor">
          <p className="schedule-help">
            Toggle a time to mark it available, or add a custom slot. Click the
            <span className="legend-x"> X </span>
            to remove a slot.
          </p>

          {conflicts.length > 0 ? (
            <div className="schedule-conflict-banner" role="alert">
              <div className="conflict-header">
                <AlertTriangle size={16} />
                <strong>
                  {conflicts.length} appointment conflict{conflicts.length !== 1 ? 's' : ''}
                </strong>
              </div>
              <ul className="conflict-list">
                {conflicts.slice(0, 5).map((c) => (
                  <li key={c.appointment.id}>
                    {c.appointment.date} at {c.time} <span className="conflict-reason">— {c.reason}</span>
                  </li>
                ))}
                {conflicts.length > 5 ? (
                  <li className="conflict-overflow">…and {conflicts.length - 5} more</li>
                ) : null}
              </ul>
              <p className="conflict-hint">
                Saving will mark these appointments as <strong>need rescheduling</strong>. You can also adjust the schedule to remove conflicts.
              </p>
            </div>
          ) : null}

          <div className="schedule-day-tabs">
            {DAYS.map(d => {
              const count = (schedule[d.id] || []).length;
              const conflictCount = conflictsByDay[d.id] || 0;
              return (
                <button
                  key={d.id}
                  className={`schedule-day-tab ${activeDay === d.id ? 'active' : ''} ${count === 0 ? 'empty' : ''} ${conflictCount > 0 ? 'has-conflict' : ''}`}
                  onClick={() => setActiveDay(d.id)}
                >
                  <span className="day-short">{d.short}</span>
                  <span className="day-count">{count}</span>
                  {conflictCount > 0 ? (
                    <span className="day-conflict-badge" title={`${conflictCount} conflict${conflictCount !== 1 ? 's' : ''}`}>
                      {conflictCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="schedule-day-content">
            <div className="schedule-day-header">
              <h4>{dayName(activeDay)}</h4>
              <span className="schedule-day-meta">
                {(schedule[activeDay] || []).length} slot{(schedule[activeDay] || []).length !== 1 ? 's' : ''}
                {conflictsByDay[activeDay] ? (
                  <span className="day-conflict-count">
                    <CalendarOff size={11} />
                    {conflictsByDay[activeDay]} conflict{conflictsByDay[activeDay] !== 1 ? 's' : ''}
                  </span>
                ) : null}
              </span>
            </div>

            <div className="schedule-slots-grid">
              {FULL_HOURS.map(h => {
                const time = `${String(h).padStart(2, '0')}:00`;
                const halfTime = `${String(h).padStart(2, '0')}:30`;
                const slot = (schedule[activeDay] || []).find(s => s.time === time);
                const halfSlot = (schedule[activeDay] || []).find(s => s.time === halfTime);
                return (
                  <div key={h} className="schedule-hour-row">
                    <div className="hour-label">{time}</div>
                    <button
                      className={`schedule-slot ${slot?.available ? 'active' : ''} ${slot ? 'filled' : ''}`}
                      onClick={() => toggleSlot(activeDay, time)}
                    >
                      {slot ? (slot.available ? 'Available' : 'Booked') : '+ Add'}
                    </button>
                    <button
                      className={`schedule-slot ${halfSlot?.available ? 'active' : ''} ${halfSlot ? 'filled' : ''}`}
                      onClick={() => toggleSlot(activeDay, halfTime)}
                    >
                      {halfSlot ? (halfSlot.available ? 'Available' : 'Booked') : '+ Add'}
                    </button>
                  </div>
                );
              })}
            </div>

            {(schedule[activeDay] || []).length > 0 && (
              <div className="schedule-slot-list">
                <div className="slot-list-label">Configured slots</div>
                <div className="slot-chips">
                  {(schedule[activeDay] || []).map(s => (
                    <span
                      key={s.time}
                      className={`slot-chip ${s.available ? 'available' : 'booked'}`}
                    >
                      {s.time}
                      <button
                        onClick={() => removeSlot(activeDay, s.time)}
                        aria-label={`Remove ${s.time}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="schedule-footer">
            <button
              className="btn-secondary"
              onClick={reset}
              disabled={!isDirty || saving}
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              className="btn-primary"
              onClick={save}
              disabled={!isDirty || saving}
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </div>
      )}

      {confirming ? (
        <div className="conflict-confirm-overlay" onClick={() => setConfirming(false)}>
          <div className="conflict-confirm" onClick={(e) => e.stopPropagation()}>
            <h3 className="conflict-confirm-title">
              <AlertTriangle size={18} />
              Save with {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}?
            </h3>
            <p className="conflict-confirm-body">
              {conflicts.length} future appointment{conflicts.length !== 1 ? 's are' : ' is'} outside the new schedule. Patients will need to be rescheduled. Continue?
            </p>
            <div className="conflict-confirm-actions">
              <button className="btn-secondary" onClick={() => setConfirming(false)}>
                Adjust schedule
              </button>
              <button className="btn-danger" onClick={performSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save anyway'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </SlideOver>
  );
}
