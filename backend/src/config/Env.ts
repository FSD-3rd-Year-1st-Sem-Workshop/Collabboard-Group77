import dotenv from "dotenv";

dotenv.config();

const requiredSecrets = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"] as const;

function getSecret(key: (typeof requiredSecrets)[number]): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}`
    );
  }

  return value;
}

export type NodeEnv = "development" | "test" | "production";

export const env = {
  nodeEnv:
    (process.env.NODE_ENV === "production"
      ? "production"
      : process.env.NODE_ENV === "test"
      ? "test"
      : "development") as NodeEnv,
  port: Number(process.env.PORT) || 5000,
  mongoUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/collabboard",
  jwtAccessSecret: getSecret("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: getSecret("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  cookieSecure: process.env.COOKIE_SECURE === "true",
  cookieSameSite: (process.env.COOKIE_SAME_SITE ||
    "lax") as "lax" | "strict" | "none",
  isProduction: process.env.NODE_ENV === "production"
};

export default env;
