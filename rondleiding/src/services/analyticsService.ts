import { api, unwrapResponseData } from './api';
import type { AnalyticsSummary } from '../types';

const VISITOR_STORAGE_KEY = 'school-guide-visitor-id';

function getVisitorId() {
  const existingId = localStorage.getItem(VISITOR_STORAGE_KEY);
  if (existingId) {
    return existingId;
  }

  const nextId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  localStorage.setItem(VISITOR_STORAGE_KEY, nextId);
  return nextId;
}

async function track(payload: {
  eventType: 'page_view' | 'route_start';
  path?: string;
  routeId?: number;
  routeName?: string;
}) {
  try {
    await api.post('/api/analytics/events', {
      ...payload,
      visitorId: getVisitorId(),
    });
  } catch {
    // Analytics mag de bezoekerservaring nooit blokkeren.
  }
}

export const analyticsService = {
  trackPageView(path: string) {
    return track({ eventType: 'page_view', path });
  },

  trackRouteStart(routeId: string, routeName: string) {
    return track({ eventType: 'route_start', routeId: Number(routeId), routeName });
  },

  async getSummary(): Promise<AnalyticsSummary> {
    const response = await api.get('/api/analytics/summary');
    return unwrapResponseData<AnalyticsSummary>(response.data);
  },
};
