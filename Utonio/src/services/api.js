import { mockApi } from './mockData.js';

export { mockApi, SPECIALTIES, APPOINTMENT_TYPES, OFFICES, DOCTORS, PATIENTS, APPOINTMENTS, DOCTOR_SCHEDULES } from './mockData.js';
export { APPOINTMENT_STATUSES, ACTIVE_STATUSES, HOUR_BLOCKS, FULL_HOURS, TIME_SLOTS } from '../data/constants.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function getHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request(method, path, body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: getHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email, password) =>
      USE_MOCK
        ? Promise.resolve({ token: 'mock_token', user: { email } })
        : request('POST', '/auth/login', { email, password }),
  },
  patients: {
    list: () => USE_MOCK ? mockApi.patients.list() : request('GET', '/patients', null, localStorage.getItem('token')),
    create: (data, token) => USE_MOCK ? mockApi.patients.create(data) : request('POST', '/patients', data, token),
    update: (id, data, token) => USE_MOCK ? mockApi.patients.update(id, data) : request('PUT', `/patients/${id}`, data, token),
  },
  doctors: {
    list: () => USE_MOCK ? mockApi.doctors.list() : request('GET', '/doctors', null, localStorage.getItem('token')),
    get: (id) => USE_MOCK ? mockApi.doctors.get(id) : request('GET', `/doctors/${id}`, null, localStorage.getItem('token')),
    getSchedule: (id) => USE_MOCK ? mockApi.doctors.getSchedule(id) : request('GET', `/doctors/${id}/schedule`, null, localStorage.getItem('token')),
    saveSchedule: (id, weeklySchedule) => USE_MOCK
      ? mockApi.doctors.saveSchedule(id, weeklySchedule)
      : request('PUT', `/doctors/${id}/schedule`, { weeklySchedule }, localStorage.getItem('token')),
  },
  appointments: {
    list: () => USE_MOCK ? mockApi.appointments.list() : request('GET', '/appointments', null, localStorage.getItem('token')),
    create: (data, token) => USE_MOCK ? mockApi.appointments.create(data) : request('POST', '/appointments', data, token),
    update: (id, data, token) => USE_MOCK ? mockApi.appointments.update(id, data) : request('PUT', `/appointments/${id}`, data, token),
  },
  availability: {
    get: (doctorId, date) => USE_MOCK ? mockApi.availability.get(doctorId, date) : request('GET', `/availability?doctorId=${doctorId}&date=${date}`, null, localStorage.getItem('token')),
  },
  offices: {
    list: () => USE_MOCK ? mockApi.offices.list() : request('GET', '/offices', null, localStorage.getItem('token')),
  },
  reports: {
    occupancy: () => USE_MOCK ? mockApi.reports.occupancy() : request('GET', '/reports/occupancy', null, localStorage.getItem('token')),
    productivity: () => USE_MOCK ? mockApi.reports.productivity() : request('GET', '/reports/productivity', null, localStorage.getItem('token')),
    noShows: () => USE_MOCK ? mockApi.reports.noShows() : request('GET', '/reports/no-shows', null, localStorage.getItem('token')),
  },
};