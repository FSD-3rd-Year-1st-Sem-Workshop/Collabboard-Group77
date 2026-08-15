import mongoose, { Schema, Document, InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "FullName is required"],
      lowercase: true,
      trim: true,
      minlength: [6, "fullName must be at least 6 characters"],
      maxlength: [60, "fullName cannot exceed 60 characters"],
      index: true,
    },

    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please provide a valid email address",
      ],
    },

    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    avatar: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    lastSeen: {
      type: Date,
      default: null,
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

export type IUser = InferSchemaType<typeof userSchema> & Document;
export default mongoose.model<IUser>("User", userSchema);