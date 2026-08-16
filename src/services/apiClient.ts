import axios from 'axios';
import { secureStorage } from '../utils/storage';

const API_BASE_URL = 'https://api.myquro-restaurant.com/v1'; // Replace with actual production endpoint

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await secureStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await secureStorage.removeItem('auth_token');
      // Potential redirect or broadcast event for unauthorized access
    }
    return Promise.reject(error);
  }
);

export default apiClient;
