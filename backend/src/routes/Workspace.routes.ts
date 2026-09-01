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
    getWorkspaceMembers,
    updateMemberRole,
    removeMember
} from "../controllers/WorkspaceMember.controller.js";
import {
    requireWorkspaceMember,
    requireWorkspaceRole
} from "../middleware/WorkspaceAuth.middleware.js";
import {
    createWorkspaceValidator,
    updateWorkspaceValidator
} from "../validators/Workspace.validator.js";
import { updateMemberValidator } from "../validators/Member.validator.js";
import {
    sendInvitation,
    listWorkspaceInvitations,
    revokeInvitation
} from "../controllers/WorkspaceInvitation.controller.js";
import { sendInvitationValidator } from "../validators/Invitation.validator.js";
import {
    listWorkspaceBoards,
    createBoard
} from "../controllers/Board.controller.js";
import { createBoardValidator } from "../validators/Board.validator.js";

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

// Soft delete / archive workspace (Owner required)
router.delete(
    "/:id",
    requireWorkspaceMember,
    requireWorkspaceRole(["owner"]),
    archiveWorkspace
);

// Workspace members routes
router.get(
    "/:workspaceId/members",
    requireWorkspaceMember,
    getWorkspaceMembers
);

router.patch(
    "/:workspaceId/members/:userId",
    requireWorkspaceMember,
    updateMemberValidator,
    validateRequest,
    updateMemberRole
);

router.delete(
    "/:workspaceId/members/:userId",
    requireWorkspaceMember,
    removeMember
);

// Workspace invitations routes
router.post(
    "/:workspaceId/invitations",
    requireWorkspaceMember,
    requireWorkspaceRole(["owner", "admin"]),
    sendInvitationValidator,
    validateRequest,
    sendInvitation
);

router.get(
    "/:workspaceId/invitations",
    requireWorkspaceMember,
    requireWorkspaceRole(["owner", "admin"]),
    listWorkspaceInvitations
);

router.delete(
    "/:workspaceId/invitations/:invitationId",
    requireWorkspaceMember,
    requireWorkspaceRole(["owner", "admin"]),
    revokeInvitation
);

// Workspace Boards routes
router.post(
    "/:workspaceId/boards",
    requireWorkspaceMember,
    requireWorkspaceRole(["owner", "admin", "member"]),
    createBoardValidator,
    validateRequest,
    createBoard
);

router.get(
    "/:workspaceId/boards",
    requireWorkspaceMember,
    listWorkspaceBoards
);

export default router;
