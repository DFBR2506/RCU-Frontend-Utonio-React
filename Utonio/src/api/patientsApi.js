import api from './AxiosConfig';

export async function getPatients(page = 0, size = 10) {
  const response = await api.get('/api/patients', {
    params: { page, size, sort: 'createdAt,desc' },
  });
  return response.data;
}

export async function getPatientById(id) {
  const response = await api.get(`/api/patients/${id}`);
  return response.data;
}

export async function createPatient(patientData) {
  const response = await api.post('/api/patients', patientData);
  return response.data;
}

export async function updatePatient(id, patientData) {
  const payload = {};
  if (patientData.fullName !== undefined) payload.fullName = patientData.fullName;
  if (patientData.email !== undefined) payload.email = patientData.email;
  if (patientData.phoneNumber !== undefined) payload.phoneNumber = patientData.phoneNumber;
  if (patientData.status !== undefined) payload.status = patientData.status;
  const response = await api.patch(`/api/patients/${id}`, payload);
  return response.data;
}