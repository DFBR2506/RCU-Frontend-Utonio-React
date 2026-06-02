import api from './AxiosConfig';

export async function registerUser(payload) {
  await api.post('/api/auth/register', payload);
}