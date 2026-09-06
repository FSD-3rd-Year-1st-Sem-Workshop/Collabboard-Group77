import { authFetchWithRefresh } from '../utils/authFetch';

const API = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

export interface ApiComment {
    _id: string;
    content: string;
    task: string;
    user: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string | null;
        avatarColor?: string;
    };
    createdAt: string;
    updatedAt: string;
}

async function req<T>(url: string, opts?: RequestInit): Promise<T> {
    const res = await authFetchWithRefresh(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message ?? 'Request failed');
    return data?.data ?? data;
}

export const getTaskComments = (taskId: string) =>
    req<ApiComment[]>(`${API}/api/tasks/${taskId}/comments`);

export const createComment = (taskId: string, content: string) =>
    req<ApiComment>(`${API}/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });

export const deleteComment = (commentId: string) =>
    req<void>(`${API}/api/comments/${commentId}`, { method: 'DELETE' });
