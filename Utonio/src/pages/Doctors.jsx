import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Mail, Phone, ChevronRight, UserPlus, Plus, X, Pencil } from 'lucide-react';
import { getDoctors, createDoctor, updateDoctor } from '../api/doctorsApi';
import { getSpecialties, createSpecialty } from '../api/specialtiesApi';
import { useToast } from '../hooks/useToast';
import ScheduleEditor from '../components/UI/ScheduleEditor';
import SlideOver from '../components/UI/SlideOver';
import FloatingField from '../components/UI/FloatingField';
import './Doctors.css';

const EMPTY_DOCTOR_FORM = { fullName: '', specialtyId: '', email: '', licenseNumber: '', documentNumber: '' };
const EMPTY_SPECIALTY_FORM = { name: '', description: '' };

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
        getDoctors(0, 100),
        getSpecialties(),
      ]);
      setDoctors(docData.content || docData);
      setSpecialties(specData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === 'all' ? doctors : doctors.filter(d => d.specialtyId === parseInt(filter) || d.specialty === filter);
  const activeCount = doctors.filter(d => d.status === 'ACTIVE').length;

  function getSpecialtyColor(id) {
    const sp = specialties.find(s => s.id === id);
    return sp?.color || '#7B6EF6';
  }

  function getSpecialtyName(id) {
    const sp = specialties.find(s => s.id === id);
    return sp ? sp.name : id;
  }

  function getInitials(name) {
    return (name || '').replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
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
      fullName: doctor.fullName || '',
      specialtyId: doctor.specialtyId || doctor.specialty || '',
      email: doctor.email || '',
      licenseNumber: doctor.licenseNumber || '',
      documentNumber: doctor.documentNumber || '',
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
    setSpecialtyForm(EMPTY_SPECIALTY_FORM);
    setSpecialtyErrors({});
    setSpecialtySlideOpen(true);
  }

  function closeSpecialtySlide() {
    setSpecialtySlideOpen(false);
    setSpecialtyForm(EMPTY_SPECIALTY_FORM);
    setSpecialtyErrors({});
  }

  function validateDoctor() {
    const e = {};
    if (!doctorForm.fullName.trim()) e.fullName = 'Required';
    if (!doctorForm.specialtyId) e.specialtyId = 'Required';
    if (!doctorForm.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctorForm.email)) e.email = 'Invalid email';
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
        await updateDoctor(editingDoctor.id, doctorForm);
        toast.success(`${doctorForm.fullName} updated successfully`);
      } else {
        await createDoctor(doctorForm);
        toast.success(`${doctorForm.fullName} added successfully`);
      }
      await load();
      closeDoctorSlide();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Could not save doctor');
    } finally {
      setSubmittingDoctor(false);
    }
  }

  async function handleSpecialtySubmit(e) {
    e.preventDefault();
    if (!validateSpecialty()) return;
    setSubmittingSpecialty(true);
    try {
      await createSpecialty(specialtyForm);
      toast.success(`${specialtyForm.name} added successfully`);
      await load();
      closeSpecialtySlide();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Could not save specialty');
    } finally {
      setSubmittingSpecialty(false);
    }
  }

  async function toggleDoctorStatus(doctor) {
    const newStatus = doctor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const name = doctor.fullName || doctor.name;
    if (confirm(`${newStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'} ${name}?`)) {
      try {
        await updateDoctor(doctor.id, { status: newStatus });
        await load();
        toast.info(`${name} marked as ${newStatus.toLowerCase()}`);
      } catch {
        toast.error('Could not update status');
      }
    }
  }

  const ALL_SPECIALTIES = [
    { id: 'all', name: 'All Specialties', color: '#7B6EF6' },
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
          const color = getSpecialtyColor(doc.specialtyId || doc.specialty);
          const name = doc.fullName || doc.name || 'Doctor';
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
                  {getInitials(name)}
                </div>
                <div className={`doctor-status ${doc.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                  {doc.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="doctor-name-row">
                <div className="doctor-name">{name}</div>
                <ChevronRight size={14} className="doctor-card-chevron" />
              </div>

              <span
                className="doctor-specialty-badge"
                style={{ background: `${color}20`, color: color, border: `1px solid ${color}40` }}
              >
                {getSpecialtyName(doc.specialtyId || doc.specialty)}
              </span>

              <div className="doctor-contact">
                <div className="doctor-contact-row">
                  <Mail size={12} />
                  <span>{doc.email}</span>
                </div>
                <div className="doctor-contact-row">
                  <Phone size={12} />
                  <span>{doc.phoneNumber || doc.phone || '—'}</span>
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
            value={doctorForm.fullName}
            onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
            error={doctorErrors.fullName}
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
              className={`floating-select ${doctorErrors.specialtyId ? 'error' : ''}`}
              value={doctorForm.specialtyId}
              onChange={(e) => setDoctorForm({ ...doctorForm, specialtyId: e.target.value })}
            >
              <option value="">Select specialty</option>
              {specialties.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {doctorErrors.specialtyId ? (
              <span className="form-error floating-error">{doctorErrors.specialtyId}</span>
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

          {!editingDoctor && (
            <>
              <FloatingField
                id="doctor-license"
                label="License Number"
                value={doctorForm.licenseNumber}
                onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
                required
              />
              <FloatingField
                id="doctor-document"
                label="Document Number"
                value={doctorForm.documentNumber}
                onChange={(e) => setDoctorForm({ ...doctorForm, documentNumber: e.target.value })}
                required
              />
            </>
          )}

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
        title="Add Specialty"
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

          <FloatingField
            id="specialty-desc"
            label="Description"
            value={specialtyForm.description}
            onChange={(e) => setSpecialtyForm({ ...specialtyForm, description: e.target.value })}
            placeholder="Optional description"
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn-primary" disabled={submittingSpecialty} style={{ flex: 1 }}>
              {submittingSpecialty ? 'Saving...' : 'Add Specialty'}
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