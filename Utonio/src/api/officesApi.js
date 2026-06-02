import api from './AxiosConfig';

export async function getOffices() {
  const response = await api.get('/api/offices');
  return response.data;
}

export async function createOffice(data) {
  const response = await api.post('/api/offices', data);
  return response.data;
}

export async function updateOffice(id, data) {
  const response = await api.patch(`/api/offices/${id}`, data);
  return response.data;
}