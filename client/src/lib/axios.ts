import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';

/**
 * Single Axios instance for the whole app.
 *
 * Why one instance: consistent base URL, timeout, and interceptor behavior
 * (auth token attachment, 401 refresh-token flow, error normalization) in
 * one place instead of re-implementing it per feature/service file.
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  withCredentials: true, // send httpOnly refresh-token cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Centralized error normalization hook.
    // Auth refresh-token interceptor will be added in the Authentication phase.
    return Promise.reject(error);
  },
);
