import { api, unwrapResponseData } from './api';
import type { Location } from '../types';

// Hulpfunctie om te checken of een string een Base64 afbeelding is (nu veilig voor undefined)
function isBase64Image(str: string | undefined | null): boolean {
    if (!str) return false;
    return str.startsWith('data:image/');
}

function normalize(data: any): Location {
  // DEBUG LOG 3: Wat geeft de backend terug NA een actie?
  if (data) {
    console.log(`[Service Normalize] Data van backend voor ${data.name || 'onbekend'}:`, {
        id: data.id,
        name: data.name,
        hasImageUrlInResponse: isBase64Image(data.imageUrl),
        imageUrlLength: data.imageUrl?.length || 0,
        // Check ook op andere mogelijke schrijfwijzen
        hasImage_Url: isBase64Image(data.image_url), 
        hasImageURL: isBase64Image(data.imageURL)
    });
  }

  return {
    id: String(data.id),
    name: data.name ?? '',
    description: data.description ?? '',
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
    // DEBUG LOG 1: Wat sturen we op bij CREATE? (Veilig gemaakt met optional chaining)
    console.log("[Service Create] Payload die naar backend gaat:", {
        ...payload,
        imageUrl: isBase64Image(payload.imageUrl) 
            ? `JA (Lengte: ${payload.imageUrl?.length || 0})` 
            : "NEE/LEEG"
    });

    const response = await api.post('/api/location', payload);
    return normalize(unwrapResponseData<any>(response.data));
  },

  async update(id: string, payload: Omit<Location, 'id' | 'buildingName'>): Promise<Location> {
    // DEBUG LOG 2: Wat sturen we op bij UPDATE? (Veilig gemaakt met optional chaining)
    console.log(`[Service Update] Payload voor ID ${id} die naar backend gaat:`, {
        ...payload,
        imageUrl: isBase64Image(payload.imageUrl) 
            ? `JA (Lengte: ${payload.imageUrl?.length || 0})` 
            : "NEE/LEEG"
    });
    
    const response = await api.put(`/api/location/${id}`, payload);
    return normalize(unwrapResponseData<any>(response.data));
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/location/${id}`);
  },
};