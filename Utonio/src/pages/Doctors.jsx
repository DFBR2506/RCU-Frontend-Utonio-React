import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Mail, Phone, ChevronRight, UserPlus, Plus, X, Pencil } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';
import ScheduleEditor from '../components/UI/ScheduleEditor';
import SlideOver from '../components/UI/SlideOver';
import FloatingField from '../components/UI/FloatingField';
import './Doctors.css';

const EMPTY_DOCTOR_FORM = { name: '', specialty: '', email: '', phone: '' };
const EMPTY_SPECIALTY_FORM = { name: '', color: '#7B6EF6' };

const COLOR_PALETTE = [
  '#7B6EF6', '#C8F55A', '#00BCD4', '#3DD68C',
  '#F55A8A', '#F5A623', '#5A8AF5', '#A05AF5',
];

export default function Doctors() {
  const navigate = useNavigate();
  const toast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorSlideOpen, setDoctorSlideOpen] = useState(false);
  const [specialtySlideOpen, setSpecialtySlideOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [doctorErrors, setDoctorErrors] = useState({});
  const [specialtyErrors, setSpecialtyErrors] = useState({});
  const [submittingDoctor, setSubmittingDoctor] = useState(false);
  const [submittingSpecialty, setSubmittingSpecialty] = useState(false);

  const [doctorForm, setDoctorForm] = useState(EMPTY_DOCTOR_FORM);
  const [specialtyForm, setSpecialtyForm] = useState(EMPTY_SPECIALTY_FORM);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [docData, specData] = await Promise.all([
        api.doctors.list(),
        api.specialties.list(),
      ]);
      setDoctors(docData);
      setSpecialties(specData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === 'all' ? doctors : doctors.filter(d => d.specialty === filter);
  const activeCount = doctors.filter(d => d.status === 'ACTIVE').length;

  function getSpecialtyColor(id) {
    const sp = specialties.find(s => s.id === id);
    return sp ? sp.color : '#7B6EF6';
  }

  function getSpecialtyName(id) {
    const sp = specialties.find(s => s.id === id);
    return sp ? sp.name : id;
  }

  function getInitials(name) {
    return name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  function openDoctorCreate() {
    setEditingDoctor(null);
    setDoctorForm(EMPTY_DOCTOR_FORM);
    setDoctorErrors({});
    setDoctorSlideOpen(true);
  }

  function openDoctorEdit(doctor) {
    setEditingDoctor(doctor);
    setDoctorForm({
      name: doctor.name || '',
      specialty: doctor.specialty || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
    });
    setDoctorErrors({});
    setDoctorSlideOpen(true);
  }

  function closeDoctorSlide() {
    setDoctorSlideOpen(false);
    setEditingDoctor(null);
    setDoctorForm(EMPTY_DOCTOR_FORM);
    setDoctorErrors({});
  }

  function openSpecialtyCreate() {
    setEditingSpecialty(null);
    setSpecialtyForm(EMPTY_SPECIALTY_FORM);
    setSpecialtyErrors({});
    setSpecialtySlideOpen(true);
  }

  function closeSpecialtySlide() {
    setSpecialtySlideOpen(false);
    setEditingSpecialty(null);
    setSpecialtyForm(EMPTY_SPECIALTY_FORM);
    setSpecialtyErrors({});
  }

  function validateDoctor() {
    const e = {};
    if (!doctorForm.name.trim()) e.name = 'Required';
    if (!doctorForm.specialty) e.specialty = 'Required';
    if (!doctorForm.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctorForm.email)) e.email = 'Invalid email';
    if (!doctorForm.phone.trim()) e.phone = 'Required';
    setDoctorErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateSpecialty() {
    const e = {};
    if (!specialtyForm.name.trim()) e.name = 'Required';
    setSpecialtyErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleDoctorSubmit(e) {
    e.preventDefault();
    if (!validateDoctor()) return;
    setSubmittingDoctor(true);
    try {
      if (editingDoctor) {
        await api.doctors.update(editingDoctor.id, doctorForm);
        toast.success(`${doctorForm.name} updated successfully`);
      } else {
        await api.doctors.create(doctorForm);
        toast.success(`${doctorForm.name} added successfully`);
      }
      await load();
      closeDoctorSlide();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Could not save doctor');
    } finally {
      setSubmittingDoctor(false);
    }
  }

  async function handleSpecialtySubmit(e) {
    e.preventDefault();
    if (!validateSpecialty()) return;
    setSubmittingSpecialty(true);
    try {
      if (editingSpecialty) {
        await api.specialties.update(editingSpecialty.id, specialtyForm);
        toast.success(`${specialtyForm.name} updated successfully`);
      } else {
        await api.specialties.create(specialtyForm);
        toast.success(`${specialtyForm.name} added successfully`);
      }
      await load();
      closeSpecialtySlide();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Could not save specialty');
    } finally {
      setSubmittingSpecialty(false);
    }
  }

  async function toggleDoctorStatus(doctor) {
    const newStatus = doctor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (confirm(`${newStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'} ${doctor.name}?`)) {
      try {
        await api.doctors.update(doctor.id, { status: newStatus });
        await load();
        toast.info(`${doctor.name} marked as ${newStatus.toLowerCase()}`);
      } catch {
        toast.error('Could not update status');
      }
    }
  }

  const ALL_SPECIALTIES = [
    { id: 'all', name: 'All Specialties' },
    ...specialties,
  ];

  if (loading) {
    return (
      <div className="app-layout">
        <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '32px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="card skeleton" style={{ height: '200px' }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctors</h1>
          <p className="page-subtitle">{activeCount} active medical professionals across {specialties.length} specialties.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={openSpecialtyCreate} title="Manage specialties">
            <Plus size={15} />
            Specialty
          </button>
          <button className="btn-primary" onClick={openDoctorCreate}>
            <UserPlus size={16} />
            Add Doctor
          </button>
        </div>
      </div>

      <div className="specialty-tabs">
        {ALL_SPECIALTIES.map(sp => (
          <button
            key={sp.id}
            className={`specialty-tab ${filter === sp.id ? 'active' : ''}`}
            onClick={() => setFilter(sp.id)}
            style={filter === sp.id && sp.id !== 'all' ? { borderColor: sp.color || getSpecialtyColor(sp.id), color: sp.color || getSpecialtyColor(sp.id) } : {}}
          >
            {sp.name}
          </button>
        ))}
      </div>

      <div className="doctors-grid">
        {filtered.map((doc, i) => {
          const color = getSpecialtyColor(doc.specialty);
          return (
            <div
              key={doc.id}
              className="doctor-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/doctors/${doc.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/doctors/${doc.id}`);
                }
              }}
              style={{
                animationDelay: `${i * 50}ms`,
                borderColor: doc.status === 'INACTIVE' ? 'var(--border)' : `${color}30`,
                cursor: 'pointer',
              }}
            >
              <div className="doctor-card-top">
                <div
                  className="doctor-avatar"
                  style={{
                    background: `linear-gradient(135deg, ${color}40, ${color}80)`,
                    borderColor: `${color}80`,
                  }}
                >
                  {getInitials(doc.name)}
                </div>
                <div className={`doctor-status ${doc.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                  {doc.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="doctor-name-row">
                <div className="doctor-name">{doc.name}</div>
                <ChevronRight size={14} className="doctor-card-chevron" />
              </div>

              <span
                className="doctor-specialty-badge"
                style={{ background: `${color}20`, color: color, border: `1px solid ${color}40` }}
              >
                {getSpecialtyName(doc.specialty)}
              </span>

              <div className="doctor-contact">
                <div className="doctor-contact-row">
                  <Mail size={12} />
                  <span>{doc.email}</span>
                </div>
                <div className="doctor-contact-row">
                  <Phone size={12} />
                  <span>{doc.phone}</span>
                </div>
              </div>

              <div className="doctor-card-actions">
                <button
                  className="doctor-cta"
                  style={{ borderColor: `${color}50`, color: color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openDoctorEdit(doc);
                  }}
                  title="Edit doctor"
                >
                  <Pencil size={13} />
                  Edit
                </button>
                <button
                  className="doctor-cta"
                  style={{ borderColor: `${color}50`, color: color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingDoctor(doc);
                  }}
                  disabled={doc.status === 'INACTIVE'}
                  title={doc.status === 'INACTIVE' ? 'Inactive doctor' : 'Edit weekly schedule'}
                >
                  <Calendar size={14} />
                  Schedule
                </button>
              </div>

              <div className="doctor-card-footer">
                <button
                  className="doctor-cta doctor-cta-profile"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/doctors/${doc.id}`);
                  }}
                >
                  Profile
                </button>
                <button
                  className="doctor-cta"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDoctorStatus(doc);
                  }}
                  title={doc.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                >
                  {doc.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <SlideOver
        isOpen={doctorSlideOpen}
        onClose={closeDoctorSlide}
        title={editingDoctor ? 'Edit Doctor' : 'Add Doctor'}
      >
        <form onSubmit={handleDoctorSubmit} className="doctor-form">
          <FloatingField
            id="doctor-name"
            label="Full Name"
            value={doctorForm.name}
            onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
            error={doctorErrors.name}
            required
            autoComplete="name"
            placeholder="e.g. Dr. Sarah Chen"
          />

          <div className="floating-field-group">
            <label htmlFor="doctor-specialty" className="floating-select-label">
              Specialty <span className="floating-required" aria-hidden="true"> *</span>
            </label>
            <select
              id="doctor-specialty"
              className={`floating-select ${doctorErrors.specialty ? 'error' : ''}`}
              value={doctorForm.specialty}
              onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
            >
              <option value="">Select specialty</option>
              {specialties.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {doctorErrors.specialty ? (
              <span className="form-error floating-error">{doctorErrors.specialty}</span>
            ) : null}
          </div>

          <FloatingField
            id="doctor-email"
            label="Email"
            type="email"
            value={doctorForm.email}
            onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
            error={doctorErrors.email}
            required
            autoComplete="email"
            inputMode="email"
          />

          <FloatingField
            id="doctor-phone"
            label="Phone"
            type="tel"
            value={doctorForm.phone}
            onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
            error={doctorErrors.phone}
            required
            autoComplete="tel"
            inputMode="tel"
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn-primary" disabled={submittingDoctor} style={{ flex: 1 }}>
              {submittingDoctor ? 'Saving...' : editingDoctor ? 'Update Doctor' : 'Add Doctor'}
            </button>
            <button type="button" className="btn-secondary" onClick={closeDoctorSlide}>
              <X size={16} />
              Cancel
            </button>
          </div>
        </form>
      </SlideOver>

      <SlideOver
        isOpen={specialtySlideOpen}
        onClose={closeSpecialtySlide}
        title={editingSpecialty ? 'Edit Specialty' : 'Add Specialty'}
      >
        <form onSubmit={handleSpecialtySubmit} className="specialty-form">
          <FloatingField
            id="specialty-name"
            label="Specialty Name"
            value={specialtyForm.name}
            onChange={(e) => setSpecialtyForm({ ...specialtyForm, name: e.target.value })}
            error={specialtyErrors.name}
            required
            placeholder="e.g. Dermatology"
          />

          <div className="floating-field-group">
            <label className="floating-select-label">Color</label>
            <div className="color-palette">
              {COLOR_PALETTE.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-swatch ${specialtyForm.color === color ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => setSpecialtyForm({ ...specialtyForm, color })}
                  title={color}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="specialty-preview">
            <span className="specialty-preview-label">Preview</span>
            <span
              className="specialty-preview-badge"
              style={{ background: `${specialtyForm.color}20`, color: specialtyForm.color, border: `1px solid ${specialtyForm.color}40` }}
            >
              {specialtyForm.name || 'Specialty Name'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn-primary" disabled={submittingSpecialty} style={{ flex: 1 }}>
              {submittingSpecialty ? 'Saving...' : editingSpecialty ? 'Update Specialty' : 'Add Specialty'}
            </button>
            <button type="button" className="btn-secondary" onClick={closeSpecialtySlide}>
              <X size={16} />
              Cancel
            </button>
          </div>
        </form>
      </SlideOver>

      <ScheduleEditor
        doctor={editingDoctor}
        isOpen={!!editingDoctor}
        onClose={() => setEditingDoctor(null)}
      />
    </div>
  );
}