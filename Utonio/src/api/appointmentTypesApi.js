import api from './AxiosConfig';

export async function getAppointmentTypes() {
  const response = await api.get('/api/appointment-types');
  return response.data;
}

export async function createAppointmentType(data) {
  const response = await api.post('/api/appointment-types', data);
  return response.data;
}