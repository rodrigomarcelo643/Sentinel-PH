import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
