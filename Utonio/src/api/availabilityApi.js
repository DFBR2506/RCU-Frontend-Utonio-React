import api from './AxiosConfig';

export async function getAvailableSlots(doctorId, date) {
  const response = await api.get(`/api/availability/doctors/${doctorId}`, { params: { date } });
  return response.data;
}

export async function getAvailableSlotsForType(doctorId, appointmentTypeId, date) {
  const response = await api.get(
    `/api/availability/doctors/${doctorId}/appointment-types/${appointmentTypeId}`,
    { params: { date } }
  );
  return response.data;
}