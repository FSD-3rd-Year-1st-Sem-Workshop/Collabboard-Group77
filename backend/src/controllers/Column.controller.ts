import { Request, Response, NextFunction } from "express";
import Column from "../models/Column.js";
import Task from "../models/Task.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/Response.js";

// GET /api/boards/:boardId/columns
export async function listBoardColumns(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const boardId = req.params.boardId as string;

        const columns = await Column.find({
            board: boardId,
            status: "active"
        }).sort({ position: 1 });

        return sendSuccess(res, columns, 200, "Columns retrieved successfully");
    } catch (error) {
        next(error);
    }
}

// POST /api/boards/:boardId/columns
export async function createColumn(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const boardId = req.params.boardId as string;

        // Find the highest position
        const lastColumn = await Column.findOne({ board: boardId }).sort({ position: -1 });
        const newPosition = lastColumn ? Number(lastColumn.position) + 1 : 1;

        const column = await Column.create({
            board: boardId,
            name: req.body.name,
            description: req.body.description,
            color: req.body.color,
            position: newPosition
        });

        return sendSuccess(res, column, 201, "Column created successfully");
    } catch (error) {
        if (error instanceof Error && error.message.includes("E11000")) {
            return next(new AppError("A column with this name already exists on this board", 409));
        }
        next(error);
    }
}

// PATCH /api/columns/:columnId
export async function updateColumn(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const column = req.column;

        if (column.status !== "active") {
            throw new AppError("Cannot update an archived column", 400);
        }

        if (req.body.name !== undefined) column.name = req.body.name;
        if (req.body.description !== undefined) column.description = req.body.description;
        if (req.body.color !== undefined) column.color = req.body.color;

        await column.save();

        return sendSuccess(res, column, 200, "Column updated successfully");
    } catch (error) {
        if (error instanceof Error && error.message.includes("E11000")) {
            return next(new AppError("A column with this name already exists on this board", 409));
        }
        next(error);
    }
}

// PATCH /api/boards/:boardId/columns/reorder
export async function reorderColumns(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const boardId = req.params.boardId as string;
        const { columns } = req.body;

        // Verify that all columns belong to the board
        const columnIds = columns.map((c: any) => c.id);
        const existingColumns = await Column.find({ _id: { $in: columnIds }, board: boardId });

        if (existingColumns.length !== columns.length) {
            throw new AppError("One or more column IDs are invalid or belong to a different board", 400);
        }

        const bulkOps = columns.map((col: any) => ({
            updateOne: {
                filter: { _id: col.id },
                update: { position: col.position }
            }
        }));

        await Column.bulkWrite(bulkOps);

        return sendSuccess(res, null, 200, "Columns reordered successfully");
    } catch (error) {
        next(error);
    }
}

// DELETE /api/columns/:columnId
export async function archiveColumn(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const column = req.column;

        if (column.status === "archived") {
            throw new AppError("Column is already archived", 400);
        }

        // Check if there are active tasks linked to this column
        const activeTasks = await Task.countDocuments({
            column: column._id,
            archived: false
        });

        if (activeTasks > 0) {
            throw new AppError("Cannot archive a column that contains active tasks. Move or archive the tasks first.", 400);
        }

        column.status = "archived";
        await column.save();

        return sendSuccess(res, null, 200, "Column archived successfully");
    } catch (error) {
        next(error);
    }
}
