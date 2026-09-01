import User, { IUser } from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { AppError } from "../utils/AppError.js";
import env from "../config/Env.js";
import {
  hashPassword,
  comparePassword
} from "../utils/Password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken
} from "./Token.service.js";

function parseDuration(value: string): number {
  const match = /^(\d+)([smhdw])$/.exec(value);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = parseInt(match[1], 10);
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
    w: 604_800_000
  };

  const unit = match[2];
  return amount * (multipliers[unit] ?? 1000);
}

export interface SafeUser {
  id: any;
  fullName: string;
  email: string;
  avatar: string | null;
  bio: string;
  status: string;
  lastSeen: Date | null;
}

function toSafeUser(user: IUser): SafeUser {
  return {
    id: user._id,
    fullName: user.fullName as string,
    email: user.email as string,
    avatar: user.avatar as string | null,
    bio: (user.bio as string) ?? "",
    status: user.status as string,
    lastSeen: user.lastSeen as Date | null
  };
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password?: string;
  bio?: string;
}

export async function registerUser(data: RegisterInput): Promise<SafeUser> {
  const { fullName, email, password, bio } = data;

  if (!password) {
    throw new AppError("Password is required", 400);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    fullName,
    email,
    passwordHash,
    bio
  });

  return toSafeUser(user);
}

export interface SessionMetadata {
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface LoginResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export async function loginUser(
  email: string,
  password?: string,
  metadata?: SessionMetadata
): Promise<LoginResult> {
  if (!password) {
    throw new AppError("Password is required", 400);
  }

  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const validPassword = await comparePassword(password, user.passwordHash as string);

  if (!validPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.status !== "active") {
    throw new AppError("Account is not active", 403);
  }

  const accessToken = generateAccessToken(user);

  const refreshToken = await storeRefreshToken(
    user._id,
    metadata
  );

  user.lastSeen = new Date();
  await user.save();

  return {
    user: toSafeUser(user),
    accessToken,
    refreshToken
  };
}

async function storeRefreshToken(userId: any, metadata?: SessionMetadata): Promise<string> {
  const refreshToken = generateRefreshToken();

  await RefreshToken.create({
    user: userId,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: new Date(
      Date.now() + parseDuration(env.jwtRefreshExpiresIn)
    ),
    userAgent: metadata?.userAgent || null,
    ipAddress: metadata?.ipAddress || null
  });

  return refreshToken;
}

export async function refreshUserTokens(
  refreshToken: string,
  metadata?: SessionMetadata
): Promise<LoginResult> {
  const tokenHash = hashRefreshToken(refreshToken);

  const record = await RefreshToken.findOne({ tokenHash });

  if (!record) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (record.revokedAt) {
    throw new AppError("Refresh token has been revoked", 401);
  }

  if (record.expiresAt < new Date()) {
    throw new AppError("Refresh token has expired", 401);
  }

  const user = await User.findById(record.user as any).select("+passwordHash");

  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  if (user.status !== "active") {
    throw new AppError("Account is not active", 403);
  }

  const newRefreshToken = generateRefreshToken();

  record.revokedAt = new Date();
  record.replacedByTokenHash = hashRefreshToken(newRefreshToken);
  await record.save();

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashRefreshToken(newRefreshToken),
    expiresAt: new Date(
      Date.now() + parseDuration(env.jwtRefreshExpiresIn)
    ),
    userAgent: metadata?.userAgent || record.userAgent,
    ipAddress: metadata?.ipAddress || record.ipAddress
  });

  return {
    user: toSafeUser(user),
    accessToken: generateAccessToken(user),
    refreshToken: newRefreshToken
  };
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(refreshToken);

  const record = await RefreshToken.findOne({ tokenHash });

  if (!record || record.revokedAt) {
    return;
  }

  record.revokedAt = new Date();
  await record.save();
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await RefreshToken.updateMany(
    {
      user: userId,
      revokedAt: null
    },
    {
      revokedAt: new Date()
    }
  );
}

export async function getUserById(userId: string): Promise<SafeUser> {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return toSafeUser(user);
}

export interface UpdateProfileInput {
  fullName?: string;
  bio?: string;
  avatar?: string | null;
}

/** Update fields that belong to the currently authenticated user's public profile. */
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput
): Promise<SafeUser> {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (data.fullName !== undefined) user.fullName = data.fullName;
  if (data.bio !== undefined) user.bio = data.bio;
  if (data.avatar !== undefined) user.avatar = data.avatar;

  await user.save();

  return toSafeUser(user);
}

/**
 * Changes a password only after verifying the current password. All existing
 * sessions are revoked, then a fresh access/refresh-token pair is issued for
 * the session making this request.
 */
export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  metadata?: SessionMetadata
): Promise<LoginResult> {
  const user = await User.findById(userId).select("+passwordHash");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const currentPasswordMatches = await comparePassword(
    currentPassword,
    user.passwordHash as string
  );

  if (!currentPasswordMatches) {
    throw new AppError("Current password is incorrect", 401);
  }

  if (currentPassword === newPassword) {
    throw new AppError("New password must be different from the current password", 400);
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  await revokeAllUserTokens(user._id.toString());

  return {
    user: toSafeUser(user),
    accessToken: generateAccessToken(user),
    refreshToken: await storeRefreshToken(user._id, metadata)
  };
}
