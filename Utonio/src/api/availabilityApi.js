import api from './AxiosConfig';

export async function getAvailableSlots(doctorId, officeId, date) {
  const response = await api.get(`/api/doctors/${doctorId}/availability`, { params: { officeId, date } });
  return response.data;
}