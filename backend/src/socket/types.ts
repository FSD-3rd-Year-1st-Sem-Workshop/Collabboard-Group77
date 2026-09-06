import type { Server as HttpServer } from "http";
import type { Server, Socket } from "socket.io";
import type { ITask } from "../models/Task.js";

export interface ServerToClientEvents {
    "column.created": (payload: { column: import("../models/Column.js").IColumn }) => void;
    "column.updated": (payload: { column: import("../models/Column.js").IColumn }) => void;
    "column.deleted": (payload: { columnId: string; boardId: string }) => void;
    "task.created": (payload: { task: ITask }) => void;
    "task.updated": (payload: { task: ITask }) => void;
    "task.moved": (payload: { task: ITask }) => void;
    "task.deleted": (payload: { taskId: string; boardId: string }) => void;
    "workspace.member_added": (payload: WorkspaceMemberEvent) => void;
    "workspace.member_removed": (payload: { userId: string; workspaceId: string }) => void;
    "workspace.member_role_updated": (payload: WorkspaceMemberEvent) => void;
    "socket.error": (payload: { message: string }) => void;
}

export interface ClientToServerEvents {
    "workspace.join": (payload: { workspaceId: string }) => void;
    "workspace.leave": (payload: { workspaceId: string }) => void;
    "board.join": (payload: { boardId: string }) => void;
    "board.leave": (payload: { boardId: string }) => void;
}

export interface InterServerEvents { }

export interface SocketData {
    userId: string;
}

export interface WorkspaceMemberEvent {
    workspaceId: string;
    userId: string;
    role: string;
    status: string;
}

export type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type AppIO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type SocketHttpServer = HttpServer;
