import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../services/api';
import TimeSlotGrid from '../components/UI/TimeSlotGrid';
import './Availability.css';

export default function Availability() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctorId, setDoctorId] = useState(searchParams.get('doctorId') || '');
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specialty, setSpecialty] = useState('all');

  useEffect(() => {
    async function load() {
      const [docData, specData] = await Promise.all([
        api.doctors.list(),
        api.specialties.list(),
      ]);
      setDoctors(docData);
      setSpecialties(specData);
      if (!doctorId && docData.length > 0) {
        setDoctorId(String(docData[0].id));
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!doctorId || !date) {
      Promise.resolve().then(() => setSlots([]));
      return;
    }
    Promise.resolve().then(() => setLoading(true));
    api.availability.get(parseInt(doctorId), date).then(s => {
      setSlots(s);
      setLoading(false);
    });
  }, [doctorId, date]);

  const filteredDoctors = specialty === 'all'
    ? doctors
    : doctors.filter(d => d.specialty === specialty);

  function handleSlotSelect(time) {
    if (!doctorId || !date) return;
    navigate(`/appointments/new?doctorId=${doctorId}&date=${date}&time=${time}`);
  }

  return (
    <div className="app-layout fade-in">
      <div className="page-header">
        <h1 className="page-title">Availability</h1>
        <p className="page-subtitle">Find open appointment slots for any doctor on any given date.</p>
      </div>

      <div className="availability-card card">
        <div className="availability-filters">
          <div className="form-group">
            <label className="form-label" htmlFor="specialty">Specialty</label>
            <select
              id="specialty"
              className="form-input"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              <option value="all">All Specialties</option>
              {specialties.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="doctor">Doctor</label>
            <select
              id="doctor"
              className="form-input"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            >
              {filteredDoctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="availability-result">
          <h3 className="result-title">Available Time Slots</h3>
          <p className="result-meta">
            {loading ? 'Loading slots...' : `${slots.filter(s => s.available).length} of ${slots.length} slots open`}
          </p>
          {loading ? (
            <div className="time-slot-grid" style={{ marginTop: '20px' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '46px' }} />
              ))}
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <TimeSlotGrid slots={slots} onSelect={handleSlotSelect} stagger={true} gridKey={`${doctorId}-${date}`} />
            </div>
          )}
        </div>

        <div className="availability-cta">
          <p>Selected a slot? Create the appointment:</p>
          <button
            className="btn-primary"
            onClick={() => navigate(`/appointments/new?doctorId=${doctorId}&date=${date}`)}
          >
            <Search size={14} />
            New Appointment
          </button>
        </div>
      </div>
    </div>
  );
}