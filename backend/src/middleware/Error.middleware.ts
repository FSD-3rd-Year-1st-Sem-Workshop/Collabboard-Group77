import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import env from "../config/Env.js";

interface MongoServerError extends Error {
  name: "MongoServerError";
  code?: number;
  keyPattern?: Record<string, unknown>;
}

function normalizeMongooseErrors(error: mongoose.Error.ValidationError): string[] | undefined {
  if (error.errors) {
    return Object.values(error.errors).map(
      (err) => err.message
    );
  }

  return undefined;
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response | void {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";
  let errors = error.errors;

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    errors = normalizeMongooseErrors(error);
    message = "Validation failed";
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid identifier format";
  } else if (error.name === "MongoServerError" && (error as MongoServerError).code === 11000) {
    statusCode = 409;
    const field = Object.keys((error as MongoServerError).keyPattern || {})[0] || "field";
    message = `Duplicate value for ${field}`;
  } else if (error instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token";
  } else if (error instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = "Token expired";
  } else if (statusCode >= 500) {
    console.error(error);
  }

  if (env.isProduction && statusCode >= 500) {
    message = "Internal server error";
  }

  const body: { success: boolean; message: string; errors?: any } = {
    success: false,
    message
  };

  if (errors) {
    body.errors = errors;
  }

  return res.status(statusCode).json(body);
}
