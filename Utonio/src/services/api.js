const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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

const token = () => localStorage.getItem('token');

export const api = {
  auth: {
    login: (email, password) => request('POST', '/auth/login', { email, password }),
  },
  patients: {
    list: () => request('GET', '/patients', null, token()),
    create: (data) => request('POST', '/patients', data, token()),
    update: (id, data) => request('PUT', `/patients/${id}`, data, token()),
  },
  doctors: {
    list: () => request('GET', '/doctors', null, token()),
    get: (id) => request('GET', `/doctors/${id}`, null, token()),
    create: (data) => request('POST', '/doctors', data, token()),
    update: (id, data) => request('PUT', `/doctors/${id}`, data, token()),
    getSchedule: (id) => request('GET', `/doctors/${id}/schedule`, null, token()),
    saveSchedule: (id, weeklySchedule) => request('PUT', `/doctors/${id}/schedule`, { weeklySchedule }, token()),
  },
  specialties: {
    list: () => request('GET', '/specialties', null, token()),
    create: (data) => request('POST', '/specialties', data, token()),
    update: (id, data) => request('PUT', `/specialties/${id}`, data, token()),
    delete: (id) => request('DELETE', `/specialties/${id}`, null, token()),
  },
  appointments: {
    list: () => request('GET', '/appointments', null, token()),
    create: (data) => request('POST', '/appointments', data, token()),
    update: (id, data) => request('PUT', `/appointments/${id}`, data, token()),
  },
  availability: {
    get: (doctorId, date) => request('GET', `/availability?doctorId=${doctorId}&date=${date}`, null, token()),
  },
  offices: {
    list: () => request('GET', '/offices', null, token()),
  },
  reports: {
    occupancy: () => request('GET', '/reports/occupancy', null, token()),
    productivity: () => request('GET', '/reports/productivity', null, token()),
    noShows: () => request('GET', '/reports/no-shows', null, token()),
  },
};

export { APPOINTMENT_STATUSES, ACTIVE_STATUSES, HOUR_BLOCKS, FULL_HOURS, TIME_SLOTS, APPOINTMENT_TYPES, OFFICES, SPECIALTIES } from '../data/constants.js';