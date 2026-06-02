import api from './AxiosConfig';

export async function getSpecialties() {
  const response = await api.get('/api/specialties');
  return response.data;
}

export async function createSpecialty(specialtyData) {
  const response = await api.post('/api/specialties', specialtyData);
  return response.data;
}