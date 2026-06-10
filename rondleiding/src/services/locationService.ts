import { api, unwrapResponseData } from './api';
import type { Location } from '../types';

function normalize(data: any): Location {
  return {
    id: String(data.id),
    name: data.name ?? '',
    description: data.description ?? '',
    // We behouden de checks op verschillende schrijfwijzen voor de robuustheid,
    // maar zonder de logs.
    imageUrl: data.imageUrl ?? data.image_url ?? data.imageURL ?? '',
    floor: data.floor ?? '',
    buildingId: data.buildingId ? String(data.buildingId) : undefined,
    buildingName: data.buildingName ?? data.building?.name ?? '',
  };
}

export const locationService = {
  async getAll(): Promise<Location[]> {
    const response = await api.get('/api/location');
    const wrappedData = unwrapResponseData<any[]>(response.data);
    const data = wrappedData ?? [];
    return data.map(normalize);
  },

  async create(payload: Omit<Location, 'id' | 'buildingName'>): Promise<Location> {
    const response = await api.post('/api/location', payload);
    return normalize(unwrapResponseData<any>(response.data));
  },

  async update(id: string, payload: Omit<Location, 'id' | 'buildingName'>): Promise<Location> {
    const response = await api.put(`/api/location/${id}`, payload);
    return normalize(unwrapResponseData<any>(response.data));
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/location/${id}`);
  },
};