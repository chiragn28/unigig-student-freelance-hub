import { z } from "zod";
import { paginationSchema } from "./common.js";

export const listUsersQuerySchema = paginationSchema.extend({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),     // matches against headline/skills loosely
  skill: z.string().trim().optional(),
  university: z.string().trim().optional(),
  role: z.enum(["HIRE", "WORK", "BOTH"]).optional(),
  minRate: z.coerce.number().int().nonnegative().optional(),
  maxRate: z.coerce.number().int().positive().optional(),
});

export const updateMeSchema = z.object({
  name: z.string().min(1).max(120).trim().optional(),
  university: z.string().max(200).trim().optional(),
  major: z.string().max(120).trim().optional(),
  gradYear: z.number().int().min(1900).max(2100).optional(),
  headline: z.string().max(200).trim().optional(),
  bio: z.string().max(2000).trim().optional(),
  hourlyRate: z.number().int().nonnegative().max(10_000).optional(),
  avatar: z.string().url().optional(),
  role: z.enum(["HIRE", "WORK", "BOTH"]).optional(),
  skills: z.array(z.string().min(1).max(40).trim()).max(30).optional(),
});
