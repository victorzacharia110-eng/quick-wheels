import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.quickwheel.online/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "Cache-Control": "no-cache",
  },
  withCredentials: false,
  validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Cache-bust GET requests
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      import('@/stores/auth').then(({ useAuthStore }) => {
        const authStore = useAuthStore();
        authStore.clearUser();
      });
      const path = window.location.pathname;
      if (path !== '/auth/login' && path !== '/auth/register') {
        import('@/router').then(({ default: router }) => {
          router.push('/auth/login');
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;