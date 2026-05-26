import { api, unwrapResponseData } from './api';
import type { Building } from '../types';

function normalize(data: any): Building {
  return {
    id: String(data.id),
    name: data.name ?? '',
    description: data.description ?? '',
    address: data.address ?? '',
  };
}

export const buildingService = {
  async getAll(): Promise<Building[]> {
    const response = await api.get('/api/building');
    const data = unwrapResponseData<any[]>(response.data) ?? [];
    return data.map(normalize);
  },

  async create(payload: Omit<Building, 'id'>): Promise<Building> {
    const response = await api.post('/api/building', payload);
    return normalize(unwrapResponseData<any>(response.data));
  },

  async update(id: string, payload: Omit<Building, 'id'>): Promise<Building> {
    const response = await api.put(`/api/building/${id}`, payload);
    return normalize(unwrapResponseData<any>(response.data));
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/building/${id}`);
  },
};
