import mongoose, { Schema, Document, InferSchemaType } from "mongoose";

const boardSchema = new Schema(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace ID is required"],
      index: true,
    },

    name: {
      type: String,
      required: [true, "Board name is required"],
      trim: true,
      maxlength: [100, "Board name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    color: {
      type: String,
      default: "#122857",
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please provide a valid Hex color code"],
    },

    icon: {
      type: String,
      default: null,
    },

    visibility: {
      type: String,
      enum: ["workspace", "private", "public"],
      default: "workspace",
    },

    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

boardSchema.index({ workspace: 1, name: 1 }, { unique: true });
boardSchema.index({ workspace: 1, status: 1 });

export type IBoard = InferSchemaType<typeof boardSchema> & Document;
export default mongoose.model<IBoard>("Board", boardSchema);