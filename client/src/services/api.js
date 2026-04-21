import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.includes('/auth/');
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  save: (data) => api.post('/profile', data),
  updateWeight: (weight) => api.patch('/profile/weight', { weight }),
};

// Coach / AI Chat
export const coachAPI = {
  sendMessage: (message, messageType) => api.post('/coach/chat', { message, messageType }),
  getHistory: () => api.get('/coach/chat'),
  clearChat: () => api.delete('/coach/chat'),
  getMotivation: () => api.get('/coach/motivate'),
  getBriefing: () => api.get('/coach/briefing'),
};

// Training
export const trainingAPI = {
  generate: () => api.post('/training/generate'),
  getActive: () => api.get('/training/active'),
  getToday: () => api.get('/training/today'),
  markComplete: (day) => api.patch(`/training/complete/${day}`),
};

// Nutrition
export const nutritionAPI = {
  generate: () => api.post('/nutrition/generate'),
  getActive: () => api.get('/nutrition/active'),
  getToday: () => api.get('/nutrition/today'),
};

// Daily Logs
export const logsAPI = {
  getToday: () => api.get('/logs/today'),
  getWeek: () => api.get('/logs/week'),
  logFood: (data) => api.post('/logs/food', data),
  removeFood: (id) => api.delete(`/logs/food/${id}`),
  logSleep: (data) => api.post('/logs/sleep', data),
  logMental: (data) => api.post('/logs/mental', data),
  logWorkout: (data) => api.post('/logs/workout', data),
  logWater: (glasses) => api.post('/logs/water', { glasses }),
  analyzePhoto: (file) => {
    const fd = new FormData();
    fd.append('photo', file);
    return api.post('/logs/analyze-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// Reports
export const reportsAPI = {
  generate: () => api.post('/reports/weekly'),
  getAll: () => api.get('/reports'),
  getLatest: () => api.get('/reports/latest'),
};

// Checklist
export const checklistAPI = {
  getToday: () => api.get('/checklist/today'),
  submit: () => api.post('/checklist/submit'),
};

// Progress Photos
export const progressAPI = {
  upload: (formData) => api.post('/progress/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: () => api.get('/progress/photos'),
};
