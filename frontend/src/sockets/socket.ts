import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from '../utils/authFetch';

const SOCKET_URL =
    import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

export type ServerToClientEvents = {
    'task.created': (payload: { task: import('../api/tasks').ApiTask }) => void;
    'task.updated': (payload: { task: import('../api/tasks').ApiTask }) => void;
    'task.moved': (payload: { task: import('../api/tasks').ApiTask }) => void;
    'task.deleted': (payload: { taskId: string; boardId: string }) => void;
    'workspace.member_added': (payload: WorkspaceMemberEvent) => void;
    'workspace.member_removed': (payload: { userId: string; workspaceId: string }) => void;
    'workspace.member_role_updated': (payload: WorkspaceMemberEvent) => void;
    'socket.error': (payload: { message: string }) => void;
};

export type ClientToServerEvents = {
    'workspace.join': (payload: { workspaceId: string }) => void;
    'workspace.leave': (payload: { workspaceId: string }) => void;
    'board.join': (payload: { boardId: string }) => void;
    'board.leave': (payload: { boardId: string }) => void;
};

export interface WorkspaceMemberEvent {
    workspaceId: string;
    userId: string;
    role: string;
    status: string;
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    auth: (cb) => cb({ token: getAccessToken() }),
});

export function connectSocket(): void {
    socket.auth = { token: getAccessToken() };
    if (!socket.connected) socket.connect();
}