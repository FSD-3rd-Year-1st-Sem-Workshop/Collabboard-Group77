import { Request, Response, NextFunction, CookieOptions } from "express";
import env from "../config/Env.js";
import { sendSuccess } from "../utils/Response.js";
import { AppError } from "../utils/AppError.js";
import {
  registerUser,
  loginUser,
  refreshUserTokens,
  revokeRefreshToken,
  revokeAllUserTokens,
  getUserById
} from "../services/Auth.service.js";

const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSameSite,
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

function getRefreshToken(req: Request): string | undefined {
  const fromCookie = req.cookies?.[REFRESH_COOKIE_NAME];
  const fromBody = req.body?.refreshToken;

  return fromCookie || fromBody;
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions);
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: "/api/auth"
  });
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const user = await registerUser(req.body);

    return sendSuccess(
      res,
      { user },
      201,
      "Account created successfully"
    );
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password, {
      userAgent: req.get("user-agent"),
      ipAddress: req.ip
    });

    setRefreshCookie(res, result.refreshToken);

    return sendSuccess(
      res,
      {
        accessToken: result.accessToken,
        user: result.user
      },
      200,
      "Login successful"
    );
  } catch (error) {
    next(error);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const refreshToken = getRefreshToken(req);

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    const result = await refreshUserTokens(refreshToken, {
      userAgent: req.get("user-agent"),
      ipAddress: req.ip
    });

    setRefreshCookie(res, result.refreshToken);

    return sendSuccess(
      res,
      {
        accessToken: result.accessToken,
        user: result.user
      },
      200,
      "Token refreshed"
    );
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const refreshToken = getRefreshToken(req);

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    clearRefreshCookie(res);

    return sendSuccess(
      res,
      null,
      200,
      "Logged out successfully"
    );
  } catch (error) {
    next(error);
  }
}

export async function logoutAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    if (!req.userId) {
      throw new AppError("Authentication required", 401);
    }

    await revokeAllUserTokens(req.userId);

    clearRefreshCookie(res);

    return sendSuccess(
      res,
      null,
      200,
      "Logged out from all sessions"
    );
  } catch (error) {
    next(error);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    if (!req.userId) {
      throw new AppError("Authentication required", 401);
    }

    const user = await getUserById(req.userId);

    return sendSuccess(
      res,
      { user },
      200,
      "Profile fetched successfully"
    );
  } catch (error) {
    next(error);
  }
}
