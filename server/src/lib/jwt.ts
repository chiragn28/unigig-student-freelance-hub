import jwt, { type SignOptions } from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config.js";

export interface AccessTokenPayload {
  sub: string;        // user id
  email: string;
  role: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

// Refresh tokens: opaque random strings stored hashed in DB.
// We sign a JWT wrapper for compactness, but rotation/revocation is keyed on the DB row.
export interface RefreshTokenPayload {
  sub: string;
  jti: string;  // matches the RefreshToken.id row in DB
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL,
  } as SignOptions);
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Parse a TTL string like "30d", "15m" into a Date in the future.
export function ttlToDate(ttl: string): Date {
  const match = ttl.match(/^(\d+)([smhd])$/);
  if (!match) {
    // Fallback: treat as milliseconds
    return new Date(Date.now() + Number(ttl));
  }
  const n = Number(match[1]);
  const unit = match[2];
  const ms =
    unit === "s" ? n * 1000 :
    unit === "m" ? n * 60_000 :
    unit === "h" ? n * 3_600_000 :
    n * 86_400_000;
  return new Date(Date.now() + ms);
}
