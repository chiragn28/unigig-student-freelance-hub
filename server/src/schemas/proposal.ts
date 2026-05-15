import { z } from "zod";
import { paginationSchema } from "./common.js";

export const createProposalSchema = z.object({
  jobId: z.string().uuid(),
  coverLetter: z.string().min(20).max(3000).trim(),
  bidAmount: z.number().int().positive().max(1_000_000),
});

export const updateProposalSchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"]).optional(),
  coverLetter: z.string().min(20).max(3000).trim().optional(),
  bidAmount: z.number().int().positive().max(1_000_000).optional(),
});

export const listProposalsQuerySchema = paginationSchema.extend({
  jobId: z.string().uuid().optional(),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"]).optional(),
});
