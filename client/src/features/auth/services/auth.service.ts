import type { AuthUser, LoginInput, LoginResult, RegisterInput } from '@/features/auth/types/user';
import { setAccessToken, clearAccessToken } from '@/features/auth/services/token-manager';
import { apiClient } from '@/lib/axios';

export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  me: '/auth/me',
  forgotPassword: '/auth/forgot-password',
  verifyResetCode: '/auth/verify-reset-code',
  resetPassword: '/auth/reset-password',
  verifyEmail: '/auth/verify-email',
} as const;

interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

function saveToken(result: AuthResponse) {
  const tokens = {
    accessToken: result.accessToken,
    expiresAt: Date.now() + result.expiresIn * 1000,
  };
  setAccessToken(tokens);
  return { user: result.user, tokens };
}

export const authService = {
  async login(input: LoginInput): Promise<LoginResult> {
    const { data } = await apiClient.post<{ data: AuthResponse }>(AUTH_ENDPOINTS.login, {
      identifier: input.identifier,
      password: input.password,
    });
    return saveToken(data.data);
  },

  async register(input: RegisterInput): Promise<AuthUser> {
    const { data } = await apiClient.post<{ data: AuthResponse }>(AUTH_ENDPOINTS.register, {
      name: input.fullName,
      email: input.email,
      phone: input.phone,
      password: input.password,
    });
    return saveToken(data.data).user;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.logout);
    } finally {
      clearAccessToken();
    }
  },

  async refreshToken(): Promise<AuthUser | null> {
    try {
      const { data } = await apiClient.post<{ data: AuthResponse }>(AUTH_ENDPOINTS.refresh);
      return saveToken(data.data).user;
    } catch {
      clearAccessToken();
      return null;
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data } = await apiClient.get<{ data: { user: AuthUser } }>(AUTH_ENDPOINTS.me);
    return data.data.user;
  },

  async forgotPassword(identifier: string): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.forgotPassword, { identifier });
  },

  async verifyResetCode(identifier: string, code: string): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.verifyResetCode, { identifier, code });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.resetPassword, { token, password });
  },

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.verifyEmail, { token });
  },
};
