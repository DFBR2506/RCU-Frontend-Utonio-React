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
  if (doctorData.firstName !== undefined) payload.firstName = doctorData.firstName;
  if (doctorData.lastName !== undefined) payload.lastName = doctorData.lastName;
  if (doctorData.email !== undefined) payload.email = doctorData.email;
  if (doctorData.phone !== undefined) payload.phone = doctorData.phone;
  if (doctorData.documentType !== undefined) payload.documentType = doctorData.documentType;
  if (doctorData.documentNumber !== undefined) payload.documentNumber = doctorData.documentNumber;
  if (doctorData.gender !== undefined) payload.gender = doctorData.gender;
  if (doctorData.licenseNumber !== undefined) payload.licenseNumber = doctorData.licenseNumber;
  if (doctorData.specialtyId !== undefined) payload.specialtyId = doctorData.specialtyId;
  if (doctorData.active !== undefined) payload.active = doctorData.active;
  const response = await api.patch(`/api/doctors/${id}`, payload);
  return response.data;
}