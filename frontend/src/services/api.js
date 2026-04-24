import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Una sola petición de refresh en vuelo (evita tormentas de 401). */
let refreshPromise = null;

function clearAuthAndGoToLogin() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.assign('/login');
}

function getRequestUrl(config) {
  if (!config?.url) return '';
  const raw = config.url;
  if (raw.startsWith('http')) {
    try {
      return new URL(raw).pathname;
    } catch {
      return raw;
    }
  }
  return raw;
}

function isAuthBypassUrl(config) {
  const path = getRequestUrl(config);
  return (
    path.includes('/api/auth/login') ||
    path.includes('/api/auth/register') ||
    path.includes('/api/auth/refresh')
  );
}

function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) {
    clearAuthAndGoToLogin();
    return Promise.reject(new Error('Sin refresh token'));
  }

  const absoluteBase = baseURL || `${window.location.protocol}//${window.location.host}`;

  refreshPromise = axios
    .post(`${absoluteBase.replace(/\/$/, '')}/api/auth/refresh`, { refresh })
    .then(({ data }) => {
      const access = data?.access;
      if (!access) {
        throw new Error('Respuesta de refresh sin access token');
      }
      localStorage.setItem('access_token', access);
      return access;
    })
    .catch((err) => {
      clearAuthAndGoToLogin();
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

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
    const status = error.response?.status;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthBypassUrl(originalRequest)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const access = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${access}`;
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export const auth = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  register: (body) => api.post('/api/auth/register', body),
  me: () => api.get('/api/auth/me'),
  updateMe: (body) => api.patch('/api/auth/me', body),
  adminStatus: () => api.get('/api/auth/admin-status'),
  changePassword: (payload) => api.post('/api/auth/change-password', payload),
  resetPassword: (payload) => api.post('/api/auth/reset-password', payload),
};

export const courses = {
  list: (params) => api.get('/api/courses/', { params }),
  detail: (id) => api.get(`/api/courses/${id}/`),
};

export const adminCourses = {
  list: (params) => api.get('/api/admin/courses/', { params }),
  detail: (id) => api.get(`/api/admin/courses/${id}/`),
  create: (body) => api.post('/api/admin/courses/', body),
  update: (id, body) => api.patch(`/api/admin/courses/${id}/`, body),
  remove: (id) => api.delete(`/api/admin/courses/${id}/`),
};

export const search = {
  query: (q, params = {}) =>
    api.get('/api/search/', { params: { q, ...params } }),
};

export const favorites = {
  list: () => api.get('/api/favorites/'),
  add: (courseId) => api.post('/api/favorites/', { course_id: courseId }),
  remove: (favoriteId) => api.delete(`/api/favorites/${favoriteId}/`),
};

export const recommendations = {
  list: () => api.get('/api/recommendations/'),
  roadmap: () => api.get('/api/recommendations/roadmap/'),
};

export const interactions = {
  create: (courseId, interactionType) =>
    api.post('/api/interactions/', {
      course: courseId,
      interaction_type: interactionType,
    }),
};

export default api;
