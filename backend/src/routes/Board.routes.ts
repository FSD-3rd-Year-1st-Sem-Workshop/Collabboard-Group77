import express from "express";
import { authenticate } from "../middleware/Auth.middleware.js";
import { validateRequest } from "../middleware/Validation.middleware.js";
import { requireBoardWorkspaceMember } from "../middleware/ResourceAuth.middleware.js";
import { requireWorkspaceRole } from "../middleware/WorkspaceAuth.middleware.js";
import {
    getBoardById,
    updateBoard,
    archiveBoard
} from "../controllers/Board.controller.js";
import { updateBoardValidator } from "../validators/Board.validator.js";

const router = express.Router();

router.use(authenticate);

// Get one board
router.get(
    "/:boardId",
    requireBoardWorkspaceMember,
    getBoardById
);

// Update board
router.patch(
    "/:boardId",
    requireBoardWorkspaceMember,
    requireWorkspaceRole(["owner", "admin", "member"]),
    updateBoardValidator,
    validateRequest,
    updateBoard
);

// Archive board
router.delete(
    "/:boardId",
    requireBoardWorkspaceMember,
    requireWorkspaceRole(["owner", "admin"]),
    archiveBoard
);

// --- Board Columns ---
import {
    listBoardColumns,
    createColumn,
    reorderColumns
} from "../controllers/Column.controller.js";
import {
    createColumnValidator,
    reorderColumnsValidator
} from "../validators/Column.validator.js";

router.get(
    "/:boardId/columns",
    requireBoardWorkspaceMember,
    listBoardColumns
);

router.post(
    "/:boardId/columns",
    requireBoardWorkspaceMember,
    requireWorkspaceRole(["owner", "admin", "member"]),
    createColumnValidator,
    validateRequest,
    createColumn
);

router.patch(
    "/:boardId/columns/reorder",
    requireBoardWorkspaceMember,
    requireWorkspaceRole(["owner", "admin", "member"]),
    reorderColumnsValidator,
    validateRequest,
    reorderColumns
);

// --- Board Tasks ---
import {
    listBoardTasks,
    createTask
} from "../controllers/Task.controller.js";
import { createTaskValidator } from "../validators/Task.validator.js";

router.get(
    "/:boardId/tasks",
    requireBoardWorkspaceMember,
    listBoardTasks
);

router.post(
    "/:boardId/tasks",
    requireBoardWorkspaceMember,
    requireWorkspaceRole(["owner", "admin", "member"]),
    createTaskValidator,
    validateRequest,
    createTask
);

export default router;
