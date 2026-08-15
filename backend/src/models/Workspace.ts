import mongoose, { Schema, Document, InferSchemaType } from "mongoose";

const workspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      maxlength: 500,
      default: "",
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    logo: {
      type: String,
      default: null,
    },

    color: {
      type: String,
      default: "#2563EB",
    },

    visibility: {
      type: String,
      enum: ["private", "team"],
      default: "private",
    },

    archived: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

workspaceSchema.index({ owner: 1 });

export type IWorkspace = InferSchemaType<typeof workspaceSchema> & Document;
export default mongoose.model<IWorkspace>("Workspace", workspaceSchema);