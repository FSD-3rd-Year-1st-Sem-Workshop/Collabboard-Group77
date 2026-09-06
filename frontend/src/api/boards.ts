import { authFetchWithRefresh } from '../utils/authFetch';

const API = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

export interface ApiBoard {
    _id: string;
    name: string;
    description?: string;
    color?: string;
    visibility: 'public' | 'private';
    status: 'active' | 'archived';
    workspace: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBoardInput {
    name: string;
    description?: string;
    color?: string;
    visibility?: 'public' | 'private';
}

async function req<T>(url: string, opts?: RequestInit): Promise<T> {
    const res = await authFetchWithRefresh(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message ?? 'Request failed');
    return data?.data ?? data;
}

export const getWorkspaceBoards = (workspaceId: string) =>
    req<ApiBoard[]>(`${API}/api/workspaces/${workspaceId}/boards`);

export const getBoardById = (boardId: string) =>
    req<ApiBoard>(`${API}/api/boards/${boardId}`);

export const createBoard = (workspaceId: string, payload: CreateBoardInput) =>
    req<ApiBoard>(`${API}/api/workspaces/${workspaceId}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

export const deleteBoard = (boardId: string) =>
    req<void>(`${API}/api/boards/${boardId}`, { method: 'DELETE' });
