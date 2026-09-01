import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/Workspace_members.js";
import { AppError } from "../utils/AppError.js";

/** Middleware to ensure the user is an active member of the workspace.
 * Resolves workspaceId from route params (either workspaceId or id).
 */
export async function requireWorkspaceMember(
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const { workspaceId, id } = req.params;
        const targetWorkspaceId = req.resolvedWorkspaceId || workspaceId || id;

        if (
            !targetWorkspaceId ||
            typeof targetWorkspaceId !== "string" ||
            !mongoose.Types.ObjectId.isValid(targetWorkspaceId)
        ) {
            throw new AppError("Invalid workspace identifier", 400);
        }

        if (!req.userId) {
            throw new AppError("Authentication required", 401);
        }

        // Retrieve the workspace, make sure it is not archived
        const workspace = await Workspace.findOne({
            _id: targetWorkspaceId,
            archived: false
        });

        if (!workspace) {
            throw new AppError("Workspace not found or archived", 404);
        }

        // Find user's membership in the workspace
        const member = await WorkspaceMember.findOne({
            workspace: targetWorkspaceId,
            user: req.userId,
            status: "active"
        });

        if (!member) {
            throw new AppError("Access denied: You are not a member of this workspace", 403);
        }

        // Attach workspace and membership detail to the request
        req.workspace = workspace;
        req.workspaceMember = member;

        next();
    } catch (error) {
        next(error);
    }
}

/*Middleware factory to restrict actions to specific roles within a workspace.
 * Must be executed after requireWorkspaceMember.
 */
export function requireWorkspaceRole(allowedRoles: string[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.workspaceMember) {
            return next(new AppError("Workspace membership context is missing", 500));
        }

        const { role } = req.workspaceMember;
        if (!allowedRoles.includes(role)) {
            return next(new AppError("Access denied: Insufficient permissions in this workspace", 403));
        }

        next();
    };
}
