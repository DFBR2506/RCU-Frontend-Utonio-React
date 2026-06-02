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

const DOCUMENT_TYPES = ['CC', 'TI', 'CE', 'PASSPORT'];
const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const EMPTY_DOCTOR_FORM = { firstName: '', lastName: '', email: '', phone: '', documentType: 'CC', documentNumber: '', gender: 'MALE', licenseNumber: '', specialtyId: '' };
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
      setSpecialties(specData.content || specData || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === 'all' ? doctors : doctors.filter(d => d.specialtyId === filter);
  const activeCount = doctors.filter(d => d.active === true).length;

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
      firstName: doctor.firstName || '',
      lastName: doctor.lastName || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      documentType: doctor.documentType || 'CC',
      documentNumber: doctor.documentNumber || '',
      gender: doctor.gender || 'MALE',
      licenseNumber: doctor.licenseNumber || '',
      specialtyId: doctor.specialtyId || '',
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
    if (!doctorForm.firstName.trim()) e.firstName = 'Required';
    if (!doctorForm.lastName.trim()) e.lastName = 'Required';
    if (!doctorForm.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctorForm.email)) e.email = 'Invalid email';
    if (!doctorForm.phone.trim()) e.phone = 'Required';
    if (!doctorForm.documentNumber.trim()) e.documentNumber = 'Required';
    if (!doctorForm.licenseNumber.trim()) e.licenseNumber = 'Required';
    if (!doctorForm.specialtyId) e.specialtyId = 'Required';
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
        toast.success(`${doctorForm.firstName} ${doctorForm.lastName} updated successfully`);
      } else {
        await createDoctor(doctorForm);
        toast.success(`${doctorForm.firstName} ${doctorForm.lastName} added successfully`);
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
    const newActive = !doctor.active;
    const name = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
    if (confirm(`${newActive ? 'Activate' : 'Deactivate'} ${name}?`)) {
      try {
        await updateDoctor(doctor.id, { active: newActive });
        await load();
        toast.info(`${name} marked as ${newActive ? 'active' : 'inactive'}`);
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
          const color = getSpecialtyColor(doc.specialtyId);
          const name = `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || 'Doctor';
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
                <div className={`doctor-status ${doc.active ? 'active' : 'inactive'}`}>
                  {doc.active ? 'Active' : 'Inactive'}
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
                  disabled={!doc.active}
                  title={!doc.active ? 'Inactive doctor' : 'Edit weekly schedule'}
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
                  title={doc.active ? 'Deactivate' : 'Activate'}
                >
                  {doc.active ? 'Deactivate' : 'Activate'}
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
          <div className="floating-row">
            <FloatingField
              id="doctor-firstname"
              label="First Name"
              value={doctorForm.firstName}
              onChange={(e) => setDoctorForm({ ...doctorForm, firstName: e.target.value })}
              error={doctorErrors.firstName}
              required
              autoComplete="given-name"
            />
            <FloatingField
              id="doctor-lastname"
              label="Last Name"
              value={doctorForm.lastName}
              onChange={(e) => setDoctorForm({ ...doctorForm, lastName: e.target.value })}
              error={doctorErrors.lastName}
              required
              autoComplete="family-name"
            />
          </div>

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

          <div className="floating-row">
            <div className="floating-field-group">
              <label htmlFor="doctor-doctype" className="floating-select-label">
                Doc Type <span className="floating-required" aria-hidden="true"> *</span>
              </label>
              <select
                id="doctor-doctype"
                className="floating-select"
                value={doctorForm.documentType}
                onChange={(e) => setDoctorForm({ ...doctorForm, documentType: e.target.value })}
              >
                {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="floating-field-group">
              <label htmlFor="doctor-gender" className="floating-select-label">
                Gender <span className="floating-required" aria-hidden="true"> *</span>
              </label>
              <select
                id="doctor-gender"
                className="floating-select"
                value={doctorForm.gender}
                onChange={(e) => setDoctorForm({ ...doctorForm, gender: e.target.value })}
              >
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <FloatingField
            id="doctor-document"
            label="Document Number"
            value={doctorForm.documentNumber}
            onChange={(e) => setDoctorForm({ ...doctorForm, documentNumber: e.target.value })}
            error={doctorErrors.documentNumber}
            required
          />

          <FloatingField
            id="doctor-license"
            label="License Number"
            value={doctorForm.licenseNumber}
            onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
            error={doctorErrors.licenseNumber}
            required
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