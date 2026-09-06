import { authFetchWithRefresh } from '../utils/authFetch';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

export interface Invitation {
  id: string;
  workspace: string;
  email: string;
  role: string;
  invitedBy: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string; 
}

export async function getMyInvitations(): Promise<Invitation[]> {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/invitations/my`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(data?.message || 'Failed to fetch invitations');
  
  return data.data; 
}

export async function acceptInvitation(invitationId: string) {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/invitations/${invitationId}/accept`, {
    method: 'POST',
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(data?.message || 'Failed to accept invitation');
  return data;
}

export async function declineInvitation(invitationId: string) {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/invitations/${invitationId}/decline`, {
    method: 'POST',
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(data?.message || 'Failed to decline invitation');
  return data;
}