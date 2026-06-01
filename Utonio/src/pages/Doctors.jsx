import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Mail, Phone, ChevronRight } from 'lucide-react';
import { mockApi, SPECIALTIES } from '../services/api';
import ScheduleEditor from '../components/UI/ScheduleEditor';
import './Doctors.css';

const ALL_SPECIALTIES = [
  { id: 'all', name: 'All Specialties' },
  ...SPECIALTIES,
];

export default function Doctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingDoctor, setEditingDoctor] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await mockApi.doctors.list();
        setDoctors(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = filter === 'all' ? doctors : doctors.filter(d => d.specialty === filter);
  const activeCount = doctors.filter(d => d.status === 'ACTIVE').length;

  const getInitials = (name) => {
    return name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getSpecialtyColor = (id) => {
    const sp = SPECIALTIES.find(s => s.id === id);
    return sp ? sp.color : '#7B6EF6';
  };

  const getSpecialtyName = (id) => {
    const sp = SPECIALTIES.find(s => s.id === id);
    return sp ? sp.name : id;
  };

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
        <h1 className="page-title">Doctors</h1>
        <p className="page-subtitle">{activeCount} active medical professionals across {SPECIALTIES.length} specialties.</p>
      </div>

      <div className="specialty-tabs">
        {ALL_SPECIALTIES.map(sp => (
          <button
            key={sp.id}
            className={`specialty-tab ${filter === sp.id ? 'active' : ''}`}
            onClick={() => setFilter(sp.id)}
            style={filter === sp.id && sp.id !== 'all' ? { borderColor: getSpecialtyColor(sp.id), color: getSpecialtyColor(sp.id) } : {}}
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
                    setEditingDoctor(doc);
                  }}
                  disabled={doc.status === 'INACTIVE'}
                  title={doc.status === 'INACTIVE' ? 'Inactive doctor' : 'Edit weekly schedule'}
                >
                  <Calendar size={14} />
                  Schedule
                </button>
                <button
                  className="doctor-cta doctor-cta-profile"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/doctors/${doc.id}`);
                  }}
                >
                  Profile
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ScheduleEditor
        doctor={editingDoctor}
        isOpen={!!editingDoctor}
        onClose={() => setEditingDoctor(null)}
      />
    </div>
  );
}