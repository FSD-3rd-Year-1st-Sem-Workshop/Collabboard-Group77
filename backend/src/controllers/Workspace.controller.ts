import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/Workspace_members.js";
import Board from "../models/Board.js";
import { sendSuccess } from "../utils/Response.js";
import { AppError } from "../utils/AppError.js";


 // Create a new workspace and add the creator as owner.
 // Done in a transaction, with fallback support for single-node development databases.
export async function createWorkspace(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { name, description, logo, color, visibility } = req.body;
        const userId = req.userId;

        if (!userId) {
            throw new AppError("Authentication required", 401);
        }

        const workspace = new Workspace({
            name,
            description: description || "",
            owner: userId,
            logo: logo || null,
            color: color || "#2563EB",
            visibility: visibility || "private"
        });

        await workspace.save({ session });

        const member = new WorkspaceMember({
            workspace: workspace._id,
            user: userId,
            role: "owner",
            status: "active"
        });

        await member.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Map output to expected frontend format
        const responseData = {
            id: workspace._id,
            name: workspace.name,
            description: workspace.description,
            logo: workspace.logo,
            color: workspace.color,
            visibility: workspace.visibility,
            role: "owner",
            memberCount: 1,
            boardCount: 0
        };

        return sendSuccess(res, responseData, 201, "Workspace created successfully");
    } catch (error: any) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();

        const errMessage = error.message || "";
        // If transactions are not supported, fallback to non-transaction setup
        if (
            errMessage.includes("transaction") ||
            errMessage.includes("session") ||
            errMessage.includes("replica set") ||
            errMessage.includes("not support")
        ) {
            console.warn("MongoDB environment does not support sessions/transactions. Falling back to non-transaction scheme...");
            try {
                const { name, description, logo, color, visibility } = req.body;
                const userId = req.userId;

                if (!userId) {
                    throw new AppError("Authentication required", 401);
                }

                const workspace = new Workspace({
                    name,
                    description: description || "",
                    owner: userId,
                    logo: logo || null,
                    color: color || "#2563EB",
                    visibility: visibility || "private"
                });

                await workspace.save();

                const member = new WorkspaceMember({
                    workspace: workspace._id,
                    user: userId,
                    role: "owner",
                    status: "active"
                });

                await member.save();

                const responseData = {
                    id: workspace._id,
                    name: workspace.name,
                    description: workspace.description,
                    logo: workspace.logo,
                    color: workspace.color,
                    visibility: workspace.visibility,
                    role: "owner",
                    memberCount: 1,
                    boardCount: 0
                };

                return sendSuccess(res, responseData, 201, "Workspace created successfully (fallback)");
            } catch (fallbackError) {
                return next(fallbackError);
            }
        }

        return next(error);
    }
}

/* Get all workspaces for the logged in user with their summary and role.*/
export async function getMyWorkspaces(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const userId = req.userId;

        if (!userId) {
            throw new AppError("Authentication required", 401);
        }

        // Find active memberships
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

        // Build the workspace list with counts
        const workpaceList = await Promise.all(
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

        return sendSuccess(res, workpaceList, 200, "Workspaces retrieved successfully");
    } catch (error) {
        next(error);
    }
}

/* Get a single workspace by ID (accessed only by members).*/
export async function getWorkspaceById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const workspace = req.workspace;
        const member = req.workspaceMember;

        const memberCount = await WorkspaceMember.countDocuments({
            workspace: workspace._id,
            status: "active"
        });

        const boardCount = await Board.countDocuments({
            workspace: workspace._id,
            status: "active"
        });

        const responseData = {
            id: workspace._id,
            name: workspace.name,
            description: workspace.description,
            logo: workspace.logo,
            color: workspace.color,
            visibility: workspace.visibility,
            role: member.role,
            memberCount,
            boardCount
        };

        return sendSuccess(res, responseData, 200, "Workspace retrieved successfully");
    } catch (error) {
        next(error);
    }
}

/* Update workspace info (admin/owner authorization enforced by middleware).*/
export async function updateWorkspace(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const workspace = req.workspace;
        const { name, description, logo, color, visibility } = req.body;

        if (name !== undefined) workspace.name = name;
        if (description !== undefined) workspace.description = description;
        if (logo !== undefined) workspace.logo = logo;
        if (color !== undefined) workspace.color = color;
        if (visibility !== undefined) workspace.visibility = visibility;

        await workspace.save();

        const member = req.workspaceMember;
        const memberCount = await WorkspaceMember.countDocuments({
            workspace: workspace._id,
            status: "active"
        });
        const boardCount = await Board.countDocuments({
            workspace: workspace._id,
            status: "active"
        });

        return sendSuccess(
            res,
            {
                id: workspace._id,
                name: workspace.name,
                description: workspace.description,
                logo: workspace.logo,
                color: workspace.color,
                visibility: workspace.visibility,
                role: member.role,
                memberCount,
                boardCount
            },
            200,
            "Workspace updated successfully"
        );
    } catch (error) {
        next(error);
    }
}

/* Soft delete (archive) workspace (owner authorization enforced by middleware).*/
export async function archiveWorkspace(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const workspace = req.workspace;

        workspace.archived = true;
        await workspace.save();

        return sendSuccess(
            res,
            {
                id: workspace._id,
                status: "archived"
            },
            200,
            "Workspace archived successfully"
        );
    } catch (error) {
        next(error);
    }
}
