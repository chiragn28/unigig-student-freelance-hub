import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { NotFound } from "../lib/errors.js";
import { listUsersQuerySchema, updateMeSchema } from "../schemas/user.js";
import { paginatedResponse } from "../schemas/common.js";
import { upsertSkills } from "../lib/skills.js";

const router = Router();

const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  avatar: true,
  university: true,
  major: true,
  gradYear: true,
  headline: true,
  bio: true,
  hourlyRate: true,
  role: true,
  emailVerified: true,
  createdAt: true,
  skills: { select: { skill: { select: { name: true } } } },
} satisfies Prisma.UserSelect;

function formatUser(u: Prisma.UserGetPayload<{ select: typeof PUBLIC_USER_SELECT }>) {
  return {
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    university: u.university,
    major: u.major,
    gradYear: u.gradYear,
    headline: u.headline,
    bio: u.bio,
    hourlyRate: u.hourlyRate,
    role: u.role,
    skills: u.skills.map((s) => s.skill.name),
    createdAt: u.createdAt,
  };
}

// ------------------------- GET /api/users -------------------------
// Lists users (freelancers). Filters: q, category, skill, university, role, minRate, maxRate.
router.get("/", optionalAuth, validate(listUsersQuerySchema, "query"), async (req, res, next) => {
  try {
    const q = req.query as unknown as import("zod").infer<typeof listUsersQuerySchema>;

    const where: Prisma.UserWhereInput = {
      emailVerified: true,
      role: q.role ? q.role : { in: ["WORK", "BOTH"] },
      ...(q.q && {
        OR: [
          { name: { contains: q.q, mode: "insensitive" } },
          { headline: { contains: q.q, mode: "insensitive" } },
          { bio: { contains: q.q, mode: "insensitive" } },
          { university: { contains: q.q, mode: "insensitive" } },
        ],
      }),
      ...(q.university && { university: { contains: q.university, mode: "insensitive" } }),
      ...(q.skill && {
        skills: { some: { skill: { name: { equals: q.skill, mode: "insensitive" } } } },
      }),
      ...((q.minRate !== undefined || q.maxRate !== undefined) && {
        hourlyRate: {
          ...(q.minRate !== undefined && { gte: q.minRate }),
          ...(q.maxRate !== undefined && { lte: q.maxRate }),
        },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: PUBLIC_USER_SELECT,
        orderBy: { createdAt: "desc" },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json(paginatedResponse(items.map(formatUser), total, q.page, q.limit));
  } catch (err) {
    next(err);
  }
});

// ------------------------- GET /api/users/:id -------------------------
router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        ...PUBLIC_USER_SELECT,
        portfolio: { select: { id: true, imageUrl: true, caption: true }, orderBy: { order: "asc" } },
      },
    });
    if (!user) throw NotFound("User not found");
    res.json({ ...formatUser(user), portfolio: user.portfolio });
  } catch (err) {
    next(err);
  }
});

// ------------------------- PATCH /api/users/me -------------------------
router.patch("/me", requireAuth, validate(updateMeSchema), async (req, res, next) => {
  try {
    const input = req.body as import("zod").infer<typeof updateMeSchema>;
    const { skills, ...rest } = input;

    if (skills) {
      const skillIds = await upsertSkills(skills);
      // Replace the user's skill set
      await prisma.userSkill.deleteMany({ where: { userId: req.user!.sub } });
      if (skillIds.length > 0) {
        await prisma.userSkill.createMany({
          data: skillIds.map((skillId) => ({ userId: req.user!.sub, skillId })),
          skipDuplicates: true,
        });
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user!.sub },
      data: rest,
      select: PUBLIC_USER_SELECT,
    });
    res.json(formatUser(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
