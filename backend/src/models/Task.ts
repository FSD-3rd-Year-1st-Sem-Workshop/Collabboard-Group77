import mongoose, { Schema, Document, InferSchemaType } from "mongoose";

const taskSchema = new Schema(
  {
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },

    column: {
      type: Schema.Types.ObjectId,
      ref: "Column",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      maxlength: 5000,
      default: "",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    labels: [
      {
        type: String,
        trim: true,
        maxlength: 30,
      },
    ],

    dueDate: {
      type: Date,
      default: null,
    },

    estimatedHours: {
      type: Number,
      min: 0,
      default: null,
    },

    position: {
      type: Number,
      required: true,
      default: 0,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    archived: {
      type: Boolean,
      default: false,
    },

    archivedAt: {
      type: Date,
      default: null,
    },

    version: {
      type: Number,
      default: 0,
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
    },
  }
);

taskSchema.index({ board: 1, column: 1, position: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ updatedAt: -1 });

export type ITask = InferSchemaType<typeof taskSchema> & Document;
export default mongoose.model<ITask>("Task", taskSchema);