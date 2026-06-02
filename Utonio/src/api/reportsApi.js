import api from './AxiosConfig';

export async function getOfficeOccupancy(from, to) {
  const response = await api.get('/api/reports/office-occupancy', { params: { from, to } });
  return response.data;
}

export async function getDoctorProductivity() {
  const response = await api.get('/api/reports/doctor-productivity');
  return response.data;
}

export async function getNoShowPatients(from, to) {
  const response = await api.get('/api/reports/no-show-patients', { params: { from, to } });
  return response.data;
}