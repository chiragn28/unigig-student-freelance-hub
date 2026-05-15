import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { env, corsOrigins, isDev } from "./config.js";
import { notFoundHandler, errorHandler } from "./middleware/error.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import jobRoutes from "./routes/jobs.js";
import proposalRoutes from "./routes/proposals.js";
import uploadRoutes from "./routes/uploads.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (corsOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  }),
);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
if (isDev) app.use(morgan("dev"));

// Global rate limit (auth routes have a stricter limit applied locally)
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Static serve for local uploads (in prod, switch STORAGE_DRIVER=s3)
app.use("/uploads", express.static(path.resolve(env.STORAGE_LOCAL_DIR)));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  /* eslint-disable no-console */
  console.log(`\n  ➜  unigig API listening on http://localhost:${env.PORT}`);
  console.log(`     env:      ${env.NODE_ENV}`);
  console.log(`     CORS:     ${corsOrigins.join(", ")}`);
  console.log(`     email:    ${env.EMAIL_PROVIDER}${env.EMAIL_VERIFICATION_REQUIRED ? " (verification REQUIRED)" : ""}`);
  console.log(`     storage:  ${env.STORAGE_DRIVER}`);
  console.log(`     google:   ${env.GOOGLE_AUTH_ENABLED ? "enabled" : "disabled (set GOOGLE_AUTH_ENABLED=true to enable)"}\n`);
  /* eslint-enable no-console */
});

// Graceful shutdown
const shutdown = (signal: string) => {
  // eslint-disable-next-line no-console
  console.log(`\nReceived ${signal}, shutting down gracefully...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
