import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Calendar, CalendarPlus, Clock, CheckCircle2,
  AlertCircle, XCircle, Edit3, Activity, TrendingUp, ChevronRight,
} from 'lucide-react';
import { api, SPECIALTIES, APPOINTMENT_TYPES } from '../services/api';
import StatusBadge from '../components/UI/StatusBadge';
import ScheduleEditor from '../components/UI/ScheduleEditor';
import EmptyState from '../components/UI/EmptyState';
import './DoctorProfile.css';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getInitials(name) {
  return name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getSpecialty(id) {
  return SPECIALTIES.find(s => s.id === id) || { name: id, color: '#7B6EF6' };
}

function getType(id) {
  return APPOINTMENT_TYPES.find(t => t.id === id) || { name: id, duration: 30 };
}

function getOfficeName(id, offices) {
  const o = offices.find(o => o.id === id);
  return o ? o.name : '—';
}

function getPatientName(id, patients) {
  const p = patients.find(p => p.id === id);
  return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
}

function formatJoinDate() {
  const years = Math.floor(Math.random() * 8) + 2;
  return `${years} year${years !== 1 ? 's' : ''} on staff`;
}

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => setLoading(true));
    Promise.all([
      api.doctors.get(id),
      api.doctors.getSchedule(id),
      api.appointments.list(),
      api.patients.list(),
      api.offices.list(),
    ]).then(([d, s, a, p, o]) => {
      if (cancelled) return;
      setDoctor(d);
      setSchedule(s?.weeklySchedule || null);
      setAppointments(a.filter(x => x.doctorId === parseInt(id)));
      setPatients(p);
      setOffices(o);
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'COMPLETED').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = appointments.filter(a => a.date >= todayStr && (a.status === 'SCHEDULED' || a.status === 'CONFIRMED'));
    const cancelled = appointments.filter(a => a.status === 'CANCELLED').length;
    const noShows = appointments.filter(a => a.status === 'NO_SHOW').length;
    const totalFinished = total - upcoming.length;
    const noShowRate = totalFinished > 0 ? Math.round((noShows / totalFinished) * 100) : 0;
    const completionRate = totalFinished > 0 ? Math.round((completed / totalFinished) * 100) : 0;
    return { total, completed, upcoming: upcoming.length, cancelled, noShows, noShowRate, completionRate };
  }, [appointments]);

  const upcomingAppts = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return [...appointments]
      .filter(a => a.date >= todayStr && (a.status === 'SCHEDULED' || a.status === 'CONFIRMED'))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [appointments]);

  const pastAppts = useMemo(() => {
    return [...appointments]
      .filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'NO_SHOW')
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
      .slice(0, 8);
  }, [appointments]);

  const weeklyHours = useMemo(() => {
    if (!schedule) return 0;
    let total = 0;
    for (let d = 0; d < 7; d++) {
      for (const slot of schedule[d] || []) {
        if (slot.available) total += 0.5;
      }
    }
    return total;
  }, [schedule]);

  if (loading) {
    return (
      <div className="app-layout">
        <div className="skeleton" style={{ height: '32px', width: '140px', marginBottom: '24px' }} />
        <div className="card" style={{ height: '180px', marginBottom: '24px' }} />
        <div className="skeleton" style={{ height: '160px' }} />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="app-layout fade-in">
        <div className="back-link" onClick={() => navigate('/doctors')}>
          <ArrowLeft size={14} /> Back to Doctors
        </div>
        <EmptyState
          variant="doctors"
          title="Doctor not found"
          message="The doctor you are looking for does not exist or has been removed."
          action={
            <button className="btn-primary" onClick={() => navigate('/doctors')}>
              Browse all doctors
            </button>
          }
        />
      </div>
    );
  }

  const specialty = getSpecialty(doctor.specialty);
  const initials = getInitials(doctor.name);
  const isActive = doctor.status === 'ACTIVE';

  return (
    <div className="app-layout fade-in">
      <button className="back-link" onClick={() => navigate('/doctors')}>
        <ArrowLeft size={14} /> Back to Doctors
      </button>

      <div className="doctor-hero card" style={{ borderColor: `${specialty.color}40` }}>
        <div className="hero-glow" style={{ background: `radial-gradient(circle at 20% 0%, ${specialty.color}25, transparent 60%)` }} />
        <div className="hero-content">
          <div
            className="hero-avatar"
            style={{
              background: `linear-gradient(135deg, ${specialty.color}50, ${specialty.color}90)`,
              borderColor: `${specialty.color}`,
            }}
          >
            {initials}
          </div>
          <div className="hero-info">
            <div className="hero-name-row">
              <h1 className="hero-name">{doctor.name}</h1>
              <span
                className="hero-status"
                style={isActive
                  ? { background: 'var(--accent-green-dim)', color: 'var(--accent-green)', borderColor: 'var(--accent-green)' }
                  : { background: 'var(--accent-red-dim)', color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }
                }
              >
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <span
              className="hero-specialty"
              style={{ background: `${specialty.color}20`, color: specialty.color, border: `1px solid ${specialty.color}40` }}
            >
              {specialty.name}
            </span>
            <p className="hero-meta">{formatJoinDate()} · {weeklyHours} hrs/week scheduled</p>
            <div className="hero-contact">
              <a className="contact-pill" href={`mailto:${doctor.email}`}>
                <Mail size={13} />
                {doctor.email}
              </a>
              <a className="contact-pill" href={`tel:${doctor.phone}`}>
                <Phone size={13} />
                {doctor.phone}
              </a>
            </div>
          </div>
          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => navigate(`/appointments/new?doctorId=${doctor.id}`)}
              disabled={!isActive}
              title={!isActive ? 'Doctor is inactive' : 'New appointment'}
            >
              <CalendarPlus size={14} /> New Appointment
            </button>
            <button
              className="btn-secondary"
              onClick={() => setEditingSchedule(true)}
              disabled={!isActive}
              title={!isActive ? 'Doctor is inactive' : 'Edit weekly schedule'}
            >
              <Edit3 size={14} /> Edit Schedule
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card fade-in-up stagger-1">
          <div className="stat-label">Total Appointments</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-change">all time</div>
        </div>
        <div className="card stat-card fade-in-up stagger-2">
          <div className="stat-label">Upcoming</div>
          <div className="stat-value" style={{ color: 'var(--accent-violet)' }}>{stats.upcoming}</div>
          <div className="stat-change">scheduled or confirmed</div>
        </div>
        <div className="card stat-card fade-in-up stagger-3">
          <div className="stat-label">Completed</div>
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{stats.completed}</div>
          <div className="stat-change">{stats.completionRate}% completion rate</div>
        </div>
        <div className="card stat-card fade-in-up stagger-4">
          <div className="stat-label">No-Shows</div>
          <div className="stat-value" style={{ color: 'var(--accent-red)' }}>{stats.noShows}</div>
          <div className="stat-change">{stats.noShowRate}% no-show rate</div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-section card fade-in-up stagger-2">
          <div className="section-header">
            <h3 className="section-title">
              <Calendar size={16} color={specialty.color} />
              Weekly Schedule
            </h3>
            <span className="section-meta">{weeklyHours} hours / week</span>
          </div>
          <div className="week-schedule">
            {DAY_SHORT.map((short, idx) => {
              const daySlots = schedule?.[idx] || [];
              const available = daySlots.filter(s => s.available);
              const isToday = idx === new Date().getDay();
              return (
                <div
                  key={idx}
                  className={`week-day ${isToday ? 'today' : ''} ${daySlots.length === 0 ? 'off' : ''}`}
                >
                  <div className="week-day-head">
                    <span className="week-day-name">{short}</span>
                    {isToday && <span className="today-dot" />}
                  </div>
                  <div className="week-day-body">
                    {daySlots.length === 0 ? (
                      <span className="week-day-off">Off</span>
                    ) : (
                      <div className="week-day-slots">
                        <span className="week-day-count">
                          {available.length} slot{available.length !== 1 ? 's' : ''}
                        </span>
                        <span className="week-day-range">
                          {available[0]?.time} – {available[available.length - 1]?.time}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="profile-section card fade-in-up stagger-3">
          <div className="section-header">
            <h3 className="section-title">
              <Activity size={16} color={specialty.color} />
              Upcoming Appointments
            </h3>
            <span className="section-meta">{upcomingAppts.length} pending</span>
          </div>
          {upcomingAppts.length === 0 ? (
            <EmptyState
              variant="appointments"
              title="No upcoming appointments"
              message={`${doctor.name} has no future appointments scheduled.`}
            />
          ) : (
            <ul className="upcoming-list">
              {upcomingAppts.slice(0, 6).map(a => (
                <li key={a.id} className="upcoming-row">
                  <div className="upcoming-date">
                    <span className="upcoming-day">
                      {new Date(a.date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric' })}
                    </span>
                    <span className="upcoming-month">
                      {new Date(a.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </div>
                  <div className="upcoming-info">
                    <div className="upcoming-time">
                      <Clock size={12} />
                      {a.time} · {a.duration} min
                    </div>
                    <div className="upcoming-patient">{getPatientName(a.patientId, patients)}</div>
                    <div className="upcoming-meta">
                      {getType(a.typeId).name} · {getOfficeName(a.officeId, offices)}
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
          {upcomingAppts.length > 6 && (
            <Link to={`/appointments?doctor=${doctor.id}`} className="section-cta">
              View all {upcomingAppts.length} upcoming
              <ChevronRight size={14} />
            </Link>
          )}
        </div>
      </div>

      <div className="profile-section card fade-in-up stagger-4" style={{ marginTop: '24px' }}>
        <div className="section-header">
          <h3 className="section-title">
            <TrendingUp size={16} color={specialty.color} />
            Recent Activity
          </h3>
          <span className="section-meta">Last {Math.min(8, pastAppts.length)} appointments</span>
        </div>
        {pastAppts.length === 0 ? (
          <EmptyState
            variant="appointments"
            title="No past appointments"
            message="Once appointments are completed or cancelled they will appear here."
          />
        ) : (
          <div className="recent-table">
            <div className="recent-header">
              <span>Date</span>
              <span>Time</span>
              <span>Patient</span>
              <span>Type</span>
              <span>Office</span>
              <span>Status</span>
            </div>
            {pastAppts.map(a => {
              const statusIcon = a.status === 'COMPLETED' ? <CheckCircle2 size={14} color="var(--accent-green)" />
                : a.status === 'CANCELLED' ? <XCircle size={14} color="var(--text-secondary)" />
                : <AlertCircle size={14} color="var(--accent-red)" />;
              return (
                <div key={a.id} className="recent-row">
                  <span className="recent-date">{a.date}</span>
                  <span className="recent-time">{a.time}</span>
                  <span className="recent-patient">{getPatientName(a.patientId, patients)}</span>
                  <span className="recent-type">{getType(a.typeId).name}</span>
                  <span className="recent-office">{getOfficeName(a.officeId, offices)}</span>
                  <span className="recent-status">
                    {statusIcon}
                    <StatusBadge status={a.status} />
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ScheduleEditor
        doctor={doctor}
        isOpen={editingSchedule}
        onClose={() => setEditingSchedule(false)}
        onSaved={(doctorId, weeklySchedule) => {
          setSchedule({ ...weeklySchedule });
        }}
      />
    </div>
  );
}
