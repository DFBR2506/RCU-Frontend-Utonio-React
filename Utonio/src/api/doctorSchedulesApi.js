import api from './AxiosConfig';

export async function getDoctorSchedules(doctorId) {
  const response = await api.get(`/api/doctors/${doctorId}/schedules`, { params: { page: 0, size: 50 } });
  return response.data?.content ?? [];
}

export async function createDoctorSchedule(doctorId, data) {
  const response = await api.post(`/api/doctors/${doctorId}/schedules`, data);
  return response.data;
}
