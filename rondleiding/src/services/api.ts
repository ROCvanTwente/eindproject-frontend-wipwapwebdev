import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7003';

export const TOKEN_STORAGE_KEY = 'school-guide-auth-token';
export const REFRESH_STORAGE_KEY = 'school-guide-refresh-token';

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function getAccessToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_STORAGE_KEY);
}

function extractToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const obj = payload as Record<string, unknown>;
  const value = obj.token ?? obj.accessToken ?? obj.jwtToken;
  return typeof value === 'string' ? value : null;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = getRefreshToken() ?? getAccessToken();
    if (!refreshToken) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_STORAGE_KEY);
      return Promise.reject(error);
    }

    try {
      const refreshResponse = await refreshClient.post('/api/auth/refresh-token', {
        refreshToken,
      });

      const nextToken = extractToken(refreshResponse.data);
      if (!nextToken) {
        throw new Error('No token returned from refresh endpoint');
      }

      const nextRefreshToken =
        typeof (refreshResponse.data as Record<string, unknown>)?.refreshToken === 'string'
          ? ((refreshResponse.data as Record<string, unknown>).refreshToken as string)
          : refreshToken;

      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      localStorage.setItem(REFRESH_STORAGE_KEY, nextRefreshToken);

      originalRequest.headers.Authorization = 'Bearer ' + nextToken;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_STORAGE_KEY);
      return Promise.reject(refreshError);
    }
  },
);

export function unwrapResponseData<T>(data: unknown): T {
  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return (data as { data: T }).data;
  }

  return data as T;
}
