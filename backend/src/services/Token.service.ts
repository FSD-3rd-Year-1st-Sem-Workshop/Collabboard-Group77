import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/Env.js";

export interface AccessTokenPayload extends jwt.JwtPayload {
  sub: string;
  type: string;
}

export interface RefreshTokenPayload extends jwt.JwtPayload {
  sub: string;
  type: string;
  jti: string;
}

export function generateAccessToken(user: { _id?: any; id?: string }): string {
  const userId = user._id ? user._id.toString() : user.id;
  if (!userId) {
    throw new Error("User ID is required to generate access token");
  }
  return jwt.sign(
    {
      sub: userId,
      type: "access"
    },
    env.jwtAccessSecret,
    {
      expiresIn: env.jwtAccessExpiresIn as any
    }
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;

  if (payload.type !== "access") {
    throw new jwt.JsonWebTokenError("Not an access token");
  }

  return payload;
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function signRefreshToken(user: { _id?: any; id?: string }): string {
  const userId = user._id ? user._id.toString() : user.id;
  if (!userId) {
    throw new Error("User ID is required to generate refresh token");
  }
  return jwt.sign(
    {
      sub: userId,
      type: "refresh",
      jti: crypto.randomUUID()
    },
    env.jwtRefreshSecret,
    {
      expiresIn: env.jwtRefreshExpiresIn as any
    }
  );
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;

  if (payload.type !== "refresh") {
    throw new jwt.JsonWebTokenError("Not a refresh token");
  }

  return payload;
}
