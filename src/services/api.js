import axios from 'axios';

// Backend bạn của bạn chạy ở cổng 8000 (theo docker-compose.yml)
const BASE_URL = 'http://127.0.0.1:8000/api/v1'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động thêm Token vào mỗi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    // Backend bạn của bạn dùng "Bearer <token>"
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi (Ví dụ: Hết hạn token thì đá ra login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;