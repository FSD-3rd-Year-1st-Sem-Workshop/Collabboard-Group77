import { Request, Response, NextFunction } from "express";
import Board from "../models/Board.js";
import Column from "../models/Column.js";
import Task from "../models/Task.js";
import { AppError } from "../utils/AppError.js";
import { requireWorkspaceMember } from "./WorkspaceAuth.middleware.js";

/** Middleware to ensure the user is an active member of the workspace the board belongs to.
 */
export async function requireBoardWorkspaceMember(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const boardId = req.params.boardId || req.params.id;

        if (!boardId) {
            throw new AppError("Board ID is required", 400);
        }

        const board = await Board.findById(boardId);
        if (!board) {
            throw new AppError("Board not found", 404);
        }
        if (!board.workspace) {
            throw new AppError("Orphaned board has no workspace", 500);
        }

        req.board = board;
        req.resolvedWorkspaceId = board.workspace.toString();

        return requireWorkspaceMember(req, res, next) as unknown as void;
    } catch (error) {
        next(error);
    }
}

/*Middleware to ensure the user is an active member of the workspace the column belongs to.
 */
export async function requireColumnWorkspaceMember(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const columnId = req.params.columnId || req.params.id;

        if (!columnId) {
            throw new AppError("Column ID is required", 400);
        }

        const column = await Column.findById(columnId).populate("board");
        if (!column) {
            throw new AppError("Column not found", 404);
        }

        if (!column.board) {
            throw new AppError("Orphaned column has no associated board", 500);
        }

        req.column = column;
        req.board = column.board; // attached for convenience
        // @ts-ignore
        req.resolvedWorkspaceId = column.board.workspace.toString();

        return requireWorkspaceMember(req, res, next) as unknown as void;
    } catch (error) {
        next(error);
    }
}

/* Middleware to ensure the user is an active member of the workspace the task belongs to.
 */
export async function requireTaskWorkspaceMember(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const taskId = req.params.taskId || req.params.id;

        if (!taskId) {
            throw new AppError("Task ID is required", 400);
        }

        const task = await Task.findById(taskId).populate("board");
        if (!task) {
            throw new AppError("Task not found", 404);
        }

        if (!task.board) {
            throw new AppError("Orphaned task has no associated board", 500);
        }

        req.task = task;
        req.board = task.board; // attached for convenience
        // @ts-ignore
        req.resolvedWorkspaceId = task.board.workspace.toString();

        return requireWorkspaceMember(req, res, next) as unknown as void;
    } catch (error) {
        next(error);
    }
}

import Comment from "../models/Comment.js";

/* Middleware to ensure the user is an active member of the workspace the comment belongs to.
 */
export async function requireCommentWorkspaceMember(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const commentId = req.params.commentId || req.params.id;

        if (!commentId) {
            throw new AppError("Comment ID is required", 400);
        }

        const comment = await Comment.findById(commentId).populate({
            path: "task",
            populate: { path: "board" },
        });

        if (!comment) {
            throw new AppError("Comment not found", 404);
        }

        if (!comment.task || !(comment.task as any).board) {
            throw new AppError("Orphaned comment has no associated task or board", 500);
        }

        req.comment = comment;
        req.task = comment.task; // attached for convenience
        // @ts-ignore
        req.resolvedWorkspaceId = comment.task.board.workspace.toString();

        return requireWorkspaceMember(req, res, next) as unknown as void;
    } catch (error) {
        next(error);
    }
}
