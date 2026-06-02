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
  if (patientData.firstName !== undefined) payload.firstName = patientData.firstName;
  if (patientData.lastName !== undefined) payload.lastName = patientData.lastName;
  if (patientData.email !== undefined) payload.email = patientData.email;
  if (patientData.phone !== undefined) payload.phone = patientData.phone;
  if (patientData.documentType !== undefined) payload.documentType = patientData.documentType;
  if (patientData.documentNumber !== undefined) payload.documentNumber = patientData.documentNumber;
  if (patientData.gender !== undefined) payload.gender = patientData.gender;
  if (patientData.active !== undefined) payload.active = patientData.active;
  const response = await api.patch(`/api/patients/${id}`, payload);
  return response.data;
}