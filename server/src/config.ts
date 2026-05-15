import "dotenv/config";
import { z } from "zod";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env files in the conventional precedence order. Process env wins.
const NODE_ENV = process.env.NODE_ENV ?? "development";
loadEnv({ path: path.resolve(__dirname, `../.env.${NODE_ENV}`), override: false });
loadEnv({ path: path.resolve(__dirname, "../.env"), override: false });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 chars"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 chars"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),

  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:5173"),

  EMAIL_VERIFICATION_REQUIRED: z
    .string()
    .default("true")
    .transform((v) => v.toLowerCase() === "true"),
  EMAIL_FROM: z.string().default("noreply@unigig.local"),
  APP_URL: z.string().default("http://localhost:3000"),
  EMAIL_PROVIDER: z.enum(["console", "resend", "sendgrid"]).default("console"),
  RESEND_API_KEY: z.string().optional(),

  GOOGLE_AUTH_ENABLED: z
    .string()
    .default("false")
    .transform((v) => v.toLowerCase() === "true"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  STORAGE_LOCAL_DIR: z.string().default("uploads"),
  STORAGE_PUBLIC_URL: z.string().default("http://localhost:4000/uploads"),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean);

export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";
