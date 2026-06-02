import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, CheckCircle, XCircle, AlertCircle, Search, X } from 'lucide-react';
import { getAppointments, confirmAppointment, cancelAppointment, completeAppointment, markNoShow } from '../api/appointmentsApi';
import { getDoctors } from '../api/doctorsApi';
import { getPatients } from '../api/patientsApi';
import { getOffices } from '../api/officesApi';
import { APPOINTMENT_STATUSES } from '../data/constants';
import { useToast } from '../hooks/useToast';
import useDebounce from '../hooks/useDebounce';
import Table from '../components/UI/Table';
import SlideOver from '../components/UI/SlideOver';
import StatusBadge from '../components/UI/StatusBadge';
import './Appointments.css';

const STATUSES = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

function parseDateTime(iso) {
  if (!iso) return { date: '', time: '' };
  const [date, time] = iso.split('T');
  return { date, time: time?.substring(0, 5) || '' };
}

export default function Appointments() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(searchInput, 200);

  useEffect(() => {
    const urlDate = searchParams.get('date') || '';
    if (urlDate !== dateFilter) {
      Promise.resolve().then(() => setDateFilter(urlDate));
    }
  }, [searchParams]);

  useEffect(() => {
    const urlQ = searchParams.get('q') || '';
    if (urlQ !== searchInput) {
      Promise.resolve().then(() => setSearchInput(urlQ));
    }
  }, [searchParams]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [apptsData, docsData, patsData, offsData] = await Promise.all([
        getAppointments({}, 0, 100),
        getDoctors(0, 100),
        getPatients(0, 100),
        getOffices(),
      ]);
      setAppointments(apptsData.content || apptsData);
      setDoctors(docsData.content || docsData);
      setPatients(patsData.content || patsData);
      setOffices(Array.isArray(offsData) ? offsData : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }

  function getPatientName(id) {
    const p = patients.find(p => p.id === id);
    return p ? (p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim()) : 'Unknown';
  }

  function getDoctorName(id) {
    const d = doctors.find(d => d.id === id);
    return d ? (d.fullName || d.name || 'Unknown') : 'Unknown';
  }

  function getOfficeName(id) {
    const o = offices.find(o => o.id === id);
    return o ? o.name : '—';
  }

  function openAppointment(appt) {
    setSelected(appt);
    setSlideOpen(true);
  }

  async function transition(newStatus) {
    if (!selected) return;
    try {
      switch (newStatus) {
        case 'CONFIRMED': await confirmAppointment(selected.id); break;
        case 'COMPLETED': await completeAppointment(selected.id); break;
        case 'CANCELLED': await cancelAppointment(selected.id); break;
        case 'NO_SHOW': await markNoShow(selected.id); break;
      }
      await load();
      setSelected({ ...selected, status: newStatus });
      const patient = getPatientName(selected.patientId);
      const labels = {
        CONFIRMED: 'confirmed',
        COMPLETED: 'marked as completed',
        CANCELLED: 'cancelled',
        NO_SHOW: 'marked as no-show',
      };
      toast.success(`Appointment with ${patient} ${labels[newStatus]}`);
    } catch (err) {
      console.error(err);
      toast.error('Could not update appointment');
    }
  }

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return appointments.filter(a => {
      const { date, time } = parseDateTime(a.startAt);
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (doctorFilter !== 'ALL' && a.doctorId !== parseInt(doctorFilter)) return false;
      if (dateFilter && date !== dateFilter) return false;
      if (q) {
        const patientName = getPatientName(a.patientId).toLowerCase();
        const doctorName = getDoctorName(a.doctorId).toLowerCase();
        const status = (a.status || '').toLowerCase().replace('_', ' ');
        const notes = (a.notes || '').toLowerCase();
        const type = (a.typeId || '').toLowerCase();
        if (
          !patientName.includes(q) &&
          !doctorName.includes(q) &&
          !status.includes(q) &&
          !notes.includes(q) &&
          !time.includes(q) &&
          !type.includes(q) &&
          !date.includes(q)
        ) return false;
      }
      return true;
    });
  }, [appointments, statusFilter, doctorFilter, dateFilter, debouncedSearch, patients, doctors]);

  const columns = [
    {
      key: 'date',
      label: 'Date',
      width: '120px',
      render: (a) => {
        const { date } = parseDateTime(a.startAt);
        return <span style={{ fontWeight: 600 }}>{date}</span>;
      },
    },
    {
      key: 'time',
      label: 'Time',
      width: '80px',
      render: (a) => {
        const { time } = parseDateTime(a.startAt);
        return time;
      },
    },
    {
      key: 'patient',
      label: 'Patient',
      render: (a) => getPatientName(a.patientId),
    },
    {
      key: 'doctor',
      label: 'Doctor',
      render: (a) => getDoctorName(a.doctorId),
    },
    { key: 'officeId', label: 'Office', width: '120px', render: (a) => getOfficeName(a.officeId) },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
      render: (a) => <StatusBadge status={a.status} />,
    },
  ];

  const canConfirm = selected?.status === 'SCHEDULED';
  const canComplete = selected?.status === 'CONFIRMED';
  const canCancel = selected?.status === 'SCHEDULED' || selected?.status === 'CONFIRMED';
  const canMarkNoShow = selected?.status === 'CONFIRMED';

  return (
    <div className="app-layout fade-in">
      <div className="page-header">
        <h1 className="page-title">Appointments</h1>
        <p className="page-subtitle">Manage and track all medical appointments across the system.</p>
      </div>

      <div className="filters-bar">
        <div className="appointments-search">
          <Search size={14} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Search by patient, doctor, status, notes…"
            value={searchInput}
            onChange={(e) => {
              const val = e.target.value;
              setSearchInput(val);
              const next = new URLSearchParams(searchParams);
              if (val) next.set('q', val);
              else next.delete('q');
              setSearchParams(next);
            }}
            className="appointments-search-input"
            aria-label="Search appointments"
          />
          {searchInput && (
            <button
              className="appointments-search-clear"
              onClick={() => {
                setSearchInput('');
                const next = new URLSearchParams(searchParams);
                next.delete('q');
                setSearchParams(next);
              }}
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <div className="filter-group">
          <Filter size={14} color="var(--text-secondary)" />
          <span className="filter-label">Status:</span>
          <div className="status-pills">
            {['ALL', ...STATUSES].map(s => {
              const cfg = APPOINTMENT_STATUSES.find(x => x.id === s);
              return (
                <button
                  key={s}
                  className={`status-pill ${statusFilter === s ? 'active' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {cfg?.label || s}
                </button>
              );
            })}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">Doctor:</span>
          <select
            className="form-input filter-select"
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
          >
            <option value="ALL">All Doctors</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.fullName || d.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-label">Date:</span>
          <input
            type="date"
            className="form-input filter-select"
            value={dateFilter}
            onChange={(e) => {
              const val = e.target.value;
              setDateFilter(val);
              if (val) setSearchParams({ date: val });
              else {
                const next = new URLSearchParams(searchParams);
                next.delete('date');
                setSearchParams(next);
              }
            }}
          />
          {dateFilter && (
            <button
              className="filter-clear"
              onClick={() => {
                setDateFilter('');
                const next = new URLSearchParams(searchParams);
                next.delete('date');
                setSearchParams(next);
              }}
              aria-label="Clear date filter"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '40px' }}>
            <div className="skeleton" style={{ height: '40px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '40px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '40px' }} />
          </div>
        ) : (
          <Table
            columns={columns.map(c => c.render ? {
              ...c,
              render: (a) => (
                <div onClick={() => openAppointment(a)} style={{ cursor: 'pointer' }}>
                  {c.render(a)}
                </div>
              ),
            } : c)}
            rows={filtered}
            pageSize={12}
            searchable={false}
            emptyMessage={debouncedSearch
              ? `No appointments match "${debouncedSearch}"`
              : 'No appointments match the current filters'}
            emptyVariant="appointments"
          />
        )}
      </div>

      <SlideOver
        isOpen={slideOpen}
        onClose={() => setSlideOpen(false)}
        title="Appointment Details"
        width={520}
      >
        {selected && (
          <div className="appointment-detail">
            <div className="detail-header">
              <div className="detail-status">
                <StatusBadge status={selected.status} />
              </div>
              <div className="detail-id">ID: #{selected.id}</div>
            </div>

            <div className="detail-grid">
              <div className="detail-field">
                <div className="detail-label">Patient</div>
                <div className="detail-value">{getPatientName(selected.patientId)}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Doctor</div>
                <div className="detail-value">{getDoctorName(selected.doctorId)}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Date</div>
                <div className="detail-value">{parseDateTime(selected.startAt).date}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Time</div>
                <div className="detail-value">{parseDateTime(selected.startAt).time}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Duration</div>
                <div className="detail-value">{selected.durationMinutes || selected.duration || 30} min</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Office</div>
                <div className="detail-value">{getOfficeName(selected.officeId)}</div>
              </div>
            </div>

            {selected.notes && (
              <div className="detail-notes">
                <div className="detail-label">Notes</div>
                <div className="notes-content">{selected.notes}</div>
              </div>
            )}

            <div className="detail-actions">
              <h4 className="actions-title">Actions</h4>
              <div className="actions-grid">
                {canConfirm && (
                  <button className="action-btn confirm" onClick={() => transition('CONFIRMED')}>
                    <CheckCircle size={16} />
                    Confirm
                  </button>
                )}
                {canComplete && (
                  <button className="action-btn complete" onClick={() => transition('COMPLETED')}>
                    <CheckCircle size={16} />
                    Mark Complete
                  </button>
                )}
                {canMarkNoShow && (
                  <button className="action-btn no-show" onClick={() => transition('NO_SHOW')}>
                    <AlertCircle size={16} />
                    No Show
                  </button>
                )}
                {canCancel && (
                  <button className="action-btn cancel" onClick={() => transition('CANCELLED')}>
                    <XCircle size={16} />
                    Cancel
                  </button>
                )}
                {!canConfirm && !canComplete && !canMarkNoShow && !canCancel && (
                  <p className="no-actions">No actions available for this status.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}