// ─── Core domain types (mirror your C# DTOs) ────────────────────────────────

export interface Tour {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  maxParticipants: number;
  isActive: boolean;
  stops: TourStop[];
  createdAt: string;
}

export interface TourStop {
  id: number;
  tourId: number;
  order: number;
  title: string;
  description: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  durationMinutes: number;
}

export interface Booking {
  id: number;
  tourId: number;
  tour?: Tour;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  groupSize: number;
  preferredDate: string;   // ISO date string
  notes?: string;
  status: BookingStatus;
  createdAt: string;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface CreateBookingRequest {
  tourId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  groupSize: number;
  preferredDate: string;
  notes?: string;
}

export interface TourProgress {
  currentStopIndex: number;
  totalStops: number;
  completedStopIds: number[];
  startedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
