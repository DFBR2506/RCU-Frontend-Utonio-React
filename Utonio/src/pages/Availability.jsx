import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getDoctors } from '../api/doctorsApi';
import { getSpecialties } from '../api/specialtiesApi';
import { getOffices } from '../api/officesApi';
import { getAvailableSlots } from '../api/availabilityApi';
import TimeSlotGrid from '../components/UI/TimeSlotGrid';
import './Availability.css';

function parseSlots(slots) {
  return slots.map(s => ({
    time: (s.startAt || '').substring(11, 16),
    available: true,
  }));
}

export default function Availability() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [offices, setOffices] = useState([]);
  const [doctorId, setDoctorId] = useState(searchParams.get('doctorId') || '');
  const [officeId, setOfficeId] = useState('');
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specialty, setSpecialty] = useState('all');

  useEffect(() => {
    async function load() {
      const [docData, specData, offsData] = await Promise.all([
        getDoctors(0, 100),
        getSpecialties(),
        getOffices(),
      ]);
      const docs = docData.content || docData;
      const offs = offsData.content || (Array.isArray(offsData) ? offsData : []);
      setDoctors(docs);
      setSpecialties(specData.content || specData || []);
      setOffices(offs);
      if (!doctorId && docs.length > 0) setDoctorId(String(docs[0].id));
      if (offs.length > 0) setOfficeId(String(offs[0].id));
    }
    load();
  }, []);

  useEffect(() => {
    if (!doctorId || !officeId || !date) return;
    async function fetchSlots() {
      setLoading(true);
      try {
        const s = await getAvailableSlots(doctorId, officeId, date);
        setSlots(parseSlots(s));
      } catch {
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
  }, [doctorId, officeId, date]);

  const filteredDoctors = specialty === 'all'
    ? doctors
    : doctors.filter(d => d.specialtyId === specialty);

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
                <option key={d.id} value={d.id}>
                  {`${d.firstName || ''} ${d.lastName || ''}`.trim()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="office">Office</label>
            <select
              id="office"
              className="form-input"
              value={officeId}
              onChange={(e) => setOfficeId(e.target.value)}
            >
              {offices.map(o => (
                <option key={o.id} value={o.id}>
                  {o.code} — Floor {o.floor}
                </option>
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
            {loading ? 'Loading slots...' : `${slots.filter(s => s.available).length} slots available`}
          </p>
          {!officeId ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '20px' }}>
              Select an office to see available slots.
            </p>
          ) : loading ? (
            <div className="time-slot-grid" style={{ marginTop: '20px' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '46px' }} />
              ))}
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <TimeSlotGrid slots={slots} onSelect={handleSlotSelect} stagger={true} gridKey={`${doctorId}-${officeId}-${date}`} />
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
