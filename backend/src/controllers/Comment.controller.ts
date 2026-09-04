import { Request, Response, NextFunction } from "express";
import Comment from "../models/Comment.js";
import { AppError } from "../utils/AppError.js";

/*Creates a comment on a Task */
export const createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const taskId = req.params.taskId as string;
        const { content } = req.body;

        const comment = await Comment.create({
            task: taskId,
            user: req.user!.id,
            content,
        });

        const populatedComment = await Comment.findById(comment._id)
            .populate("user", "fullName email avatar avatarColor")
            .exec();

        res.status(201).json({
            status: "success",
            data: populatedComment,
        });
    } catch (error) {
        next(error);
    }
};

/* Retrieves comments for a Task */
export const getTaskComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const taskId = req.params.taskId as string;

        // Ordered chronologically
        const comments = await Comment.find({ task: taskId })
            .populate("user", "fullName email avatar avatarColor")
            .sort({ createdAt: 1 })
            .exec();

        res.status(200).json({
            status: "success",
            results: comments.length,
            data: comments,
        });
    } catch (error) {
        next(error);
    }
};

/* Updates an existing comment. Requires Author permissions */
export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { content } = req.body;
        const comment = req.comment; // Populated by requireCommentWorkspaceMember

        // Verify ownership
        if (comment.user.toString() !== req.user!.id) {
            throw new AppError("You can only edit your own comments", 403);
        }

        comment.content = content;
        await comment.save();

        const populatedComment = await Comment.findById(comment._id)
            .populate("user", "fullName email avatar avatarColor")
            .exec();

        res.status(200).json({
            status: "success",
            data: populatedComment,
        });
    } catch (error) {
        next(error);
    }
};

/* Deletes a comment. Requires Author OR Workspace Admin/Owner permissions */
export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const comment = req.comment;
        const memberRole = req.workspaceMember?.role;

        const isAuthor = comment.user.toString() === req.user!.id;
        const isAdmin = memberRole === 'owner' || memberRole === 'admin';

        if (!isAuthor && !isAdmin) {
            throw new AppError("You do not have permission to delete this comment", 403);
        }

        await comment.deleteOne();

        res.status(204).json({
            status: "success",
            data: null,
        });
    } catch (error) {
        next(error);
    }
};
