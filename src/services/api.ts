import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const healthRecordsApi = {
  getAll: () => api.get('/health-records'),
  getStats: () => api.get('/health-records/stats')
};

export const prescriptionsApi = {
  getAll: () => api.get('/prescriptions'),
  downloadPDF: (id: string) => api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' })
};

export const appointmentsApi = {
  getAll: () => api.get('/appointments'),
  getUpcoming: () => api.get('/appointments/upcoming'),
  create: (data: any) => api.post('/appointments', data),
  update: (id: string, data: any) => api.patch(`/appointments/${id}`, data)
};

export const doctorsApi = {
  getAll: () => api.get('/doctors'),
  search: (query: string) => api.get(`/doctors/search?q=${query}`)
};

export const symptomCheckerApi = {
  check: (symptoms: string) => api.post('/symptom-checker', { symptoms })
};

export default api;