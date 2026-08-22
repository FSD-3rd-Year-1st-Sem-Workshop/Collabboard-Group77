import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import WorkspaceMember from "../models/Workspace_members.js";
import { sendSuccess } from "../utils/Response.js";
import { AppError } from "../utils/AppError.js";

/* List all active members of the workspace.*/
export async function getWorkspaceMembers(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const workspaceId = req.workspace?._id || req.params.workspaceId;

        // Retrieve active members from workspace
        const members = await WorkspaceMember.find({
            workspace: workspaceId,
            status: "active"
        }).populate("user", "fullName email avatar bio");

        // Format members list
        const formattedMembers = members.map((member: any) => {
            const userObj = member.user || {};
            return {
                userId: userObj._id,
                name: userObj.fullName || "",
                email: userObj.email || "",
                avatar: userObj.avatar || null,
                bio: userObj.bio || "",
                role: member.role,
                status: member.status
            };
        });

        const responseData = {
            workspaceId,
            members: formattedMembers
        };

        return sendSuccess(res, responseData, 200, "Workspace members retrieved successfully");
    } catch (error) {
        next(error);
    }
}

/*  Update the role of a workspace member (Owner only).*/
export async function updateMemberRole(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const workspaceId = req.workspace?._id || req.params.workspaceId;
        const userId = req.params.userId as string;
        const { role } = req.body;

        if (!req.workspaceMember) {
            throw new AppError("Workspace membership context is missing", 500);
        }

        // Only Owner can promote/demote or manage roles
        if (req.workspaceMember.role !== "owner") {
            throw new AppError("Access denied: Only Owner can manage member roles", 403);
        }

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError("Invalid user ID format", 400);
        }

        // Find target member
        const targetMember = await WorkspaceMember.findOne({
            workspace: workspaceId,
            user: userId
        });

        if (!targetMember) {
            throw new AppError("Workspace member not found", 404);
        }

        // Prevent modifying the owner
        if (targetMember.role === "owner") {
            throw new AppError("Cannot change role of the workspace owner", 400);
        }

        targetMember.role = role;
        await targetMember.save();

        const responseData = {
            userId: targetMember.user,
            role: targetMember.role,
            status: targetMember.status
        };

        return sendSuccess(res, responseData, 200, "Member role updated successfully");
    } catch (error) {
        next(error);
    }
}

/** Remove a workspace member.*/
export async function removeMember(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const workspaceId = req.workspace?._id || req.params.workspaceId;
        const userId = req.params.userId as string;
        const requesterId = req.userId;

        if (!req.workspaceMember) {
            throw new AppError("Workspace membership context is missing", 500);
        }

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError("Invalid user ID format", 400);
        }

        // Find target member
        const targetMember = await WorkspaceMember.findOne({
            workspace: workspaceId,
            user: userId
        });

        if (!targetMember) {
            throw new AppError("Workspace member not found", 404);
        }

        const requesterRole = req.workspaceMember.role;
        const targetRole = targetMember.role;

        // Check permissions:
        // Owner can remove member/admin, cannot remove self (must transfer ownership first).
        // Admin can remove member, cannot remove owner or other admin.
        // Member can remove no one, but can leave (remove self).
        const isSelf = userId === requesterId;

        if (isSelf) {
            if (requesterRole === "owner") {
                throw new AppError("Owner cannot leave the workspace. Please transfer ownership first.", 400);
            }
            // Allow admin or member to leave
        } else {
            if (requesterRole === "member") {
                throw new AppError("Access denied: Members cannot remove other members", 403);
            }

            if (requesterRole === "admin") {
                if (targetRole === "owner" || targetRole === "admin") {
                    throw new AppError("Access denied: Admins cannot remove Owner or other Admins", 403);
                }
            }
            // Owner is permitted to remove anyone
        }

        // Delete the member record
        await WorkspaceMember.deleteOne({ _id: targetMember._id });

        return sendSuccess(
            res,
            { userId, workspaceId },
            200,
            isSelf ? "You have left the workspace successfully" : "Member removed successfully"
        );
    } catch (error) {
        next(error);
    }
}
