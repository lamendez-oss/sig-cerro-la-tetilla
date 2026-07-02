// Cliente Axios con token JWT automático
// En desarrollo local usa el proxy de Vite ("/api" -> localhost:4000, ver vite.config.ts).
// En producción (Vercel) usa la URL pública del backend, definida en VITE_API_URL.
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
