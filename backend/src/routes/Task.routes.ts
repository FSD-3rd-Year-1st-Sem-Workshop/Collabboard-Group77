import express from "express";
import { authenticate } from "../middleware/Auth.middleware.js";
import { validateRequest } from "../middleware/Validation.middleware.js";
import { requireTaskWorkspaceMember } from "../middleware/ResourceAuth.middleware.js";
import { requireWorkspaceRole } from "../middleware/WorkspaceAuth.middleware.js";
import {
    getTaskById,
    updateTask,
    moveTask,
    assignTask
} from "../controllers/Task.controller.js";
import {
    updateTaskValidator,
    moveTaskValidator,
    assignTaskValidator
} from "../validators/Task.validator.js";
import { createComment, getTaskComments } from "../controllers/Comment.controller.js";
import { createCommentValidator } from "../validators/Comment.validator.js";

const router = express.Router();

router.use(authenticate);

// (existing routes remaining intact)

// Get a single task
router.get(
    "/:taskId",
    requireTaskWorkspaceMember,
    getTaskById
);

// Update task metadata
router.patch(
    "/:taskId",
    requireTaskWorkspaceMember,
    requireWorkspaceRole(["owner", "admin", "member"]),
    updateTaskValidator,
    validateRequest,
    updateTask
);

// Move task
router.patch(
    "/:taskId/move",
    requireTaskWorkspaceMember,
    requireWorkspaceRole(["owner", "admin", "member"]),
    moveTaskValidator,
    validateRequest,
    moveTask
);

// Assign task
router.patch(
    "/:taskId/assign",
    requireTaskWorkspaceMember,
    requireWorkspaceRole(["owner", "admin", "member"]),
    assignTaskValidator,
    validateRequest,
    assignTask
);

//  Comments 
router.post(
    "/:taskId/comments",
    requireTaskWorkspaceMember,
    requireWorkspaceRole(["owner", "admin", "member"]),
    createCommentValidator,
    validateRequest,
    createComment
);

router.get(
    "/:taskId/comments",
    requireTaskWorkspaceMember,
    getTaskComments
);

export default router;
