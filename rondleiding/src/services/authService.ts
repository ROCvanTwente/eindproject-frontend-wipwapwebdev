import { api, REFRESH_STORAGE_KEY, TOKEN_STORAGE_KEY, unwrapResponseData } from './api';
import type { LoginRequest } from '../types';
import { decodeJwt } from '../utils/jwtUtils';

interface LoginResponseShape {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  requiresPasswordChange?: boolean;
  email?: string;
  user?: {
    email?: string;
  };
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

function tokenFromPayload(data: LoginResponseShape): string | null {
  return data.token ?? data.accessToken ?? null;
}

export const authService = {
  async login(
    payload: LoginRequest,
  ): Promise<{ token: string; refreshToken?: string; requiresPasswordChange: boolean; email?: string }> {
    const response = await api.post('/api/auth/login', payload);
    const data = unwrapResponseData<LoginResponseShape>(response.data);
    const token = tokenFromPayload(data);

    if (!token) {
      throw new Error('Geen geldig token ontvangen.');
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    if (data.refreshToken) {
      localStorage.setItem(REFRESH_STORAGE_KEY, data.refreshToken);
    }

    // Decode the JWT to get the PasswordChanged claim
    const decoded = decodeJwt(token);
    const requiresPasswordChange = String(decoded?.PasswordChanged).toLowerCase() === 'false';

    return {
      token,
      refreshToken: data.refreshToken,
      requiresPasswordChange,
      email: data.email ?? data.user?.email ?? payload.email,
    };
  },

  logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_STORAGE_KEY);
  },

  async changePassword(payload: ChangePasswordPayload) {
    await api.post('/api/auth/change-password', payload);
  },

  getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
