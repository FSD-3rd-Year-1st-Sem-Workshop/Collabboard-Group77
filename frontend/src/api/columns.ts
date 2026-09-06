import { authFetchWithRefresh } from '../utils/authFetch';

const API = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

export interface ApiColumn {
    _id: string;
    name: string;
    description?: string;
    color?: string;
    position: number;
    taskLimit?: number;
    status: 'active' | 'archived';
    board: string;
    createdAt: string;
    updatedAt: string;
}

async function req<T>(url: string, opts?: RequestInit): Promise<T> {
    const res = await authFetchWithRefresh(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message ?? 'Request failed');
    return data?.data ?? data;
}

export const getBoardColumns = (boardId: string) =>
    req<ApiColumn[]>(`${API}/api/boards/${boardId}/columns`);

export const createColumn = (boardId: string, payload: { name: string; color?: string }) =>
    req<ApiColumn>(`${API}/api/boards/${boardId}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

export const updateColumn = (columnId: string, payload: Partial<{ name: string; color: string; taskLimit: number }>) =>
    req<ApiColumn>(`${API}/api/columns/${columnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

export const deleteColumn = (columnId: string) =>
    req<void>(`${API}/api/columns/${columnId}`, { method: 'DELETE' });
