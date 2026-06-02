import api from './AxiosConfig';

export async function getDashboardStats(date) {
  const response = await api.get('/api/dashboard', { params: { date } });
  return response.data;
}