import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Search, FileBarChart, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/UI/StatusBadge';
import EmptyState from '../components/UI/EmptyState';
import './Dashboard.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calDate, setCalDate] = useState(new Date());

  useEffect(() => {
    async function load() {
      try {
        const [appts, pats, docs] = await Promise.all([
          api.appointments.list(),
          api.patients.list(),
          api.doctors.list()
        ]);
        setAppointments(appts);
        setPatients(pats);
        setDoctors(docs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === todayStr);
  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length;
  const scheduledCount = appointments.filter(a => a.status === 'SCHEDULED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const noShowCount = appointments.filter(a => a.status === 'NO_SHOW').length;

  const getApptsForDate = (date) => appointments.filter(a => a.date === date);

  const calYear = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

  const calendarDays = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, otherMonth: true, date: null });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(calYear, calMonth, i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === new Date().getDate() && calMonth === new Date().getMonth() && calYear === new Date().getFullYear();
    calendarDays.push({ day: i, otherMonth: false, isToday, date: dateStr });
  }
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, otherMonth: true, date: null });
  }

  const getPatientName = (id) => {
    const p = patients.find(p => p.id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  };

  const getDoctorName = (id) => {
    const d = doctors.find(d => d.id === id);
    return d ? d.name : 'Doctor';
  };

  const recentAppts = [...appointments]
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="app-layout">
        <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '32px' }} />
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="card stat-card skeleton" style={{ height: '100px' }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back. Here is your health center overview.</p>
      </div>

      <div className="stats-grid">
        <div className="card stat-card fade-in-up stagger-1">
          <div className="stat-label">Today</div>
          <div className="stat-value">{todayAppts.length}</div>
          <div className="stat-change">appointments scheduled</div>
        </div>
        <div className="card stat-card fade-in-up stagger-2">
          <div className="stat-label">Confirmed</div>
          <div className="stat-value">{confirmedCount}</div>
          <div className="stat-change">{scheduledCount} pending</div>
        </div>
        <div className="card stat-card fade-in-up stagger-3">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{completedCount}</div>
          <div className="stat-change">this period</div>
        </div>
        <div className="card stat-card fade-in-up stagger-4">
          <div className="stat-label">No-Shows</div>
          <div className="stat-value" style={{ color: 'var(--accent-red)' }}>{noShowCount}</div>
          <div className="stat-change">to address</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="fade-in-up stagger-2">
          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Calendar</h3>
              <div className="calendar-nav">
                <button onClick={() => setCalDate(new Date(calYear, calMonth - 1, 1))} aria-label="Previous month">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setCalDate(new Date(calYear, calMonth + 1, 1))} aria-label="Next month">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className="mini-calendar">
              <div className="calendar-header">
                <span className="calendar-month">{MONTHS[calMonth]} {calYear}</span>
              </div>
              <div className="calendar-grid">
                {DAYS.map(d => <div key={d} className="calendar-day-name">{d}</div>)}
                {calendarDays.map((c, i) => {
                  const appts = c.date ? getApptsForDate(c.date) : [];
                  const hasAppts = appts.length > 0;
                  const clickable = !c.otherMonth && c.date;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!clickable}
                      onClick={() => clickable && navigate(`/appointments?date=${c.date}`)}
                      className={[
                        'calendar-day',
                        c.isToday ? 'today' : '',
                        c.otherMonth ? 'other-month' : '',
                        clickable ? 'clickable' : '',
                      ].filter(Boolean).join(' ')}
                      aria-label={c.date ? `View appointments for ${c.date}` : undefined}
                    >
                      {c.day}
                      {!c.otherMonth && hasAppts && (
                        <div className="calendar-dots">
                          {appts.slice(0, 3).map((a, j) => (
                            <span
                              key={j}
                              className="calendar-dot"
                              style={{
                                background:
                                  a.status === 'CONFIRMED' ? 'var(--accent-lime)' :
                                  a.status === 'SCHEDULED' ? 'var(--accent-violet)' :
                                  'var(--accent-red)'
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mini-calendar-legend">
                <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--accent-lime)' }} />Confirmed</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--accent-violet)' }} />Scheduled</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--accent-red)' }} />No-show</div>
              </div>
            </div>
          </div>
        </div>

        <div className="fade-in-up stagger-3">
          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Quick Actions</h3>
            </div>
            <div className="quick-actions">
              <button className="quick-action" onClick={() => navigate('/appointments/new')}>
                <span className="quick-action-icon" style={{ background: 'var(--accent-lime-dim)' }}>
                  <CalendarPlus size={18} color="var(--accent-lime)" />
                </span>
                New Appointment
              </button>
              <button className="quick-action" onClick={() => navigate('/availability')}>
                <span className="quick-action-icon" style={{ background: 'var(--accent-violet-dim)' }}>
                  <Search size={18} color="var(--accent-violet)" />
                </span>
                Check Availability
              </button>
              <button className="quick-action" onClick={() => navigate('/reports')}>
                <span className="quick-action-icon" style={{ background: 'var(--accent-violet-dim)' }}>
                  <FileBarChart size={18} color="var(--accent-violet)" />
                </span>
                View Reports
              </button>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Recent Appointments</h3>
            </div>
            <div className="card" style={{ padding: recentAppts.length === 0 ? 0 : '16px 20px' }}>
              {recentAppts.length === 0 ? (
                <EmptyState
                  variant="appointments"
                  title="No appointments yet"
                  message="Once you schedule your first appointment, it will appear here for quick access."
                  action={
                    <button className="btn-primary" onClick={() => navigate('/appointments/new')}>
                      <CalendarPlus size={16} />
                      New Appointment
                    </button>
                  }
                />
              ) : recentAppts.map(appt => (
                <div
                  key={appt.id}
                  className="appointment-row"
                  onClick={() => navigate('/appointments')}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} color="var(--text-secondary)" />
                    <span className="appt-time">{appt.time}</span>
                  </div>
                  <div className="appt-patient">{getPatientName(appt.patientId)}</div>
                  <div className="appt-doctor">{getDoctorName(appt.doctorId)}</div>
                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
