import { prisma } from "../db.js";

export function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Upsert skills by name and return their ids.
export async function upsertSkills(names: string[]): Promise<string[]> {
  const unique = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
  if (unique.length === 0) return [];
  const created = await Promise.all(
    unique.map((name) =>
      prisma.skill.upsert({
        where: { slug: slugify(name) },
        create: { name, slug: slugify(name) },
        update: {},
      }),
    ),
  );
  return created.map((s) => s.id);
}
