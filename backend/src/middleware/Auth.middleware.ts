import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import env from "../config/Env.js";

interface TokenPayload {
  sub: string;
  type: string;
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.split(" ")[1];
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const payload = jwt.verify(token, env.jwtAccessSecret) as TokenPayload;

    if (payload.type !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token"
      });
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active"
      });
    }

    req.user = {
      id: user._id.toString(),
      fullName: user.fullName as string,
      email: user.email as string,
      avatar: user.avatar as string | null
    };

    req.userId = user._id.toString();

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Access token expired"
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token"
    });
  }
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractBearerToken(req);

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as TokenPayload;

    if (payload.type === "access") {
      const user = await User.findById(payload.sub);

      if (user && user.status === "active") {
        req.user = {
          id: user._id.toString(),
          fullName: user.fullName as string,
          email: user.email as string,
          avatar: user.avatar as string | null
        };
        req.userId = user._id.toString();
      }
    }
  } catch {
    // Invalid token is ignored for optional auth
  }

  next();
}
