import type { TourPoint } from '../components/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: (errorData as any)?.error || response.statusText || 'API request failed' };
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<{ data: AuthResponse | null; error: string | null }> => {
    return fetchAPI<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

export const tourPointsAPI = {
  // ASP.NET MVC controller endpoint routes
  getAll: async (): Promise<{ data: TourPoint[] | null; error: string | null }> => {
    return fetchAPI<TourPoint[]>('/TourPoints');
  },

  getById: async (id: string): Promise<{ data: TourPoint | null; error: string | null }> => {
    return fetchAPI<TourPoint>(`/TourPoints/${id}`);
  },

  create: async (tourPoint: TourPoint): Promise<{ data: TourPoint | null; error: string | null }> => {
    return fetchAPI<TourPoint>('/TourPoints', {
      method: 'POST',
      body: JSON.stringify(tourPoint),
    });
  },

  update: async (id: string, tourPoint: TourPoint): Promise<{ data: TourPoint | null; error: string | null }> => {
    return fetchAPI<TourPoint>(`/TourPoints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tourPoint),
    });
  },

  delete: async (id: string): Promise<{ data: { id: string } | null; error: string | null }> => {
    return fetchAPI<{ id: string }>(`/TourPoints/${id}`, {
      method: 'DELETE',
    });
  },
};
