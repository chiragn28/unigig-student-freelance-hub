import { Router } from "express";
import crypto from "node:crypto";
import rateLimit from "express-rate-limit";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../db.js";
import { env } from "../config.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
  ttlToDate,
} from "../lib/jwt.js";
import { sendVerificationEmail } from "../lib/email.js";
import { BadRequest, Conflict, Forbidden, NotFound, Unauthorized } from "../lib/errors.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import {
  signupSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
  googleLoginSchema,
} from "../schemas/auth.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "TOO_MANY_REQUESTS", message: "Too many auth requests" } },
});

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function publicUser(u: {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  university: string | null;
  major: string | null;
  gradYear: number | null;
  headline: string | null;
  bio: string | null;
  hourlyRate: number | null;
  avatar: string | null;
  authProvider: string;
}) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    emailVerified: u.emailVerified,
    university: u.university,
    major: u.major,
    gradYear: u.gradYear,
    headline: u.headline,
    bio: u.bio,
    hourlyRate: u.hourlyRate,
    avatar: u.avatar,
    authProvider: u.authProvider,
  };
}

async function issueTokens(userId: string, email: string, role: string) {
  // Create the DB row first so we can embed its id as the jti.
  const refreshRow = await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: "PENDING",
      expiresAt: ttlToDate(env.JWT_REFRESH_TTL),
    },
  });

  const accessToken = signAccessToken({ sub: userId, email, role });
  const refreshToken = signRefreshToken({ sub: userId, jti: refreshRow.id });

  await prisma.refreshToken.update({
    where: { id: refreshRow.id },
    data: { tokenHash: hashRefreshToken(refreshToken) },
  });

  return { accessToken, refreshToken };
}

// ------------------------- POST /api/auth/signup -------------------------
router.post("/signup", authLimiter, validate(signupSchema), async (req, res, next) => {
  try {
    const input = req.body as import("../schemas/auth.js").SignupInput;

    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw Conflict("An account with this email already exists");

    const passwordHash = await hashPassword(input.password);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: passwordHash,
        name: input.name,
        university: input.university,
        major: input.major,
        gradYear: input.gradYear,
        role: input.role,
        authProvider: "LOCAL",
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: new Date(Date.now() + VERIFY_TOKEN_TTL_MS),
      },
    });

    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.status(201).json({
      user: publicUser(user),
      message: env.EMAIL_VERIFICATION_REQUIRED
        ? "Account created. Check your email to verify and then log in."
        : "Account created.",
    });
  } catch (err) {
    next(err);
  }
});

// ------------------------- POST /api/auth/login -------------------------
router.post("/login", authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) throw Unauthorized("Invalid email or password");

    const ok = await verifyPassword(password, user.password);
    if (!ok) throw Unauthorized("Invalid email or password");

    if (env.EMAIL_VERIFICATION_REQUIRED && !user.emailVerified) {
      throw Forbidden("Please verify your email before logging in.");
    }

    const tokens = await issueTokens(user.id, user.email, user.role);
    res.json({ user: publicUser(user), ...tokens });
  } catch (err) {
    next(err);
  }
});

// ------------------------- POST /api/auth/verify-email -------------------------
router.post("/verify-email", authLimiter, validate(verifyEmailSchema), async (req, res, next) => {
  try {
    const { token } = req.body as { token: string };
    const user = await prisma.user.findUnique({ where: { emailVerificationToken: token } });
    if (!user) throw BadRequest("Invalid or already-used verification token");
    if (user.emailVerificationExpiresAt && user.emailVerificationExpiresAt < new Date()) {
      throw BadRequest("Verification token expired. Request a new one.");
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    });
    res.json({ message: "Email verified. You can now log in.", email: user.email });
  } catch (err) {
    next(err);
  }
});

// ------------------------- POST /api/auth/refresh -------------------------
router.post("/refresh", validate(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw Unauthorized("Invalid refresh token");
    }

    const row = await prisma.refreshToken.findUnique({ where: { id: payload.jti } });
    if (!row || row.revokedAt) throw Unauthorized("Refresh token revoked");
    if (row.expiresAt < new Date()) throw Unauthorized("Refresh token expired");
    if (row.tokenHash !== hashRefreshToken(refreshToken)) {
      // Token reuse detected → revoke all of this user's refresh tokens (defense)
      await prisma.refreshToken.updateMany({
        where: { userId: row.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw Unauthorized("Refresh token reuse detected; please log in again");
    }

    const user = await prisma.user.findUnique({ where: { id: row.userId } });
    if (!user) throw Unauthorized("User no longer exists");

    // Rotate: revoke the old, issue a new pair
    await prisma.refreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    });
    const tokens = await issueTokens(user.id, user.email, user.role);
    res.json({ ...tokens, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// ------------------------- POST /api/auth/logout -------------------------
router.post("/logout", validate(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    try {
      const payload = verifyRefreshToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { id: payload.jti, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      /* swallow — logout is best-effort */
    }
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
});

// ------------------------- GET /api/auth/me -------------------------
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      include: {
        skills: { include: { skill: true } },
        portfolio: { orderBy: { order: "asc" } },
      },
    });
    if (!user) throw NotFound("User not found");
    res.json({
      ...publicUser(user),
      skills: user.skills.map((s) => s.skill.name),
      portfolio: user.portfolio.map((p) => ({ id: p.id, imageUrl: p.imageUrl, caption: p.caption })),
    });
  } catch (err) {
    next(err);
  }
});

// ------------------------- POST /api/auth/google (FEATURE-FLAGGED) -------------------------
// Disabled by default. Set GOOGLE_AUTH_ENABLED=true + GOOGLE_CLIENT_ID to enable.
// Client flow: user clicks "Sign in with Google" → frontend gets `credential` (ID token) →
// POSTs it here → server verifies → finds-or-creates user → issues our JWT pair.
router.post("/google", authLimiter, validate(googleLoginSchema), async (req, res, next) => {
  try {
    if (!env.GOOGLE_AUTH_ENABLED) {
      return res.status(503).json({
        error: {
          code: "FEATURE_DISABLED",
          message: "Google login is not enabled yet. Flip GOOGLE_AUTH_ENABLED=true in env to enable.",
        },
      });
    }
    if (!env.GOOGLE_CLIENT_ID) {
      throw BadRequest("Server is missing GOOGLE_CLIENT_ID");
    }

    const { credential } = req.body as { credential: string };
    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      throw Unauthorized("Invalid Google credential");
    }

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId: payload.sub }, { email: payload.email }] },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name ?? payload.email.split("@")[0],
          avatar: payload.picture ?? null,
          authProvider: "GOOGLE",
          googleId: payload.sub,
          emailVerified: !!payload.email_verified,
        },
      });
    } else if (!user.googleId) {
      // Existing local user logging in with Google for the first time → link accounts
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: payload.sub,
          emailVerified: user.emailVerified || !!payload.email_verified,
          avatar: user.avatar ?? payload.picture ?? null,
        },
      });
    }

    const tokens = await issueTokens(user.id, user.email, user.role);
    res.json({ user: publicUser(user), ...tokens });
  } catch (err) {
    next(err);
  }
});

export default router;
