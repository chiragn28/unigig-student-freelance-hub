import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  name: z.string().min(1).max(120).trim(),
  university: z.string().max(200).trim().optional(),
  major: z.string().max(120).trim().optional(),
  gradYear: z.number().int().min(1900).max(2100).optional(),
  role: z.enum(["HIRE", "WORK", "BOTH"]).default("BOTH"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const googleLoginSchema = z.object({
  // Google ID token (JWT) obtained from @react-oauth/google or Google Identity Services
  // on the client. The server verifies it via google-auth-library.
  credential: z.string().min(1),
});
