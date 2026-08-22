import mongoose, { Schema, Document, InferSchemaType } from "mongoose";

const workspaceInvitationSchema = new Schema(
    {
        workspace: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        role: {
            type: String,
            enum: ["admin", "member"],
            default: "member",
        },

        invitedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        token: {
            type: String,
            required: true,
            unique: true,
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "declined", "expired"],
            default: "pending",
        },

        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                const { __v, ...rest } = ret;
                const formatted = { id: ret._id, ...rest };
                delete (formatted as any)._id;
                return formatted;
            },
        },
    }
);

// Compound index to prevent duplicate pending invitations to the same email in a workspace
workspaceInvitationSchema.index({ workspace: 1, email: 1, status: 1 });
workspaceInvitationSchema.index({ token: 1 });

export type IWorkspaceInvitation = InferSchemaType<typeof workspaceInvitationSchema> & Document;
export default mongoose.model<IWorkspaceInvitation>("WorkspaceInvitation", workspaceInvitationSchema);
