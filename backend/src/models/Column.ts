import mongoose, { Schema, Document, InferSchemaType } from "mongoose";

const columnSchema = new Schema(
  {
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: [true, "Board ID is required"],
      index: true,
    },

    name: {
      type: String,
      required: [true, "Column name is required"],
      trim: true,
      maxlength: [50, "Column name cannot exceed 50 characters"],
    },

    description: {
      type: String,
      maxlength: [250, "Description cannot exceed 250 characters"],
      default: "",
    },

    color: {
      type: String,
      default: "#64748B",
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please provide a valid Hex color code"],
    },

    position: {
      type: Number,
      required: [true, "Column order position is required"],
      min: [0, "Position cannot be negative"],
    },

    taskLimit: {
      type: Number,
      default: 0,
      min: [0, "Task limit cannot be negative"],
    },

    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
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

columnSchema.index({ board: 1, position: 1 });
columnSchema.index({ board: 1, name: 1 }, { unique: true });

export type IColumn = InferSchemaType<typeof columnSchema> & Document;
export default mongoose.model<IColumn>("Column", columnSchema);