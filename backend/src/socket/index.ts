import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/Workspace_members.js";
import Board from "../models/Board.js";
import env from "../config/Env.js";
import type { AppIO, AppSocket, ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "./types.js";

interface AccessTokenPayload {
    sub: string;
    type: string;
}

let io: AppIO | null = null;

function socketError(socket: AppSocket, message: string): void {
    socket.emit("socket.error", { message });
}

async function canJoinWorkspace(userId: string, workspaceId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) return false;
    const [workspace, member] = await Promise.all([
        Workspace.findOne({ _id: workspaceId, archived: false }).select("_id"),
        WorkspaceMember.findOne({ workspace: workspaceId, user: userId, status: "active" }).select("_id")
    ]);
    return Boolean(workspace && member);
}

async function canJoinBoard(userId: string, boardId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(boardId)) return false;
    const board = await Board.findOne({ _id: boardId, status: "active" }).select("workspace");
    return Boolean(
        board?.workspace &&
        await canJoinWorkspace(userId, board.workspace.toString())
    );
}

function registerRoomHandlers(socket: AppSocket): void {
    socket.on("workspace.join", async ({ workspaceId }) => {
        try {
            if (!(await canJoinWorkspace(socket.data.userId, workspaceId))) {
                return socketError(socket, "You are not authorized to join this workspace");
            }
            await socket.join(`workspace:${workspaceId}`);
        } catch {
            socketError(socket, "Unable to join workspace");
        }
    });

    socket.on("workspace.leave", async ({ workspaceId }) => {
        await socket.leave(`workspace:${workspaceId}`);
    });

    socket.on("board.join", async ({ boardId }) => {
        try {
            if (!(await canJoinBoard(socket.data.userId, boardId))) {
                return socketError(socket, "You are not authorized to join this board");
            }
            await socket.join(`board:${boardId}`);
        } catch {
            socketError(socket, "Unable to join board");
        }
    });

    socket.on("board.leave", async ({ boardId }) => {
        await socket.leave(`board:${boardId}`);
    });
}

export function initializeSocket(httpServer: import("http").Server): AppIO {
    io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
        cors: {
            origin: env.clientUrl,
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (typeof token !== "string" || !token) return next(new Error("Authentication required"));

            const payload = jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
            if (payload.type !== "access" || !mongoose.Types.ObjectId.isValid(payload.sub)) {
                return next(new Error("Invalid access token"));
            }

            const user = await User.findOne({ _id: payload.sub, status: "active" }).select("_id");
            if (!user) return next(new Error("User is not active"));

            socket.data.userId = user._id.toString();
            next();
        } catch {
            next(new Error("Invalid or expired access token"));
        }
    });

    io.on("connection", (socket) => {
        registerRoomHandlers(socket);
    });

    return io;
}

export function getIO(): AppIO {
    if (!io) throw new Error("Socket.IO has not been initialized");
    return io;
}
