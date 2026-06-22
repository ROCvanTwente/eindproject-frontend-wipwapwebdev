import { api, unwrapResponseData } from './api';
import type { AdminInviteResponse, AdminOverview } from '../types';

export const adminService = {
  async getAdmins(): Promise<AdminOverview[]> {
    const response = await api.get('/api/admin/admins');
    return unwrapResponseData<AdminOverview[]>(response.data);
  },

  async inviteAdmin(email: string): Promise<AdminInviteResponse> {
    const response = await api.post('/api/admin/invite-admin', { email });
    return unwrapResponseData<AdminInviteResponse>(response.data);
  },
};
