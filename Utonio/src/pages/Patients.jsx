import { useState, useEffect } from 'react';
import { UserPlus, Edit2, Power, FileSignature, X } from 'lucide-react';
import { getPatients, createPatient, updatePatient } from '../api/patientsApi';
import { useToast } from '../hooks/useToast';
import useFormDraft, { draftAge } from '../hooks/useFormDraft';
import Table from '../components/UI/Table';
import SlideOver from '../components/UI/SlideOver';
import FloatingField from '../components/UI/FloatingField';
import './Patients.css';

const DOCUMENT_TYPES = ['CC', 'TI', 'CE', 'PASSPORT'];
const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', documentType: 'CC', documentNumber: '', gender: 'MALE' };

export default function Patients() {
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const draftKey = editing ? `patient-edit-${editing.id}` : 'patient-new';
  const { state: form, setState: setForm, hasDraft, savedAt, clear, reset } = useFormDraft(draftKey, EMPTY_FORM);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getPatients(0, 100);
      setPatients(data.content || data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setSlideOpen(true);
  }

  function openEdit(patient) {
    setEditing(patient);
    setForm({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      email: patient.email || '',
      phone: patient.phone || '',
      documentType: patient.documentType || 'CC',
      documentNumber: patient.documentNumber || '',
      gender: patient.gender || 'MALE',
    });
    setErrors({});
    setSlideOpen(true);
  }

  function closeSlide() {
    setSlideOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function discardDraft() {
    reset();
    toast.info('Draft discarded');
  }

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.documentNumber.trim()) e.documentNumber = 'Required';
    if (!form.documentType) e.documentType = 'Required';
    if (!form.gender) e.gender = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updatePatient(editing.id, form);
        toast.success(`${form.firstName} ${form.lastName} updated successfully`);
      } else {
        await createPatient(form);
        toast.success(`${form.firstName} ${form.lastName} registered successfully`, { title: 'Patient created' });
      }
      await load();
      clear();
      setSlideOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Could not save patient');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(patient) {
    const newActive = !patient.active;
    const name = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
    if (confirm(`Set ${name} as ${newActive ? 'ACTIVE' : 'INACTIVE'}?`)) {
      try {
        await updatePatient(patient.id, { active: newActive });
        await load();
        toast.info(`${name} marked as ${newActive ? 'active' : 'inactive'}`);
      } catch {
        toast.error('Could not update status');
      }
    }
  }

  const columns = [
    { key: 'documentNumber', label: 'Document', width: '120px' },
    {
      key: 'name',
      label: 'Full Name',
      render: (p) => `${p.firstName || ''} ${p.lastName || ''}`.trim(),
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', width: '160px' },
    { key: 'documentType', label: 'Doc Type', width: '100px' },
    { key: 'gender', label: 'Gender', width: '100px' },
    {
      key: 'active',
      label: 'Status',
      width: '100px',
      render: (p) => (
        <span className={`patient-status ${p.active ? 'active' : 'inactive'}`}>
          {p.active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      sortable: false,
      render: (p) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="row-action" onClick={() => openEdit(p)} aria-label="Edit">
            <Edit2 size={14} />
          </button>
          <button className="row-action" onClick={() => toggleStatus(p)} aria-label="Toggle status">
            <Power size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="app-layout fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">Manage registered patients in the university health system.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <UserPlus size={16} />
          Register Patient
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '40px' }}>
            <div className="skeleton" style={{ height: '40px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '40px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '40px' }} />
          </div>
        ) : (
          <Table columns={columns} rows={patients} pageSize={10} emptyVariant="patients" />
        )}
      </div>

      <SlideOver
        isOpen={slideOpen}
        onClose={closeSlide}
        title={editing ? 'Edit Patient' : 'Register Patient'}
      >
        <form onSubmit={handleSubmit} className="patient-form">
          {hasDraft && savedAt ? (
            <div className="draft-banner" role="status">
              <FileSignature size={14} />
              <span>Draft restored · {draftAge(savedAt)}</span>
              <button type="button" className="draft-discard" onClick={discardDraft} aria-label="Discard draft">
                Discard
              </button>
            </div>
          ) : null}

          <div className="floating-row">
            <FloatingField
              id="firstName"
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              error={errors.firstName}
              required
              autoComplete="given-name"
            />
            <FloatingField
              id="lastName"
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              error={errors.lastName}
              required
              autoComplete="family-name"
            />
          </div>

          <FloatingField
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            required
            autoComplete="email"
            inputMode="email"
          />

          <div className="floating-row">
            <FloatingField
              id="phone"
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={errors.phone}
              required
              autoComplete="tel"
              inputMode="tel"
            />
            <FloatingField
              id="documentNumber"
              label="Document Number"
              value={form.documentNumber}
              onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
              error={errors.documentNumber}
              required
            />
          </div>

          <div className="floating-row">
            <div className="floating-field-group">
              <label htmlFor="documentType" className="floating-select-label">
                Doc Type <span className="floating-required" aria-hidden="true"> *</span>
              </label>
              <select
                id="documentType"
                className={`floating-select ${errors.documentType ? 'error' : ''}`}
                value={form.documentType}
                onChange={(e) => setForm({ ...form, documentType: e.target.value })}
              >
                {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.documentType && <span className="form-error floating-error">{errors.documentType}</span>}
            </div>

            <div className="floating-field-group">
              <label htmlFor="gender" className="floating-select-label">
                Gender <span className="floating-required" aria-hidden="true"> *</span>
              </label>
              <select
                id="gender"
                className={`floating-select ${errors.gender ? 'error' : ''}`}
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.gender && <span className="form-error floating-error">{errors.gender}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 1 }}>
              {submitting ? 'Saving...' : editing ? 'Update Patient' : 'Register Patient'}
            </button>
            <button type="button" className="btn-secondary" onClick={closeSlide}>
              <X size={16} />
              Cancel
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}