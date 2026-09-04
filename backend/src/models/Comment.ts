import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
    task: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
    {
        task: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: [true, "Comment content is required"],
            trim: true,
            maxlength: [2000, "Comment cannot exceed 2000 characters"],
        },
    },
    {
        timestamps: true,
    }
);

// Index for fetching tasks based on creation time for timelines
commentSchema.index({ task: 1, createdAt: -1 });

const Comment = mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
