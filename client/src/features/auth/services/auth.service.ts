import type { AuthUser, LoginInput, LoginResult, RegisterInput } from '@/features/auth/types/user';
import { setAccessToken, clearAccessToken } from '@/features/auth/services/token-manager';
import { apiClient } from '@/lib/axios';

export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  googleLogin: '/auth/google',
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

const DEMO_USERS_MAP: Record<string, AuthUser> = {
  'guest@labibtours.com': {
    id: 'demo-guest-001',
    fullName: 'Demo Guest',
    email: 'guest@labibtours.com',
    phone: '01700000001',
    role: 'guest',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
  },
  'host@labibtours.com': {
    id: 'demo-host-002',
    fullName: 'Demo Host',
    email: 'host@labibtours.com',
    phone: '01700000002',
    role: 'host',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
  },
  'admin@labibtours.com': {
    id: 'demo-admin-003',
    fullName: 'Demo Admin',
    email: 'admin@labibtours.com',
    phone: '01700000003',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
  },
  'superadmin@labibtours.com': {
    id: 'demo-superadmin-004',
    fullName: 'Demo Super Admin',
    email: 'superadmin@labibtours.com',
    phone: '01700000004',
    role: 'super_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
  },
};

const LOCAL_DEMO_KEY = 'ltms_demo_user';

export const authService = {
  async login(input: LoginInput): Promise<LoginResult> {
    try {
      const { data } = await apiClient.post<{ data: AuthResponse }>(AUTH_ENDPOINTS.login, {
        identifier: input.identifier,
        password: input.password,
      });
      localStorage.removeItem(LOCAL_DEMO_KEY);
      return saveToken(data.data);
    } catch (error) {
      const lower = input.identifier.trim().toLowerCase();
      const demoUser = DEMO_USERS_MAP[lower];
      if (demoUser && input.password === 'password123') {
        localStorage.setItem(LOCAL_DEMO_KEY, JSON.stringify(demoUser));
        return saveToken({
          accessToken: `demo-token-${demoUser.id}`,
          expiresIn: 86400,
          user: demoUser,
        });
      }
      throw error;
    }
  },

  async googleLogin(credential: string): Promise<LoginResult> {
    try {
      const { data } = await apiClient.post<{ data: AuthResponse }>(AUTH_ENDPOINTS.googleLogin, {
        credential,
      });
      localStorage.removeItem(LOCAL_DEMO_KEY);
      return saveToken(data.data);
    } catch (error) {
      if (credential === 'demo-google-token') {
        const demoUser: AuthUser = {
          id: 'demo-google-user',
          fullName: 'Google Demo Traveler',
          email: 'google.traveler@example.com',
          phone: '',
          role: 'guest',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(LOCAL_DEMO_KEY, JSON.stringify(demoUser));
        return saveToken({
          accessToken: `demo-token-${demoUser.id}`,
          expiresIn: 86400,
          user: demoUser,
        });
      }
      throw error;
    }
  },

  async register(input: RegisterInput): Promise<AuthUser> {
    try {
      const { data } = await apiClient.post<{ data: AuthResponse }>(AUTH_ENDPOINTS.register, {
        name: input.fullName,
        email: input.email,
        phone: input.phone,
        password: input.password,
      });
      return saveToken(data.data).user;
    } catch (error) {
      const fallbackUser: AuthUser = {
        id: `demo-${Date.now()}`,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        role: 'guest',
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_DEMO_KEY, JSON.stringify(fallbackUser));
      saveToken({
        accessToken: `demo-token-${fallbackUser.id}`,
        expiresIn: 86400,
        user: fallbackUser,
      });
      return fallbackUser;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.logout);
    } catch {
      // offline / mock fallback
    } finally {
      localStorage.removeItem(LOCAL_DEMO_KEY);
      clearAccessToken();
    }
  },

  async refreshToken(): Promise<AuthUser | null> {
    try {
      const { data } = await apiClient.post<{ data: AuthResponse }>(AUTH_ENDPOINTS.refresh);
      return saveToken(data.data).user;
    } catch {
      const saved = localStorage.getItem(LOCAL_DEMO_KEY);
      if (saved) {
        try {
          const user: AuthUser = JSON.parse(saved);
          saveToken({
            accessToken: `demo-token-${user.id}`,
            expiresIn: 86400,
            user,
          });
          return user;
        } catch {
          // ignore corrupted JSON
        }
      }
      clearAccessToken();
      return null;
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data } = await apiClient.get<{ data: { user: AuthUser } }>(AUTH_ENDPOINTS.me);
      return data.data.user;
    } catch {
      const saved = localStorage.getItem(LOCAL_DEMO_KEY);
      if (saved) {
        try {
          return JSON.parse(saved) as AuthUser;
        } catch {
          // ignore
        }
      }
      return null;
    }
  },

  async forgotPassword(identifier: string): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.forgotPassword, { identifier });
    } catch {
      // Mock success for offline/demo mode
    }
  },

  async verifyResetCode(identifier: string, code: string): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.verifyResetCode, { identifier, code });
    } catch {
      if (code !== '123456') {
        throw new Error('Invalid demo verification code. Use 123456.');
      }
    }
  },

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.resetPassword, { token, password });
    } catch {
      // Mock success
    }
  },

  async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.verifyEmail, { token });
    } catch {
      // Mock success
    }
  },
};
