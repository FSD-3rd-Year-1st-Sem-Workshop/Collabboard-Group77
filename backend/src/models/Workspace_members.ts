import mongoose, { Schema, Document, InferSchemaType } from "mongoose";

const workspaceMemberSchema = new Schema(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },

    status: {
      type: String,
      enum: ["active", "invited", "suspended"],
      default: "active",
    },

    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
  virtuals: true,
  transform: (_doc, ret) => {
    const { __v, ...rest } = ret;
    return rest;
  },
}
  }
);

workspaceMemberSchema.index({ workspace: 1, user: 1 }, { unique: true });
workspaceMemberSchema.index({ user: 1, status: 1 });

export type IWorkspaceMember = InferSchemaType<typeof workspaceMemberSchema> & Document;
export default mongoose.model<IWorkspaceMember>("WorkspaceMember", workspaceMemberSchema);