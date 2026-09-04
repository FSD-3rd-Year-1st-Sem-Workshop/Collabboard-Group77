import { authFetchWithRefresh } from '../utils/authFetch';

const API = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ApiTask {
    _id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    labels: string[];
    dueDate?: string | null;
    position: number;
    version: number;
    board: string;
    column: string;
    assignedTo?: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskInput {
    title: string;
    description?: string;
    priority?: TaskPriority;
    labels?: string[];
    dueDate?: string | null;
    assignedTo?: string | null;
}

async function req<T>(url: string, opts?: RequestInit): Promise<T> {
    const res = await authFetchWithRefresh(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message ?? 'Request failed');
    return data?.data ?? data;
}

export const getBoardTasks = (boardId: string) =>
    req<ApiTask[]>(`${API}/api/boards/${boardId}/tasks`);

export const createTask = (boardId: string, columnId: string, payload: CreateTaskInput) =>
    req<ApiTask>(`${API}/api/boards/${boardId}/columns/${columnId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

export const updateTask = (taskId: string, payload: Partial<CreateTaskInput>) =>
    req<ApiTask>(`${API}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

export const moveTask = (taskId: string, targetColumnId: string, targetPosition: number, version: number) =>
    req<ApiTask>(`${API}/api/tasks/${taskId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId: targetColumnId, position: targetPosition, version }),
    });

export const deleteTask = (taskId: string) =>
    req<void>(`${API}/api/tasks/${taskId}`, { method: 'DELETE' });
