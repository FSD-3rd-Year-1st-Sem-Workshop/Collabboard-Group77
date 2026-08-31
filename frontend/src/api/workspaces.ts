import { authFetchWithRefresh } from '../utils/authFetch';
import type { CreateWorkspaceInput, Workspace } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

export async function getWorkspacesApi(): Promise<Workspace[]> {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/workspaces`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch workspaces.');
  }

  return data?.data ?? [];
}

export async function createWorkspaceApi(payload: CreateWorkspaceInput): Promise<Workspace> {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/workspaces`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: payload.name,
      description: payload.description ?? '',
      logo: payload.logo ?? null,
      color: payload.color ?? '#2563EB',
      visibility: payload.visibility ?? 'private',
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to create workspace.');
  }

  return data?.data;
}
