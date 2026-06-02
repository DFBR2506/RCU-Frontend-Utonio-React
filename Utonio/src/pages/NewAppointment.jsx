import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, FileSignature, RotateCcw } from 'lucide-react';
import { getPatients } from '../api/patientsApi';
import { getDoctors } from '../api/doctorsApi';
import { getSpecialties } from '../api/specialtiesApi';
import { getAppointmentTypes } from '../api/appointmentTypesApi';
import { getOffices } from '../api/officesApi';
import { getAvailableSlots } from '../api/availabilityApi';
import { createAppointment } from '../api/appointmentsApi';
import { useToast } from '../hooks/useToast';
import useFormDraft, { draftAge } from '../hooks/useFormDraft';
import TimeSlotGrid from '../components/UI/TimeSlotGrid';
import './NewAppointment.css';

const STEPS = [
  { id: 1, label: 'Patient' },
  { id: 2, label: 'Doctor' },
  { id: 3, label: 'Date & Time' },
  { id: 4, label: 'Type' },
  { id: 5, label: 'Office' },
  { id: 6, label: 'Review' },
];

const initialAppointment = (searchParams) => ({
  patientId: '',
  specialtyId: '',
  doctorId: searchParams.get('doctorId') || '',
  date: searchParams.get('date') || new Date().toISOString().split('T')[0],
  time: searchParams.get('time') || '',
  typeId: '',
  officeId: '',
});

function parseSlots(slots) {
  return slots.map(s => ({
    time: (s.slotStart || s.time || '').substring(0, 5),
    available: true,
  }));
}

export default function NewAppointment() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const { state: data, setState: setData, hasDraft, savedAt, clear, reset } = useFormDraft(
    'appointment-new',
    () => initialAppointment(searchParams)
  );
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [offices, setOffices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (hasDraft && savedAt) {
      toast.info(`Draft restored from ${draftAge(savedAt)}`, { title: 'Resuming appointment' });
    }
  }, []);

  useEffect(() => {
    async function load() {
      const [pats, docs, specs, types, offs] = await Promise.all([
        getPatients(0, 100),
        getDoctors(0, 100),
        getSpecialties(),
        getAppointmentTypes(),
        getOffices(),
      ]);
      setPatients(pats.content || pats);
      setDoctors(docs.content || docs);
      setSpecialties(specs);
      setAppointmentTypes(types);
      setOffices(Array.isArray(offs) ? offs : []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!data.doctorId || !data.date) {
      return;
    }
    getAvailableSlots(parseInt(data.doctorId), data.date)
      .then(s => setSlots(parseSlots(s)))
      .catch(() => setSlots([]));
  }, [data.doctorId, data.date]);

  const doctorsBySpecialty = data.specialtyId
    ? doctors.filter(d => (d.specialtyId || d.specialty) === parseInt(data.specialtyId) && d.status === 'ACTIVE')
    : doctors.filter(d => d.status === 'ACTIVE');

  function canAdvance() {
    if (step === 1) return !!data.patientId;
    if (step === 2) return !!data.doctorId;
    if (step === 3) return !!data.date && !!data.time;
    if (step === 4) return !!data.typeId;
    if (step === 5) return !!data.officeId;
    return true;
  }

  function next() {
    if (canAdvance()) {
      if (step < 6) setStep(step + 1);
    }
  }

  function prev() {
    if (step > 1) setStep(step - 1);
  }

  async function submit() {
    setSubmitting(true);
    const apptType = appointmentTypes.find(t => t.id === parseInt(data.typeId));
    try {
      const [year, month, day] = data.date.split('-');
      const [hour, minute] = data.time.split(':');
      const startAt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)).toISOString();

      await createAppointment({
        patientId: parseInt(data.patientId),
        doctorId: parseInt(data.doctorId),
        officeId: parseInt(data.officeId),
        appointmentTypeId: parseInt(data.typeId),
        startAt,
        durationMinutes: apptType?.durationMinutes || 30,
      });
      const patientName = patients.find(p => p.id === parseInt(data.patientId))?.fullName || 'Patient';
      toast.success(`Appointment for ${patientName} created`, { title: 'Appointment scheduled' });
      clear();
      setSubmitting(false);
      setConfirmed(true);
    } catch (err) {
      setSubmitting(false);
      toast.error(err?.response?.data?.message || 'Could not create appointment');
    }
  }

  const patient = patients.find(p => p.id === parseInt(data.patientId));
  const doctor = doctors.find(d => d.id === parseInt(data.doctorId));
  const type = appointmentTypes.find(t => t.id === parseInt(data.typeId));
  const office = offices.find(o => o.id === parseInt(data.officeId));
  const specialty = specialties.find(s => (s.id || s.id) === parseInt(data.specialtyId));

  if (confirmed) {
    const patientName = patient?.fullName || '';
    const doctorName = doctor?.fullName || doctor?.name || '';
    return (
      <div className="app-layout fade-in">
        <div className="confirmation-pulse card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div className="success-circle">
            <Check size={48} strokeWidth={3} color="var(--bg-base)" />
          </div>
          <h1 className="page-title" style={{ marginTop: '24px' }}>Appointment Confirmed</h1>
          <p className="page-subtitle">
            {patientName} with {doctorName}
            <br />
            {data.date} at {data.time}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px' }}>
            <button className="btn-secondary" onClick={() => navigate('/appointments')}>
              View All Appointments
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                setConfirmed(false);
                setStep(1);
                reset();
              }}
            >
              New Appointment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-layout">
        <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '32px' }} />
        <div className="card skeleton" style={{ height: '400px' }} />
      </div>
    );
  }

  return (
    <div className="app-layout fade-in">
      <div className="page-header">
        <h1 className="page-title">New Appointment</h1>
        <p className="page-subtitle">Step {step} of 6 — {STEPS[step - 1].label}</p>
      </div>

      {hasDraft && savedAt ? (
        <div className="draft-banner" role="status">
          <FileSignature size={14} />
          <span>Draft restored · {draftAge(savedAt)}</span>
          <button type="button" className="draft-discard" onClick={reset}>
            <RotateCcw size={12} />
            Start over
          </button>
        </div>
      ) : null}

      <div className="wizard-progress">
        <div
          className="wizard-progress-fill"
          style={{ width: `${(step / 6) * 100}%` }}
        />
      </div>

      <div className="wizard-steps">
        {STEPS.map(s => (
          <div
            key={s.id}
            className={`wizard-step ${s.id <= step ? 'active' : ''} ${s.id === step ? 'current' : ''}`}
          >
            <div className="wizard-step-num">{s.id < step ? <Check size={14} /> : s.id}</div>
            <span className="wizard-step-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="wizard-content card">
        {step === 1 && (
          <div>
            <h3 className="wizard-section-title">Select Patient</h3>
            <div className="patient-search">
              <input
                type="text"
                className="form-input"
                placeholder="Search by name or document number..."
                id="patient-search-input"
              />
            </div>
            <div className="patient-list">
              {patients.map(p => (
                <button
                  key={p.id}
                  className={`patient-card ${data.patientId === String(p.id) ? 'selected' : ''}`}
                  onClick={() => setData({ ...data, patientId: String(p.id) })}
                >
                  <div className="patient-card-name">{p.fullName || p.firstName + ' ' + p.lastName}</div>
                  <div className="patient-card-meta">{p.documentNumber || p.studentId || p.id} · {p.email}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="wizard-section-title">Select Specialty & Doctor</h3>
            <div className="specialty-tabs" style={{ marginBottom: '20px' }}>
              <button
                className={`specialty-tab ${!data.specialtyId ? 'active' : ''}`}
                onClick={() => setData({ ...data, specialtyId: '', doctorId: '' })}
              >
                All
              </button>
              {specialties.map(sp => (
                <button
                  key={sp.id}
                  className={`specialty-tab ${data.specialtyId === String(sp.id) ? 'active' : ''}`}
                  onClick={() => setData({ ...data, specialtyId: String(sp.id), doctorId: '' })}
                  style={data.specialtyId === String(sp.id) ? { borderColor: sp.color, color: sp.color } : {}}
                >
                  {sp.name}
                </button>
              ))}
            </div>
            <div className="doctor-list">
              {doctorsBySpecialty.map(d => {
                const docSpecId = d.specialtyId || d.specialty;
                const sp = specialties.find(s => s.id === docSpecId);
                const name = d.fullName || d.name || 'Doctor';
                return (
                  <button
                    key={d.id}
                    className={`doctor-option ${data.doctorId === String(d.id) ? 'selected' : ''}`}
                    onClick={() => setData({ ...data, doctorId: String(d.id) })}
                    style={data.doctorId === String(d.id) && sp ? { borderColor: sp.color } : {}}
                  >
                    <div className="doctor-option-name">{name}</div>
                    <div className="doctor-option-specialty" style={{ color: sp?.color }}>{sp?.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="wizard-section-title">Select Date & Time</h3>
            <div className="form-group" style={{ maxWidth: 280, marginBottom: '24px' }}>
              <label className="form-label" htmlFor="appt-date">Date</label>
              <input
                id="appt-date"
                type="date"
                className="form-input"
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value, time: '' })}
              />
            </div>
            <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: '12px', fontSize: '14px' }}>Available Slots</h4>
            <TimeSlotGrid
              slots={slots}
              selected={data.time}
              onSelect={(time) => setData({ ...data, time })}
              stagger={true}
              gridKey={`${data.doctorId}-${data.date}`}
            />
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="wizard-section-title">Select Appointment Type</h3>
            <div className="type-grid">
              {appointmentTypes.map(t => (
                <button
                  key={t.id}
                  className={`type-card ${data.typeId === String(t.id) ? 'selected' : ''}`}
                  onClick={() => setData({ ...data, typeId: String(t.id) })}
                >
                  <div className="type-card-name">{t.name}</div>
                  <div className="type-card-duration">{t.durationMinutes || 30} min</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h3 className="wizard-section-title">Select Office</h3>
            <div className="office-list">
              {offices.map(o => (
                <button
                  key={o.id}
                  className={`office-card ${data.officeId === String(o.id) ? 'selected' : ''}`}
                  onClick={() => setData({ ...data, officeId: String(o.id) })}
                >
                  <div className="office-card-name">{o.name}</div>
                  <div className="office-card-floor">{o.floor || '—'}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h3 className="wizard-section-title">Review & Confirm</h3>
            <div className="review-grid">
              <div className="review-row">
                <div className="review-label">Patient</div>
                <div className="review-value">{patient?.fullName || ''}</div>
              </div>
              <div className="review-row">
                <div className="review-label">Doctor</div>
                <div className="review-value">
                  {(doctor?.fullName || doctor?.name || '')}
                  {specialty ? <span style={{ color: specialty.color, fontSize: '13px' }}> · {specialty.name}</span> : null}
                </div>
              </div>
              <div className="review-row">
                <div className="review-label">Date</div>
                <div className="review-value">{data.date}</div>
              </div>
              <div className="review-row">
                <div className="review-label">Time</div>
                <div className="review-value">{data.time}</div>
              </div>
              <div className="review-row">
                <div className="review-label">Type</div>
                <div className="review-value">{type?.name || '—'} ({type?.durationMinutes || 30} min)</div>
              </div>
              <div className="review-row">
                <div className="review-label">Office</div>
                <div className="review-value">{office?.name || '—'}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="wizard-nav">
        <button className="btn-secondary" onClick={prev} disabled={step === 1}>
          <ChevronLeft size={16} />
          Back
        </button>
        {step < 6 ? (
          <button className="btn-primary" onClick={next} disabled={!canAdvance()}>
            Next
            <ChevronRight size={16} />
          </button>
        ) : (
          <button className="btn-primary" onClick={submit} disabled={submitting}>
            {submitting ? 'Creating...' : 'Confirm Appointment'}
            <Check size={16} />
          </button>
        )}
      </div>
    </div>
  );
}