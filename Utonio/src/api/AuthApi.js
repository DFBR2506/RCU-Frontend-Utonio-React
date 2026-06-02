import api from './AxiosConfig';

export async function loginRequest(credentials) {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
}

export async function registerRequest(userData) {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
}