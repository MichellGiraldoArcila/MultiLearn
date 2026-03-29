import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    const isAuthLogin =
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/login/') ||
      url.endsWith('/api/auth/login');
    const isAuthRegister =
      url.includes('/api/auth/register') || url.includes('/api/auth/register/');
    const isAuthRefresh =
      url.includes('/api/auth/refresh') || url.includes('/api/auth/refresh/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthLogin && !isAuthRegister && !isAuthRefresh) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const base = baseURL || window.location.origin;
          // Importante: sin "/" final para evitar redirect en POST
          const { data } = await axios.post(`${base}/api/auth/refresh`, {
            refresh,
          });
          localStorage.setItem('access_token', data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (email, password) =>
    // Importante: sin "/" final para evitar redirect en POST
    api.post('/api/auth/login', { email, password }),
  register: (body) => api.post('/api/auth/register', body),
  me: () => api.get('/api/auth/me'),
  changePassword: (payload) => api.post('/api/auth/change-password', payload),
  resetPassword: (payload) => api.post('/api/auth/reset-password', payload),
};

export const courses = {
  list: (params) => api.get('/api/courses/', { params }),
  detail: (id) => api.get(`/api/courses/${id}/`),
};

export const search = {
  query: (q, params = {}) =>
    api.get('/api/search/', { params: { q, ...params } }),
};

export const favorites = {
  list: () => api.get('/api/favorites/'),
  // El backend espera course_id (entrada) pero responde con course completo.
  add: (courseId) => api.post('/api/favorites/', { course_id: courseId }),
  remove: (favoriteId) => api.delete(`/api/favorites/${favoriteId}/`),
};

export const recommendations = {
  list: () => api.get('/api/recommendations/'),
};

export const interactions = {
  create: (courseId, interactionType) =>
    api.post('/api/interactions/', {
      course: courseId,
      interaction_type: interactionType,
    }),
};

export default api;
