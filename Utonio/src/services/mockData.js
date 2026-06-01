import { SPECIALTIES, APPOINTMENT_TYPES, OFFICES, HOUR_BLOCKS } from '../data/constants.js';

export { SPECIALTIES, APPOINTMENT_TYPES, OFFICES };

export const DOCTORS = [
  { id: 1, name: 'Dr. Sarah Chen', specialty: 'general', email: 'schen@utonio.edu', phone: '+1-555-0101', status: 'ACTIVE' },
  { id: 2, name: 'Dr. Marcus Rivera', specialty: 'psychology', email: 'mrivera@utonio.edu', phone: '+1-555-0102', status: 'ACTIVE' },
  { id: 3, name: 'Dr. Aisha Patel', specialty: 'physiotherapy', email: 'apatel@utonio.edu', phone: '+1-555-0103', status: 'ACTIVE' },
  { id: 4, name: 'Dr. Luis Mendoza', specialty: 'nutrition', email: 'lmendoza@utonio.edu', phone: '+1-555-0104', status: 'ACTIVE' },
  { id: 5, name: 'Dr. Emily Thompson', specialty: 'general', email: 'ethompson@utonio.edu', phone: '+1-555-0105', status: 'ACTIVE' },
  { id: 6, name: 'Dr. James Okafor', specialty: 'psychology', email: 'jokafor@utonio.edu', phone: '+1-555-0106', status: 'INACTIVE' },
];

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];

export const PATIENTS = [
  { id: 1, firstName: 'Alexandra', lastName: 'Rivera', email: 'alexandra.r@uni.edu', phone: '+1-555-1001', status: 'ACTIVE', birthDate: '2000-03-15', studentId: 'STU-2024-001' },
  { id: 2, firstName: 'Benjamin', lastName: 'Kim', email: 'ben.kim@uni.edu', phone: '+1-555-1002', status: 'ACTIVE', birthDate: '1999-07-22', studentId: 'STU-2024-002' },
  { id: 3, firstName: 'Camila', lastName: 'Santos', email: 'camila.s@uni.edu', phone: '+1-555-1003', status: 'ACTIVE', birthDate: '2001-11-08', studentId: 'STU-2024-003' },
  { id: 4, firstName: 'David', lastName: 'Nakamura', email: 'david.n@uni.edu', phone: '+1-555-1004', status: 'ACTIVE', birthDate: '1998-05-30', studentId: 'STU-2024-004' },
  { id: 5, firstName: 'Elena', lastName: 'Vasquez', email: 'elena.v@uni.edu', phone: '+1-555-1005', status: 'INACTIVE', birthDate: '2000-09-12', studentId: 'STU-2024-005' },
  { id: 6, firstName: 'Finn', lastName: "O'Brien", email: 'finn.ob@uni.edu', phone: '+1-555-1006', status: 'ACTIVE', birthDate: '2002-01-17', studentId: 'STU-2024-006' },
  { id: 7, firstName: 'Grace', lastName: 'Abebe', email: 'grace.a@uni.edu', phone: '+1-555-1007', status: 'ACTIVE', birthDate: '1999-12-03', studentId: 'STU-2024-007' },
  { id: 8, firstName: 'Hassan', lastName: 'Al-Rashid', email: 'hassan.ar@uni.edu', phone: '+1-555-1008', status: 'ACTIVE', birthDate: '2001-04-25', studentId: 'STU-2024-008' },
  { id: 9, firstName: 'Isla', lastName: 'Fernandez', email: 'isla.f@uni.edu', phone: '+1-555-1009', status: 'INACTIVE', birthDate: '2000-08-19', studentId: 'STU-2024-009' },
  { id: 10, firstName: 'Jake', lastName: 'Morrison', email: 'jake.m@uni.edu', phone: '+1-555-1010', status: 'ACTIVE', birthDate: '1997-06-11', studentId: 'STU-2024-010' },
  { id: 11, firstName: 'Kira', lastName: 'Tanaka', email: 'kira.t@uni.edu', phone: '+1-555-1011', status: 'ACTIVE', birthDate: '2002-02-28', studentId: 'STU-2024-011' },
  { id: 12, firstName: 'Liam', lastName: 'Oduya', email: 'liam.o@uni.edu', phone: '+1-555-1012', status: 'ACTIVE', birthDate: '1999-10-07', studentId: 'STU-2024-012' },
];

const d = (offset) => {
  const date = new Date(today);
  date.setDate(today.getDate() + offset);
  return fmt(date);
};

export const APPOINTMENTS = [
  { id: 1, patientId: 1, doctorId: 1, officeId: 1, typeId: 'initial', date: fmt(today), time: '09:00', duration: 60, status: 'CONFIRMED', notes: 'Annual checkup' },
  { id: 2, patientId: 2, doctorId: 2, officeId: 2, typeId: 'followup', date: fmt(today), time: '09:30', duration: 30, status: 'SCHEDULED', notes: '' },
  { id: 3, patientId: 3, doctorId: 3, officeId: 3, typeId: 'evaluation', date: fmt(today), time: '10:00', duration: 45, status: 'CONFIRMED', notes: 'Post-injury assessment' },
  { id: 4, patientId: 4, doctorId: 4, officeId: 1, typeId: 'followup', date: fmt(today), time: '10:30', duration: 30, status: 'SCHEDULED', notes: '' },
  { id: 5, patientId: 5, doctorId: 5, officeId: 2, typeId: 'initial', date: fmt(today), time: '11:00', duration: 60, status: 'NO_SHOW', notes: 'Missed appointment' },
  { id: 6, patientId: 6, doctorId: 1, officeId: 3, typeId: 'followup', date: d(-1), time: '09:00', duration: 30, status: 'COMPLETED', notes: '' },
  { id: 7, patientId: 7, doctorId: 2, officeId: 1, typeId: 'initial', date: d(-1), time: '10:00', duration: 60, status: 'COMPLETED', notes: 'First session' },
  { id: 8, patientId: 8, doctorId: 3, officeId: 2, typeId: 'evaluation', date: d(-1), time: '11:00', duration: 45, status: 'COMPLETED', notes: '' },
  { id: 9, patientId: 9, doctorId: 4, officeId: 3, typeId: 'followup', date: d(-2), time: '09:00', duration: 30, status: 'CANCELLED', notes: 'Patient requested cancellation' },
  { id: 10, patientId: 10, doctorId: 5, officeId: 1, typeId: 'initial', date: d(-2), time: '10:00', duration: 60, status: 'COMPLETED', notes: '' },
  { id: 11, patientId: 11, doctorId: 1, officeId: 2, typeId: 'followup', date: d(-3), time: '14:00', duration: 30, status: 'NO_SHOW', notes: '' },
  { id: 12, patientId: 12, doctorId: 2, officeId: 3, typeId: 'evaluation', date: d(-3), time: '15:00', duration: 45, status: 'COMPLETED', notes: '' },
  { id: 13, patientId: 1, doctorId: 3, officeId: 1, typeId: 'followup', date: d(-4), time: '09:00', duration: 30, status: 'COMPLETED', notes: '' },
  { id: 14, patientId: 2, doctorId: 4, officeId: 2, typeId: 'initial', date: d(-5), time: '10:00', duration: 60, status: 'CANCELLED', notes: '' },
  { id: 15, patientId: 3, doctorId: 5, officeId: 3, typeId: 'evaluation', date: d(-5), time: '11:00', duration: 45, status: 'COMPLETED', notes: '' },
  { id: 16, patientId: 4, doctorId: 1, officeId: 1, typeId: 'followup', date: d(-6), time: '09:00', duration: 30, status: 'NO_SHOW', notes: '' },
  { id: 17, patientId: 5, doctorId: 2, officeId: 2, typeId: 'initial', date: d(-7), time: '10:00', duration: 60, status: 'COMPLETED', notes: '' },
  { id: 18, patientId: 6, doctorId: 3, officeId: 3, typeId: 'followup', date: d(-7), time: '11:00', duration: 30, status: 'COMPLETED', notes: '' },
  { id: 19, patientId: 7, doctorId: 4, officeId: 1, typeId: 'evaluation', date: d(-8), time: '09:00', duration: 45, status: 'COMPLETED', notes: '' },
  { id: 20, patientId: 8, doctorId: 5, officeId: 2, typeId: 'followup', date: d(-8), time: '10:00', duration: 30, status: 'CANCELLED', notes: '' },
  { id: 21, patientId: 9, doctorId: 1, officeId: 3, typeId: 'initial', date: d(1), time: '09:00', duration: 60, status: 'SCHEDULED', notes: '' },
  { id: 22, patientId: 10, doctorId: 2, officeId: 1, typeId: 'followup', date: d(1), time: '10:00', duration: 30, status: 'CONFIRMED', notes: '' },
  { id: 23, patientId: 11, doctorId: 3, officeId: 2, typeId: 'evaluation', date: d(1), time: '11:00', duration: 45, status: 'SCHEDULED', notes: '' },
  { id: 24, patientId: 12, doctorId: 4, officeId: 3, typeId: 'followup', date: d(2), time: '09:00', duration: 30, status: 'SCHEDULED', notes: '' },
  { id: 25, patientId: 1, doctorId: 5, officeId: 1, typeId: 'initial', date: d(2), time: '10:00', duration: 60, status: 'CONFIRMED', notes: '' },
];

export const DOCTOR_SCHEDULES = DOCTORS.map(doc => {
  const weekly = {};
  for (let day = 0; day < 7; day++) {
    if (doc.status === 'INACTIVE' || day === 0 || day === 6) {
      weekly[day] = [];
      continue;
    }
    const slots = [];
    for (const h of HOUR_BLOCKS) {
      slots.push({ time: `${String(h).padStart(2, '0')}:00`, available: Math.random() > 0.25 });
      if (h !== 11 && h !== 16) {
        slots.push({ time: `${String(h).padStart(2, '0')}:30`, available: Math.random() > 0.25 });
      }
    }
    weekly[day] = slots;
  }
  return { doctorId: doc.id, weeklySchedule: weekly };
});

let nextId = { patients: 13, appointments: 26 };

export const mockApi = {
  patients: {
    list: () => Promise.resolve([...PATIENTS]),
    create: (data) => {
      const newPatient = { ...data, id: nextId.patients++, status: 'ACTIVE' };
      PATIENTS.push(newPatient);
      return Promise.resolve(newPatient);
    },
    update: (id, data) => {
      const idx = PATIENTS.findIndex(p => p.id === id);
      if (idx !== -1) {
        PATIENTS[idx] = { ...PATIENTS[idx], ...data };
        return Promise.resolve(PATIENTS[idx]);
      }
      return Promise.reject(new Error('Patient not found'));
    },
  },
  doctors: {
    list: () => Promise.resolve([...DOCTORS]),
    get: (id) => {
      const doctorId = parseInt(id);
      const doctor = DOCTORS.find(d => d.id === doctorId);
      return doctor
        ? Promise.resolve({ ...doctor })
        : Promise.reject(new Error('Doctor not found'));
    },
    getSchedule: (id) => {
      const schedule = DOCTOR_SCHEDULES.find(s => s.doctorId === id)
        || { doctorId: id, weeklySchedule: { 0:[],1:[],2:[],3:[],4:[],5:[],6:[] } };
      return Promise.resolve(JSON.parse(JSON.stringify(schedule)));
    },
    saveSchedule: (id, weeklySchedule) => {
      const idx = DOCTOR_SCHEDULES.findIndex(s => s.doctorId === id);
      if (idx === -1) {
        DOCTOR_SCHEDULES.push({ doctorId: id, weeklySchedule });
      } else {
        DOCTOR_SCHEDULES[idx].weeklySchedule = weeklySchedule;
      }
      return Promise.resolve(DOCTOR_SCHEDULES.find(s => s.doctorId === id));
    },
  },
  appointments: {
    list: () => Promise.resolve([...APPOINTMENTS]),
    create: (data) => {
      const newAppt = { ...data, id: nextId.appointments++, status: 'SCHEDULED', notes: '' };
      APPOINTMENTS.push(newAppt);
      return Promise.resolve(newAppt);
    },
    update: (id, data) => {
      const idx = APPOINTMENTS.findIndex(a => a.id === id);
      if (idx !== -1) {
        APPOINTMENTS[idx] = { ...APPOINTMENTS[idx], ...data };
        return Promise.resolve(APPOINTMENTS[idx]);
      }
      return Promise.reject(new Error('Appointment not found'));
    },
  },
  availability: {
    get: (doctorId, date) => {
      const doctorIdNum = parseInt(doctorId);
      const schedule = DOCTOR_SCHEDULES.find(s => s.doctorId === doctorIdNum);
      const dayOfWeek = new Date(date + 'T00:00:00').getDay();
      const daySlots = schedule?.weeklySchedule?.[dayOfWeek] || [];
      const booked = APPOINTMENTS.filter(a => a.doctorId === doctorIdNum && a.date === date);
      const bookedTimes = new Set(booked.map(b => b.time));
      return Promise.resolve(daySlots.map(s => ({
        ...s,
        available: s.available && !bookedTimes.has(s.time)
      })));
    },
  },
  offices: { list: () => Promise.resolve([...OFFICES]) },
  reports: {
    occupancy: () => Promise.resolve([
      { office: 'Consultorio A', date: fmt(today), occupancy: 78 },
      { office: 'Consultorio B', date: fmt(today), occupancy: 62 },
      { office: 'Consultorio C', date: fmt(today), occupancy: 45 },
    ]),
    productivity: () => Promise.resolve(
      DOCTORS.filter(d => d.status === 'ACTIVE').map(d => ({
        doctor: d.name,
        completed: APPOINTMENTS.filter(a => a.doctorId === d.id && a.status === 'COMPLETED').length
      })).sort((a, b) => b.completed - a.completed)
    ),
    noShows: () => Promise.resolve(
      PATIENTS.map(p => {
        const noShows = APPOINTMENTS.filter(a => a.patientId === p.id && a.status === 'NO_SHOW');
        return {
          patient: `${p.firstName} ${p.lastName}`,
          studentId: p.studentId,
          count: noShows.length,
          lastDate: noShows.length ? noShows[0].date : null
        };
      }).filter(x => x.count > 0)
    ),
  },
};
