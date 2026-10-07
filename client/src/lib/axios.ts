import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { getAccessToken, clearAccessToken } from '@/features/auth/services/token-manager';

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
  withCredentials: true, // send the httpOnly refresh-token cookie automatically on every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------
// Request interceptor — attach the in-memory access token.
// ---------------------------------------------------------------------
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------
// Response interceptor — 401 handling + automatic token refresh.
//
// On a 401, exactly one refresh request is made no matter how many
// requests failed at once (a page can easily fire several API calls in
// parallel, all hitting an expired token together). Every other failed
// request queues behind that single refresh and retries once it
// resolves, instead of each one independently hammering the refresh
// endpoint. If the refresh itself fails, the access token is cleared
// and every queued request rejects — `onSessionExpired` (registered by
// AuthProvider) then handles the user-facing side: clearing app state
// and redirecting to /login.
// ---------------------------------------------------------------------
type QueuedRequest = { resolve: (token: string | null) => void; reject: (error: unknown) => void };

let isRefreshing = false;
let refreshQueue: QueuedRequest[] = [];

function flushQueue(error: unknown, token: string | null) {
  refreshQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  refreshQueue = [];
}

/**
 * AuthProvider registers its own refresh + session-expired handlers here
 * at app startup, rather than this module importing AuthProvider
 * directly — importing React context from a plain HTTP module would
 * create a circular dependency (AuthProvider needs apiClient indirectly
 * via authService; this file would need AuthProvider back).
 */
let performTokenRefresh: (() => Promise<string | null>) | null = null;
let onSessionExpired: (() => void) | null = null;

export function registerAuthInterceptorHandlers(handlers: {
  refresh: () => Promise<string | null>;
  onSessionExpired: () => void;
}): void {
  performTokenRefresh = handlers.refresh;
  onSessionExpired = handlers.onSessionExpired;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    const isUnauthorized = error.response?.status === 401;
    // Endpoints that should NEVER trigger a refresh on 401:
    // - Login: Invalid credentials
    // - Refresh: Invalid/expired refresh cookie itself (avoids loop)
    // - Register / Password reset
    const isNonRefreshableAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/forgot-password') ||
      originalRequest?.url?.includes('/auth/reset-password') ||
      originalRequest?.url?.includes('/auth/verify-reset-code');

    if (
      !isUnauthorized ||
      !originalRequest ||
      originalRequest._retry ||
      isNonRefreshableAuthEndpoint ||
      !performTokenRefresh
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // A refresh is already in flight — queue behind it instead of starting another.
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            if (token && originalRequest.headers)
              originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await performTokenRefresh();
      isRefreshing = false;
      flushQueue(null, newToken);

      if (!newToken) {
        onSessionExpired?.();
        return Promise.reject(error);
      }

      if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      flushQueue(refreshError, null);
      clearAccessToken();
      onSessionExpired?.();
      return Promise.reject(refreshError);
    }
  },
);

/**
 * Standard utility to parse error messages from Axios responses or network failures.
 */
export function extractApiErrorMessage(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred',
): string {
  if (axios.isAxiosError(error)) {
    const responseBody = error.response?.data as
      { message?: string; error?: { message?: string } } | undefined;
    const serverMessage = responseBody?.error?.message ?? responseBody?.message;
    if (serverMessage) return serverMessage;
    if (error.code === 'ERR_NETWORK')
      return 'Unable to connect to the server. Please check your network connection.';
    if (error.response?.status === 403) return 'You do not have permission to perform this action.';
    if (error.response?.status === 404) return 'Requested resource not found.';
    if (error.response?.status && error.response.status >= 500)
      return 'Server error. Please try again later.';
  }
  if (error instanceof Error) return error.message;
  return fallbackMessage;
}
