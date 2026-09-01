import express from "express";
import { authenticate } from "../middleware/Auth.middleware.js";
import { validateRequest } from "../middleware/Validation.middleware.js";
import { requireColumnWorkspaceMember } from "../middleware/ResourceAuth.middleware.js";
import { requireWorkspaceRole } from "../middleware/WorkspaceAuth.middleware.js";
import {
    updateColumn,
    archiveColumn
} from "../controllers/Column.controller.js";
import { updateColumnValidator } from "../validators/Column.validator.js";

const router = express.Router();

router.use(authenticate);

// Update column
router.patch(
    "/:columnId",
    requireColumnWorkspaceMember,
    requireWorkspaceRole(["owner", "admin", "member"]),
    updateColumnValidator,
    validateRequest,
    updateColumn
);

// Archive column
router.delete(
    "/:columnId",
    requireColumnWorkspaceMember,
    requireWorkspaceRole(["owner", "admin"]),
    archiveColumn
);

export default router;
