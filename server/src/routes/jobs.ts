import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { Forbidden, NotFound } from "../lib/errors.js";
import { createJobSchema, listJobsQuerySchema, updateJobSchema } from "../schemas/job.js";
import { paginatedResponse } from "../schemas/common.js";
import { upsertSkills } from "../lib/skills.js";

const router = Router();

const JOB_INCLUDE = {
  client: {
    select: { id: true, name: true, avatar: true, university: true },
  },
  skills: { select: { skill: { select: { name: true } } } },
  _count: { select: { proposals: true } },
} satisfies Prisma.JobInclude;

function formatJob(j: Prisma.JobGetPayload<{ include: typeof JOB_INCLUDE }>) {
  return {
    id: j.id,
    title: j.title,
    description: j.description,
    category: j.category,
    budgetType: j.budgetType,
    budgetAmount: j.budgetAmount,
    deadline: j.deadline,
    status: j.status,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
    client: j.client,
    skills: j.skills.map((s) => s.skill.name),
    proposalCount: j._count.proposals,
  };
}

// ------------------------- GET /api/jobs -------------------------
router.get("/", optionalAuth, validate(listJobsQuerySchema, "query"), async (req, res, next) => {
  try {
    const q = req.query as unknown as import("zod").infer<typeof listJobsQuerySchema>;

    const where: Prisma.JobWhereInput = {
      ...(q.status ? { status: q.status } : { status: "OPEN" }),
      ...(q.category && { category: { equals: q.category, mode: "insensitive" } }),
      ...(q.budgetType && { budgetType: q.budgetType }),
      ...(q.clientId && { clientId: q.clientId }),
      ...((q.minBudget !== undefined || q.maxBudget !== undefined) && {
        budgetAmount: {
          ...(q.minBudget !== undefined && { gte: q.minBudget }),
          ...(q.maxBudget !== undefined && { lte: q.maxBudget }),
        },
      }),
      ...(q.q && {
        OR: [
          { title: { contains: q.q, mode: "insensitive" } },
          { description: { contains: q.q, mode: "insensitive" } },
        ],
      }),
      ...(q.skill && {
        skills: { some: { skill: { name: { equals: q.skill, mode: "insensitive" } } } },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: JOB_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.job.count({ where }),
    ]);

    res.json(paginatedResponse(items.map(formatJob), total, q.page, q.limit));
  } catch (err) {
    next(err);
  }
});

// ------------------------- GET /api/jobs/:id -------------------------
router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: JOB_INCLUDE,
    });
    if (!job) throw NotFound("Job not found");
    res.json(formatJob(job));
  } catch (err) {
    next(err);
  }
});

// ------------------------- POST /api/jobs -------------------------
router.post("/", requireAuth, validate(createJobSchema), async (req, res, next) => {
  try {
    const input = req.body as import("zod").infer<typeof createJobSchema>;
    const skillIds = input.skills ? await upsertSkills(input.skills) : [];
    const job = await prisma.job.create({
      data: {
        clientId: req.user!.sub,
        title: input.title,
        description: input.description,
        category: input.category,
        budgetType: input.budgetType,
        budgetAmount: input.budgetAmount,
        deadline: input.deadline,
        skills: { create: skillIds.map((skillId) => ({ skillId })) },
      },
      include: JOB_INCLUDE,
    });
    res.status(201).json(formatJob(job));
  } catch (err) {
    next(err);
  }
});

// ------------------------- PATCH /api/jobs/:id -------------------------
router.patch("/:id", requireAuth, validate(updateJobSchema), async (req, res, next) => {
  try {
    const existing = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existing) throw NotFound("Job not found");
    if (existing.clientId !== req.user!.sub) throw Forbidden("You can only edit your own jobs");

    const input = req.body as import("zod").infer<typeof updateJobSchema>;
    const { skills, ...rest } = input;

    if (skills) {
      const skillIds = await upsertSkills(skills);
      await prisma.jobSkill.deleteMany({ where: { jobId: existing.id } });
      if (skillIds.length > 0) {
        await prisma.jobSkill.createMany({
          data: skillIds.map((skillId) => ({ jobId: existing.id, skillId })),
          skipDuplicates: true,
        });
      }
    }

    const updated = await prisma.job.update({
      where: { id: existing.id },
      data: rest,
      include: JOB_INCLUDE,
    });
    res.json(formatJob(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
