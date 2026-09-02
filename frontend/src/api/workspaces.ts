import { authFetchWithRefresh } from '../utils/authFetch';
import type { CreateWorkspaceInput, Workspace, WorkspaceMember } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

export async function getWorkspacesApi(): Promise<Workspace[]> {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/workspaces`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || 'Failed to fetch workspaces.');
  return data?.data ?? [];
}

export async function getWorkspaceByIdApi(id: string): Promise<Workspace> {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/workspaces/${id}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || 'Failed to fetch workspace.');
  return data?.data;
}

export async function updateWorkspaceApi(id: string, payload: Partial<CreateWorkspaceInput>): Promise<Workspace> {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/workspaces/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || 'Failed to update workspace.');
  return data?.data;
}

export async function createWorkspaceApi(payload: CreateWorkspaceInput): Promise<Workspace> {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/workspaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      description: payload.description ?? '',
      logo: payload.logo ?? null,
      color: payload.color ?? '#2563EB',
      visibility: payload.visibility ?? 'private',
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || 'Failed to create workspace.');
  return data?.data;
}

export async function getWorkspaceMembersApi(workspaceId: string): Promise<WorkspaceMember[]> {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/workspaces/${workspaceId}/members`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || 'Failed to fetch members.');
  return data?.data?.members ?? data?.data ?? [];
}

export async function updateMemberRoleApi(workspaceId: string, userId: string, role: string): Promise<WorkspaceMember> {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/workspaces/${workspaceId}/members/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || 'Failed to update member role.');
  return data?.data;
}

export async function removeMemberApi(workspaceId: string, userId: string): Promise<void> {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/workspaces/${workspaceId}/members/${userId}`, {
    method: 'DELETE',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || 'Failed to remove member.');
}
