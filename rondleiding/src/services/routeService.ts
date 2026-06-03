import { api, unwrapResponseData } from './api';
import type { GuideRoute, RoutePayload, RouteLocation } from '../types';

function normalizeLocations(items: any[] | undefined): RouteLocation[] {
  if (!items) {
    return [];
  }

  return items
    .map((item, index) => ({
      id: item.id ? String(item.id) : undefined,
      locationId: String(item.locationId ?? item.location?.id ?? ''),
      locationName: item.locationName ?? item.location?.name ?? '',
      locationDescription: item.locationDescription ?? item.location?.description ?? '',
      order: Number(item.order ?? index),
      direction: item.direction ?? '',
      estimatedMinutes: item.estimatedMinutes ? Number(item.estimatedMinutes) : undefined,
    }))
    .sort((a, b) => a.order - b.order);
}

function normalize(data: any): GuideRoute {
  return {
    id: String(data.id),
    name: data.name ?? '',
    description: data.description ?? '',
    estimatedTimeMinutes: Number(data.estimatedTimeMinutes ?? data.estimatedMinutes ?? 0),
    difficulty: data.difficulty ?? 'Easy',
    locations: normalizeLocations(data.locations ?? data.routeLocations),
  };
}

export const routeService = {
  async getAll(): Promise<GuideRoute[]> {
    const response = await api.get('/api/routes');
    const data = unwrapResponseData<any[]>(response.data) ?? [];
    return data.map(normalize);
  },

  async getById(id: string): Promise<GuideRoute> {
    const response = await api.get(`/api/routes/${id}`);
    return normalize(unwrapResponseData<any>(response.data));
  },

  async create(payload: RoutePayload): Promise<GuideRoute> {
    const response = await api.post('/api/routes', payload);
    return normalize(unwrapResponseData<any>(response.data));
  },

  async update(id: string, payload: RoutePayload): Promise<GuideRoute> {
    const response = await api.put(`/api/routes/${id}`, payload);
    return normalize(unwrapResponseData<any>(response.data));
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/routes/${id}`);
  },
};
