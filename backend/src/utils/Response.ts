import { Response } from "express";

export type SuccessPayload = unknown;

export function sendSuccess(
  res: Response,
  data: SuccessPayload,
  status = 200,
  message?: string
): Response {
  return res.status(status).json({
    success: true,
    message,
    data
  });
}

export function sendError(
  res: Response,
  status: number,
  message: string,
  errors?: unknown
): Response {
  const body: { success: false; message: string; errors?: unknown } = {
    success: false,
    message
  };

  if (errors) {
    body.errors = errors;
  }

  return res.status(status).json(body);
}
