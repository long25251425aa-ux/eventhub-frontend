import axios from 'axios';

const api = axios.create({
  baseURL: 'https://eventhub-backend-785a.onrender.com/api',
  timeout: 10000,
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('eh_token');
  if (token) cfg.headers.Authorization = 'Bearer ' + token;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('eh_token');
      localStorage.removeItem('eh_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;


