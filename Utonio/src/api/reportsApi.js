import api from './AxiosConfig';

function toInstant(dateStr) {
  return `${dateStr}T00:00:00Z`;
}

export async function getOfficeOccupancy(from, to) {
  const response = await api.get('/api/reports/office-occupancy', {
    params: { startDate: toInstant(from), endDate: toInstant(to) },
  });
  return response.data?.content ?? [];
}

export async function getDoctorProductivity() {
  const response = await api.get('/api/reports/doctor-productivity');
  return response.data?.content ?? [];
}

export async function getNoShowPatients(from, to) {
  const response = await api.get('/api/reports/no-show-patients', {
    params: { startDate: toInstant(from), endDate: toInstant(to) },
  });
  return response.data?.content ?? [];
}