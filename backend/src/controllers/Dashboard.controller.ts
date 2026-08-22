import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/Workspace_members.js";
import Board from "../models/Board.js";
import Task from "../models/Task.js";
import { sendSuccess } from "../utils/Response.js";
import { AppError } from "../utils/AppError.js";

/**
 * Get dashboard data for the authenticated user, summarizing their active workspaces,
 * roles, and task workload metrics.
 */
export async function getDashboard(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const user = req.user;
        const userId = req.userId;

        if (!user || !userId) {
            throw new AppError("Authentication required", 401);
        }

        // Get all active memberships of the user
        const memberships = await WorkspaceMember.find({
            user: userId,
            status: "active"
        });

        const workspaceIds = memberships
            .map((m) => m.workspace)
            .filter((id): id is mongoose.Types.ObjectId => !!id);

        // Get active workspaces
        const workspaces = await Workspace.find({
            _id: { $in: workspaceIds },
            archived: false
        });

        // Populate roles, count members, count boards
        const summaryWorkspaces = await Promise.all(
            workspaces.map(async (ws) => {
                const membership = memberships.find(
                    (m) => m.workspace && m.workspace.toString() === ws._id.toString()
                );
                const role = membership ? membership.role : "member";

                const memberCount = await WorkspaceMember.countDocuments({
                    workspace: ws._id,
                    status: "active"
                });

                const boardCount = await Board.countDocuments({
                    workspace: ws._id,
                    status: "active"
                });

                return {
                    id: ws._id,
                    name: ws.name,
                    description: ws.description,
                    logo: ws.logo,
                    color: ws.color,
                    visibility: ws.visibility,
                    role,
                    memberCount,
                    boardCount
                };
            })
        );

        // Calculate user's assigned and overdue tasks (non-completed and non-archived)
        const now = new Date();

        const assignedTaskCount = await Task.countDocuments({
            assignedTo: userId,
            archived: false,
            completedAt: null
        });

        const overdueTaskCount = await Task.countDocuments({
            assignedTo: userId,
            archived: false,
            completedAt: null,
            dueDate: { $lt: now }
        });

        const summary = {
            workspaceCount: workspaces.length,
            assignedTaskCount,
            overdueTaskCount
        };

        const dashboardData = {
            user: {
                id: user.id,
                name: user.fullName,
                avatarUrl: user.avatar
            },
            workspaces: summaryWorkspaces,
            summary
        };

        return sendSuccess(res, dashboardData, 200, "Dashboard data retrieved successfully");
    } catch (error) {
        next(error);
    }
}
