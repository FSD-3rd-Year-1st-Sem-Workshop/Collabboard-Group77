import { Request, Response, NextFunction } from "express";
import Board from "../models/Board.js";
import Column from "../models/Column.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/Response.js";

// GET /api/workspaces/:workspaceId/boards
export async function listWorkspaceBoards(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const workspaceId = req.params.workspaceId as string;

        const boards = await Board.find({
            workspace: workspaceId,
            status: "active"
        }).sort({ createdAt: -1 });

        return sendSuccess(res, boards, 200, "Boards retrieved successfully");
    } catch (error) {
        next(error);
    }
}

// POST /api/workspaces/:workspaceId/boards
export async function createBoard(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const workspaceId = req.params.workspaceId as string;

        const board = await Board.create({
            workspace: workspaceId,
            name: req.body.name,
            description: req.body.description,
            color: req.body.color,
            visibility: req.body.visibility,
            createdBy: req.userId
        });

        // Automatically create default columns
        const boardId = board._id as any;
        const defaultColumns = [
            { board: boardId, name: "To Do", position: 1 },
            { board: boardId, name: "Doing", position: 2 },
            { board: boardId, name: "Done", position: 3 }
        ];

        await Column.insertMany(defaultColumns);

        const columns = await Column.find({ board: boardId }).sort({ position: 1 });

        return sendSuccess(
            res,
            { board, columns },
            201,
            "Board created successfully with default columns"
        );
    } catch (error) {
        if (error instanceof Error && error.message.includes("E11000")) {
            return next(new AppError("A board with this name already exists in this workspace", 409));
        }
        next(error);
    }
}

// GET /api/boards/:boardId
export async function getBoardById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        // req.board comes from requireBoardWorkspaceMember
        const board = req.board;

        if (board.status !== "active") {
            throw new AppError("Board not found or archived", 404);
        }

        return sendSuccess(res, board, 200, "Board retrieved successfully");
    } catch (error) {
        next(error);
    }
}

// PATCH /api/boards/:boardId
export async function updateBoard(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const board = req.board;

        if (board.status !== "active") {
            throw new AppError("Cannot update an archived board", 400);
        }

        // Update fields if provided
        if (req.body.name !== undefined) board.name = req.body.name;
        if (req.body.description !== undefined) board.description = req.body.description;
        if (req.body.color !== undefined) board.color = req.body.color;
        if (req.body.visibility !== undefined) board.visibility = req.body.visibility;

        await board.save();

        return sendSuccess(res, board, 200, "Board updated successfully");
    } catch (error) {
        if (error instanceof Error && error.message.includes("E11000")) {
            return next(new AppError("A board with this name already exists in this workspace", 409));
        }
        next(error);
    }
}

// DELETE /api/boards/:boardId
export async function archiveBoard(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const board = req.board;

        if (board.status === "archived") {
            throw new AppError("Board is already archived", 400);
        }

        board.status = "archived";
        await board.save();

        return sendSuccess(res, null, 200, "Board archived successfully");
    } catch (error) {
        next(error);
    }
}
