import type {
  Tour,
  TourStop,
  Booking,
  CreateBookingRequest,
  ApiResponse,
  PaginatedResponse,
} from "../types";

// ─── Config ─────────────────────────────────────────────────────────────────
// Set VITE_API_URL in your .env file, e.g. VITE_API_URL=https://localhost:7001
const BASE_URL = import.meta.env.VITE_API_URL ?? "https://localhost:7001";

// ─── HTTP helpers ────────────────────────────────────────────────────────────
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("roc_auth_token");

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`API error ${res.status}: ${errorText}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

const get  = <T>(path: string)              => request<T>(path);
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });
const put  = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "PUT",  body: JSON.stringify(body) });
const del  = (path: string) => request<void>(path, { method: "DELETE" });

// ─── Tours ───────────────────────────────────────────────────────────────────
export const toursApi = {
  getAll: (activeOnly = true) =>
    get<Tour[]>(`/api/tours${activeOnly ? "?activeOnly=true" : ""}`),

  getById: (id: number) =>
    get<Tour>(`/api/tours/${id}`),

  create: (data: Omit<Tour, "id" | "createdAt" | "stops">) =>
    post<Tour>("/api/tours", data),

  update: (id: number, data: Partial<Tour>) =>
    put<Tour>(`/api/tours/${id}`, data),

  delete: (id: number) => del(`/api/tours/${id}`),

  getStops: (tourId: number) =>
    get<TourStop[]>(`/api/tours/${tourId}/stops`),
};

// ─── Tour Stops ──────────────────────────────────────────────────────────────
export const stopsApi = {
  create: (tourId: number, data: Omit<TourStop, "id" | "tourId">) =>
    post<TourStop>(`/api/tours/${tourId}/stops`, data),

  update: (tourId: number, stopId: number, data: Partial<TourStop>) =>
    put<TourStop>(`/api/tours/${tourId}/stops/${stopId}`, data),

  delete: (tourId: number, stopId: number) =>
    del(`/api/tours/${tourId}/stops/${stopId}`),

  reorder: (tourId: number, orderedIds: number[]) =>
    post<void>(`/api/tours/${tourId}/stops/reorder`, { orderedIds }),
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const bookingsApi = {
  create: (data: CreateBookingRequest) =>
    post<Booking>("/api/bookings", data),

  getAll: (page = 1, pageSize = 20) =>
    get<PaginatedResponse<Booking>>(
      `/api/bookings?page=${page}&pageSize=${pageSize}`
    ),

  getById: (id: number) => get<Booking>(`/api/bookings/${id}`),

  updateStatus: (id: number, status: string) =>
    put<Booking>(`/api/bookings/${id}/status`, { status }),

  delete: (id: number) => del(`/api/bookings/${id}`),
};

// ─── Auth (if you add it later) ──────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    post<ApiResponse<{ token: string }>>("/api/auth/login", { email, password }),

  logout: () => {
    localStorage.removeItem("roc_auth_token");
  },
};
