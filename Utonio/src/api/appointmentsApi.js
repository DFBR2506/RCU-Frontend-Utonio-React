import api from './AxiosConfig';

export async function getAppointments(filters = {}, page = 0, size = 10) {
  const params = { page, size, sort: 'startAt,asc' };
  if (filters.status) params.status = filters.status;
  if (filters.startAt) params.startAt = filters.startAt;
  if (filters.endAt) params.endAt = filters.endAt;
  if (filters.patientId) params.patientId = filters.patientId;
  if (filters.doctorId) params.doctorId = filters.doctorId;

  const response = await api.get('/api/appointments', { params });
  return response.data;
}

export async function getMineAppointments(page = 0, size = 10) {
  const response = await api.get('/api/appointments/mine', { params: { page, size } });
  return response.data;
}

export async function createAppointment(data) {
  const response = await api.post('/api/appointments', data);
  return response.data;
}

export async function confirmAppointment(id) {
  const response = await api.patch(`/api/appointments/${id}/confirm`);
  return response.data;
}

export async function cancelAppointment(id, cancelReason) {
  const response = await api.patch(`/api/appointments/${id}/cancel`, { cancelReason });
  return response.data;
}

export async function completeAppointment(id, observations) {
  const response = await api.patch(`/api/appointments/${id}/complete`, { observations: observations || null });
  return response.data;
}

export async function markNoShow(id) {
  const response = await api.patch(`/api/appointments/${id}/no-show`);
  return response.data;
}