import api from './AxiosConfig';

export async function getDoctors(page = 0, size = 10) {
  const response = await api.get('/api/doctors', {
    params: { page, size, sort: 'createdAt,asc' },
  });
  return response.data;
}

export async function createDoctor(doctorData) {
  const response = await api.post('/api/doctors', doctorData);
  return response.data;
}

export async function updateDoctor(id, doctorData) {
  const payload = {};
  if (doctorData.fullName !== undefined) payload.fullName = doctorData.fullName;
  if (doctorData.email !== undefined) payload.email = doctorData.email;
  if (doctorData.specialtyId !== undefined) payload.specialtyId = doctorData.specialtyId;
  if (doctorData.status !== undefined) payload.status = doctorData.status;
  const response = await api.patch(`/api/doctors/${id}`, payload);
  return response.data;
}