import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { BadRequest, Conflict, Forbidden, NotFound } from "../lib/errors.js";
import {
  createProposalSchema,
  listProposalsQuerySchema,
  updateProposalSchema,
} from "../schemas/proposal.js";
import { paginatedResponse } from "../schemas/common.js";

const router = Router();

const PROPOSAL_INCLUDE = {
  job: {
    select: {
      id: true,
      title: true,
      category: true,
      budgetType: true,
      budgetAmount: true,
      clientId: true,
      status: true,
    },
  },
  freelancer: {
    select: { id: true, name: true, avatar: true, university: true, headline: true, hourlyRate: true },
  },
} satisfies Prisma.ProposalInclude;

function formatProposal(p: Prisma.ProposalGetPayload<{ include: typeof PROPOSAL_INCLUDE }>) {
  return {
    id: p.id,
    jobId: p.jobId,
    freelancerId: p.freelancerId,
    coverLetter: p.coverLetter,
    bidAmount: p.bidAmount,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    job: p.job,
    freelancer: p.freelancer,
  };
}

// ------------------------- POST /api/proposals -------------------------
router.post("/", requireAuth, validate(createProposalSchema), async (req, res, next) => {
  try {
    const input = req.body as import("zod").infer<typeof createProposalSchema>;
    const job = await prisma.job.findUnique({ where: { id: input.jobId } });
    if (!job) throw NotFound("Job not found");
    if (job.status !== "OPEN") throw BadRequest("Job is not accepting proposals");
    if (job.clientId === req.user!.sub) {
      throw BadRequest("You cannot submit a proposal to your own job");
    }
    const existing = await prisma.proposal.findUnique({
      where: { jobId_freelancerId: { jobId: input.jobId, freelancerId: req.user!.sub } },
    });
    if (existing) throw Conflict("You already submitted a proposal for this job");

    const proposal = await prisma.proposal.create({
      data: {
        jobId: input.jobId,
        freelancerId: req.user!.sub,
        coverLetter: input.coverLetter,
        bidAmount: input.bidAmount,
      },
      include: PROPOSAL_INCLUDE,
    });
    res.status(201).json(formatProposal(proposal));
  } catch (err) {
    next(err);
  }
});

// ------------------------- GET /api/proposals/mine -------------------------
// Proposals the current user has submitted as a freelancer.
router.get("/mine", requireAuth, validate(listProposalsQuerySchema, "query"), async (req, res, next) => {
  try {
    const q = req.query as unknown as import("zod").infer<typeof listProposalsQuerySchema>;
    const where: Prisma.ProposalWhereInput = {
      freelancerId: req.user!.sub,
      ...(q.jobId && { jobId: q.jobId }),
      ...(q.status && { status: q.status }),
    };
    const [items, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        include: PROPOSAL_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.proposal.count({ where }),
    ]);
    res.json(paginatedResponse(items.map(formatProposal), total, q.page, q.limit));
  } catch (err) {
    next(err);
  }
});

// ------------------------- GET /api/proposals?jobId=... -------------------------
// For clients viewing proposals on their own jobs.
router.get("/", requireAuth, validate(listProposalsQuerySchema, "query"), async (req, res, next) => {
  try {
    const q = req.query as unknown as import("zod").infer<typeof listProposalsQuerySchema>;
    if (!q.jobId) throw BadRequest("jobId is required");

    const job = await prisma.job.findUnique({ where: { id: q.jobId } });
    if (!job) throw NotFound("Job not found");
    if (job.clientId !== req.user!.sub) throw Forbidden("You can only view proposals on your own jobs");

    const where: Prisma.ProposalWhereInput = {
      jobId: q.jobId,
      ...(q.status && { status: q.status }),
    };
    const [items, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        include: PROPOSAL_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.proposal.count({ where }),
    ]);
    res.json(paginatedResponse(items.map(formatProposal), total, q.page, q.limit));
  } catch (err) {
    next(err);
  }
});

// ------------------------- PATCH /api/proposals/:id -------------------------
// Freelancer can update their own (cover/bid/withdraw). Client can accept/reject.
router.patch("/:id", requireAuth, validate(updateProposalSchema), async (req, res, next) => {
  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });
    if (!proposal) throw NotFound("Proposal not found");

    const input = req.body as import("zod").infer<typeof updateProposalSchema>;
    const isFreelancer = proposal.freelancerId === req.user!.sub;
    const isClient = proposal.job.clientId === req.user!.sub;
    if (!isFreelancer && !isClient) throw Forbidden();

    // Authorization: who can change what
    if (input.coverLetter !== undefined || input.bidAmount !== undefined) {
      if (!isFreelancer) throw Forbidden("Only the freelancer can edit cover letter / bid");
    }
    if (input.status) {
      const allowedForFreelancer = ["WITHDRAWN"];
      const allowedForClient = ["ACCEPTED", "REJECTED"];
      if (isFreelancer && !allowedForFreelancer.includes(input.status)) {
        throw Forbidden(`Freelancer can only set status to: ${allowedForFreelancer.join(", ")}`);
      }
      if (isClient && !allowedForClient.includes(input.status)) {
        throw Forbidden(`Client can only set status to: ${allowedForClient.join(", ")}`);
      }
    }

    const updated = await prisma.proposal.update({
      where: { id: proposal.id },
      data: input,
      include: PROPOSAL_INCLUDE,
    });

    // If accepted → create contract, mark job in-progress, reject other proposals.
    if (input.status === "ACCEPTED") {
      await prisma.$transaction([
        prisma.contract.create({
          data: {
            jobId: proposal.jobId,
            freelancerId: proposal.freelancerId,
            clientId: proposal.job.clientId,
          },
        }),
        prisma.job.update({
          where: { id: proposal.jobId },
          data: { status: "IN_PROGRESS" },
        }),
        prisma.proposal.updateMany({
          where: { jobId: proposal.jobId, id: { not: proposal.id }, status: "PENDING" },
          data: { status: "REJECTED" },
        }),
      ]);
    }

    res.json(formatProposal(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
