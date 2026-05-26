import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { TourPoint } from '../components/types';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-de4538b5`;

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error || 'API request failed' };
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export const tourPointsAPI = {
  // Get all tour points
  getAll: async (): Promise<{ data: TourPoint[] | null; error: string | null }> => {
    return fetchAPI<TourPoint[]>('/tour-points');
  },

  // Get single tour point
  getById: async (id: string): Promise<{ data: TourPoint | null; error: string | null }> => {
    return fetchAPI<TourPoint>(`/tour-points/${id}`);
  },

  // Create new tour point
  create: async (tourPoint: TourPoint): Promise<{ data: TourPoint | null; error: string | null }> => {
    return fetchAPI<TourPoint>('/tour-points', {
      method: 'POST',
      body: JSON.stringify({ tourPoint }),
    });
  },

  // Update existing tour point
  update: async (id: string, tourPoint: TourPoint): Promise<{ data: TourPoint | null; error: string | null }> => {
    return fetchAPI<TourPoint>(`/tour-points/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ tourPoint }),
    });
  },

  // Delete tour point
  delete: async (id: string): Promise<{ data: { id: string } | null; error: string | null }> => {
    return fetchAPI<{ id: string }>(`/tour-points/${id}`, {
      method: 'DELETE',
    });
  },
};
