import express from "express";
import { authenticate } from "../middleware/Auth.middleware.js";
import {
    listMyInvitations,
    acceptInvitation,
    declineInvitation,
} from "../controllers/WorkspaceInvitation.controller.js";

const router = express.Router();

router.use(authenticate);

// Get my pending invitations
router.get("/my", listMyInvitations);

// Accept invitation
router.post("/:invitationId/accept", acceptInvitation);

// Decline invitation
router.post("/:invitationId/decline", declineInvitation);

export default router;
