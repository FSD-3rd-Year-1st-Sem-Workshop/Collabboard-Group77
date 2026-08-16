import express from "express";
import { authenticate } from "../middleware/Auth.middleware.js";
import { validateRequest } from "../middleware/Validation.middleware.js";
import {
    createWorkspace,
    getMyWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    archiveWorkspace
} from "../controllers/Workspace.controller.js";
import {
    requireWorkspaceMember,
    requireWorkspaceRole
} from "../middleware/WorkspaceAuth.middleware.js";
import {
    createWorkspaceValidator,
    updateWorkspaceValidator
} from "../validators/Workspace.validator.js";

const router = express.Router();

// All workspace routes require authentication
router.use(authenticate);

// Create workspace
router.post(
    "/",
    createWorkspaceValidator,
    validateRequest,
    createWorkspace
);

// Get my workspaces (lists active ones user has membership in)
router.get("/", getMyWorkspaces);

// Get one workspace
router.get(
    "/:id",
    requireWorkspaceMember,
    getWorkspaceById
);

// Update workspace (Owner or Admin role required)
router.patch(
    "/:id",
    requireWorkspaceMember,
    requireWorkspaceRole(["owner", "admin"]),
    updateWorkspaceValidator,
    validateRequest,
    updateWorkspace
);

// Soft delete / archive workspace (Owner or Admin required)
router.delete(
    "/:id",
    requireWorkspaceMember,
    requireWorkspaceRole(["owner", "admin"]),
    archiveWorkspace
);

export default router;
