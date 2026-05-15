import { z } from "zod";
import { paginationSchema } from "./common.js";

export const listJobsQuerySchema = paginationSchema.extend({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  skill: z.string().trim().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  budgetType: z.enum(["FIXED", "HOURLY", "MONTHLY"]).optional(),
  minBudget: z.coerce.number().int().nonnegative().optional(),
  maxBudget: z.coerce.number().int().positive().optional(),
  clientId: z.string().uuid().optional(),
});

export const createJobSchema = z.object({
  title: z.string().min(5).max(200).trim(),
  description: z.string().min(20).max(5000).trim(),
  category: z.string().min(1).max(60).trim(),
  budgetType: z.enum(["FIXED", "HOURLY", "MONTHLY"]),
  budgetAmount: z.number().int().positive().max(1_000_000),
  deadline: z.coerce.date().optional(),
  skills: z.array(z.string().min(1).max(40).trim()).max(15).optional(),
});

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
});
