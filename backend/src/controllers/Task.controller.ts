import { Request, Response, NextFunction } from "express";
import Task from "../models/Task.js";
import Column from "../models/Column.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/Response.js";

// GET /api/boards/:boardId/tasks
export async function listBoardTasks(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const boardId = req.params.boardId as string;

        const tasks = await Task.find({
            board: boardId,
            archived: false
        }).sort({ position: 1 });

        return sendSuccess(res, tasks, 200, "Tasks retrieved successfully");
    } catch (error) {
        next(error);
    }
}

// POST /api/boards/:boardId/tasks
export async function createTask(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const boardId = req.params.boardId as string;
        const { columnId, title, description, priority } = req.body;

        // Verify column exists on this board
        const column = await Column.findOne({ _id: columnId, board: boardId });
        if (!column) {
            throw new AppError("Invalid column ID or column does not belong to this board", 400);
        }

        // Get the highest position in the chosen column
        const lastTask = await Task.findOne({ column: columnId, board: boardId }).sort({ position: -1 });
        const newPosition = lastTask ? Number(lastTask.position) + 1 : 1;

        const task = await Task.create({
            board: boardId,
            column: columnId,
            title,
            description,
            priority,
            position: newPosition,
            createdBy: req.userId,
            version: 1
        });

        return sendSuccess(res, task, 201, "Task created successfully");
    } catch (error) {
        next(error);
    }
}

// GET /api/tasks/:taskId
export async function getTaskById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const task = req.task;

        if (task.archived) {
            throw new AppError("Task not found or archived", 404);
        }

        return sendSuccess(res, task, 200, "Task retrieved successfully");
    } catch (error) {
        next(error);
    }
}

// PATCH /api/tasks/:taskId
export async function updateTask(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const task = req.task;

        if (task.archived) {
            throw new AppError("Cannot update an archived task", 400);
        }

        if (req.body.title !== undefined) task.title = req.body.title;
        if (req.body.description !== undefined) task.description = req.body.description;
        if (req.body.priority !== undefined) task.priority = req.body.priority;
        if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;
        if (req.body.estimatedHours !== undefined) task.estimatedHours = req.body.estimatedHours;

        task.version = Number(task.version) + 1;

        await task.save();

        return sendSuccess(res, task, 200, "Task updated successfully");
    } catch (error) {
        next(error);
    }
}

// PATCH /api/tasks/:taskId/move
export async function moveTask(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const task = req.task;
        const { columnId, position, version } = req.body;

        if (task.archived) {
            throw new AppError("Cannot move an archived task", 400);
        }

        // Optimistic Concurrency Control
        if (task.version !== version) {
            throw new AppError("Task version mismatch. Your data is out of date, please refresh and try again.", 409);
        }

        // Validate the new column
        if (task.column.toString() !== columnId) {
            const column = await Column.findOne({ _id: columnId, board: task.board });
            if (!column) {
                throw new AppError("Target column does not exist on this board", 400);
            }
            task.column = columnId;
        }

        task.position = position;
        task.version = Number(task.version) + 1;

        await task.save();

        return sendSuccess(res, task, 200, "Task moved successfully");
    } catch (error) {
        next(error);
    }
}

// PATCH /api/tasks/:taskId/assign
export async function assignTask(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const task = req.task;
        const { assignedTo } = req.body;

        if (task.archived) {
            throw new AppError("Cannot assign users to an archived task", 400);
        }

        task.assignedTo = assignedTo;
        task.version = Number(task.version) + 1;

        await task.save();

        return sendSuccess(res, task, 200, "Task assignments updated successfully");
    } catch (error) {
        next(error);
    }
}
