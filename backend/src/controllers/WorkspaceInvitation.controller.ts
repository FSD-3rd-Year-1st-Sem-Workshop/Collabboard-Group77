import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import WorkspaceMember from "../models/Workspace_members.js";
import WorkspaceInvitation from "../models/WorkspaceInvitation.js";
import User from "../models/User.js";
import { sendSuccess } from "../utils/Response.js";
import { AppError } from "../utils/AppError.js";

/* Send an invitation to an existing user to join the workspace. */
export async function sendInvitation(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const workspaceId = req.workspace?._id || req.params.workspaceId;
        const email = req.body.email?.trim().toLowerCase();
        const role = req.body.role || "member";

        if (!email) {
            throw new AppError("Email is required", 400);
        }

        // 1. Check whether the email belongs to an existing user
        const targetUser = await User.findOne({
            email,
            status: "active",
        });

        if (!targetUser) {
            throw new AppError(
                "No registered user was found with this email address",
                404
            );
        }

        // 2. Check if the user is already a member
        const isMember = await WorkspaceMember.findOne({
            workspace: workspaceId,
            user: targetUser._id,
            status: "active",
        });

        if (isMember) {
            throw new AppError(
                "User is already a member of this workspace",
                400
            );
        }

        // 3. Check whether a pending invitation already exists
        const existingInvitation = await WorkspaceInvitation.findOne({
            workspace: workspaceId,
            email,
            status: "pending",
            expiresAt: { $gt: new Date() },
        });

        if (existingInvitation) {
            throw new AppError(
                "An active invitation is already pending for this email in this workspace",
                400
            );
        }

        // 4. Generate secure invitation token
        const token = crypto.randomBytes(32).toString("hex");

        // 5. Invitation expires after 7 days
        const expiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        // 6. Create invitation
        const invitation = new WorkspaceInvitation({
            workspace: workspaceId,
            email,
            role,
            invitedBy: req.userId,
            token,
            expiresAt,
        });

        await invitation.save();

        // 7. Send invitation email here
        // await sendInvitationEmail(...)

        return sendSuccess(
            res, invitation, 201,
            "Invitation sent successfully"
        );
    } catch (error) {
        next(error);
    }
}
/* List all invitations for a workspace.*/
export async function listWorkspaceInvitations(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const workspaceId = req.workspace?._id || req.params.workspaceId;

        const invitations = await WorkspaceInvitation.find({
            workspace: workspaceId,
        }).populate("invitedBy", "fullName email");

        return sendSuccess(res, invitations, 200, "Workspace invitations retrieved successfully");
    } catch (error) {
        next(error);
    }
}

/* Revoke/delete an invitation.*/
export async function revokeInvitation(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const workspaceId = req.workspace?._id || req.params.workspaceId;
        const { invitationId } = req.params;

        const invitation = await WorkspaceInvitation.findOne({
            _id: invitationId,
            workspace: workspaceId,
        });

        if (!invitation) {
            throw new AppError("Invitation not found", 404);
        }

        await WorkspaceInvitation.deleteOne({ _id: invitation._id });

        return sendSuccess(res, null, 200, "Invitation revoked successfully");
    } catch (error) {
        next(error);
    }
}

/* List all pending invitations for the authenticated user.*/
export async function listMyInvitations(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const userEmail = req.user?.email;

        if (!userEmail) {
            throw new AppError("User email not found in session context", 401);
        }

        const invitations = await WorkspaceInvitation.find({
            email: userEmail.toLowerCase(),
            status: "pending",
            expiresAt: { $gt: new Date() },
        })
            .populate("workspace", "name description color logo")
            .populate("invitedBy", "fullName email avatar");

        return sendSuccess(res, invitations, 200, "My invitations retrieved successfully");
    } catch (error) {
        next(error);
    }
}

/* Accept an invitation.*/
export async function acceptInvitation(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const { invitationId } = req.params;
        const userEmail = req.user?.email;
        const currentUserId = req.userId;

        if (!userEmail || !currentUserId) {
            throw new AppError("User authentication context is missing", 401);
        }

        const invitation = await WorkspaceInvitation.findById(invitationId);

        if (!invitation) {
            throw new AppError("Invitation not found", 404);
        }

        if (invitation.status !== "pending") {
            throw new AppError(`Invitation has already been ${invitation.status}`, 400);
        }

        const expiresAt = invitation.expiresAt as Date;
        if (expiresAt < new Date()) {
            invitation.status = "expired";
            await invitation.save();
            throw new AppError("Invitation has expired", 400);
        }

        const invitationEmail = invitation.email as string;
        if (invitationEmail.toLowerCase() !== userEmail.toLowerCase()) {
            throw new AppError("Access denied: This invitation was sent to a different email address", 403);
        }

        // Verify user is not already a member (failsafe check)
        const isMember = await WorkspaceMember.findOne({
            workspace: invitation.workspace,
            user: currentUserId,
            status: "active",
        });

        if (isMember) {
            invitation.status = "accepted";
            await invitation.save();
            throw new AppError("You are already a member of this workspace", 400);
        }

        // Create member record
        const member = new WorkspaceMember({
            workspace: invitation.workspace,
            user: currentUserId,
            role: invitation.role || "member",
            status: "active",
            invitedBy: invitation.invitedBy,
        });

        await member.save();

        // Mark invitation as accepted
        invitation.status = "accepted";
        await invitation.save();

        return sendSuccess(res, member, 200, "Invitation accepted successfully. Welcome to the workspace!");
    } catch (error) {
        next(error);
    }
}

/* Decline an invitation.*/
export async function declineInvitation(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const { invitationId } = req.params;
        const userEmail = req.user?.email;

        if (!userEmail) {
            throw new AppError("User authentication context is missing", 401);
        }

        const invitation = await WorkspaceInvitation.findById(invitationId);

        if (!invitation) {
            throw new AppError("Invitation not found", 404);
        }

        if (invitation.status !== "pending") {
            throw new AppError(`Invitation is not pending (status: ${invitation.status})`, 400);
        }

        const expiresAt = invitation.expiresAt as Date;
        if (expiresAt < new Date()) {
            invitation.status = "expired";
            await invitation.save();
            throw new AppError("Invitation has expired", 400);
        }

        const invitationEmail = invitation.email as string;
        if (invitationEmail.toLowerCase() !== userEmail.toLowerCase()) {
            throw new AppError("Access denied: This invitation belongs to someone else", 403);
        }

        invitation.status = "declined";
        await invitation.save();

        return sendSuccess(res, null, 200, "Invitation declined successfully");
    } catch (error) {
        next(error);
    }
}
