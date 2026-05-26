export interface Building {
  id: string;
  name: string;
  description?: string;
  address?: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  floor?: string;
  buildingId?: string;
  buildingName?: string;
}

export interface RouteLocation {
  id?: string;
  locationId: string;
  locationName?: string;
  order: number;
  direction?: string;
  estimatedMinutes?: number;
}

export interface GuideRoute {
  id: string;
  name: string;
  description: string;
  estimatedTimeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  locations?: RouteLocation[];
}

export interface RoutePayload {
  name: string;
  description: string;
  estimatedTimeMinutes: number;
  difficulty: string;
  locations: RouteLocation[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface AuthUser {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DashboardStats {
  routes: number;
  locations: number;
  buildings: number;
}
