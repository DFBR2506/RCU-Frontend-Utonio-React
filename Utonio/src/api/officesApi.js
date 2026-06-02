import api from './AxiosConfig';

export async function getOffices() {
  const response = await api.get('/api/offices');
  return response.data;
}