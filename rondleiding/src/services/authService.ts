import { api, REFRESH_STORAGE_KEY, TOKEN_STORAGE_KEY, unwrapResponseData } from './api';
import type { LoginRequest } from '../types';

interface LoginResponseShape {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}

function tokenFromPayload(data: LoginResponseShape): string | null {
  return data.token ?? data.accessToken ?? null;
}

export const authService = {
  async login(payload: LoginRequest): Promise<{ token: string; refreshToken?: string }> {
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

    return { token, refreshToken: data.refreshToken };
  },

  logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_STORAGE_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
