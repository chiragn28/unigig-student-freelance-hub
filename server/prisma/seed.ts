/* eslint-disable no-console */
import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

const slug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const SEED_PASSWORD = "password123"; // dev only

// ~15 students. Mix of HIRE/WORK/BOTH. emailVerified=true so they can log in.
const studentSeeds: Array<{
  email: string;
  name: string;
  university: string;
  major: string;
  gradYear: number;
  headline: string;
  bio: string;
  hourlyRate: number;
  skills: string[];
  role: "HIRE" | "WORK" | "BOTH";
}> = [
  { email: "maya@stanford.edu", name: "Maya Chen", university: "Stanford University", major: "Computer Science", gradYear: 2026, headline: "Frontend Developer · React & TypeScript", bio: "CS senior at Stanford. Shipped frontends for two YC-backed startups during internships.", hourlyRate: 35, skills: ["React", "TypeScript", "Tailwind", "Next.js"], role: "BOTH" },
  { email: "jordan@nyu.edu", name: "Jordan Patel", university: "NYU", major: "Graphic Design", gradYear: 2025, headline: "Brand Identity & Logo Designer", bio: "Designed brands for 12+ student orgs and small businesses. Figma + Illustrator.", hourlyRate: 28, skills: ["Figma", "Illustrator", "Branding"], role: "WORK" },
  { email: "aiden@berkeley.edu", name: "Aiden Brooks", university: "UC Berkeley", major: "Mathematics", gradYear: 2026, headline: "Calculus & Stats Tutor", bio: "Math major with 60+ hours of tutoring experience. Patient and structured.", hourlyRate: 22, skills: ["Calculus", "Statistics", "SAT Math"], role: "WORK" },
  { email: "sofia@umich.edu", name: "Sofia Reyes", university: "University of Michigan", major: "English Literature", gradYear: 2025, headline: "Essay Editor & Copywriter", bio: "Published in two literary magazines. Strong on structure and clarity.", hourlyRate: 25, skills: ["Editing", "Copywriting", "SEO"], role: "WORK" },
  { email: "liam@usc.edu", name: "Liam O'Connor", university: "USC", major: "Film Production", gradYear: 2026, headline: "Video Editor for YouTube & TikTok", bio: "Cut content for creators with 1M+ combined subscribers.", hourlyRate: 30, skills: ["Premiere Pro", "After Effects", "Motion"], role: "WORK" },
  { email: "priya@mit.edu", name: "Priya Sharma", university: "MIT", major: "Data Science", gradYear: 2025, headline: "Python & ML Engineer", bio: "ML researcher at the MIT Media Lab. Open to side projects in PyTorch.", hourlyRate: 45, skills: ["Python", "PyTorch", "Pandas"], role: "WORK" },
  { email: "marcus@yale.edu", name: "Marcus Webb", university: "Yale", major: "Marketing", gradYear: 2026, headline: "Social Media Manager · IG & TikTok", bio: "Grew two student org accounts from 0 → 10k followers in a semester.", hourlyRate: 26, skills: ["Instagram", "TikTok", "Content"], role: "WORK" },
  { email: "hana@columbia.edu", name: "Hana Tanaka", university: "Columbia", major: "Architecture", gradYear: 2025, headline: "3D Modeling & Visualization", bio: "Blender + SketchUp for arch and product viz. Detail-obsessed.", hourlyRate: 38, skills: ["Blender", "SketchUp", "Rhino"], role: "WORK" },
  { email: "ethan@cornell.edu", name: "Ethan Kim", university: "Cornell", major: "Business", gradYear: 2026, headline: "Founder · Campus startup", bio: "Building a campus startup. Hiring designers and devs.", hourlyRate: 0, skills: ["Product", "Marketing"], role: "HIRE" },
  { email: "zoe@ucla.edu", name: "Zoe Martinez", university: "UCLA", major: "Communications", gradYear: 2027, headline: "Podcast host", bio: "Host of a campus-life podcast. Looking for design + editing help.", hourlyRate: 0, skills: ["Podcasting"], role: "HIRE" },
  { email: "noah@utexas.edu", name: "Noah Williams", university: "UT Austin", major: "Economics", gradYear: 2026, headline: "Econ major prepping for finals", bio: "Need recurring tutoring help in calc through finals.", hourlyRate: 0, skills: [], role: "HIRE" },
  { email: "riley@psu.edu", name: "Riley Brown", university: "Penn State", major: "Communications", gradYear: 2025, headline: "YouTube creator (50k subs)", bio: "Gaming channel. Need video editors and thumbnail designers.", hourlyRate: 0, skills: ["YouTube"], role: "HIRE" },
  { email: "ava@brown.edu", name: "Ava Johnson", university: "Brown University", major: "English", gradYear: 2025, headline: "Senior writing a thesis", bio: "Looking for proofreaders for academic work.", hourlyRate: 0, skills: [], role: "HIRE" },
  { email: "diego@asu.edu", name: "Diego Alvarez", university: "ASU", major: "Business", gradYear: 2027, headline: "Club president", bio: "Running a 200-member student org. Hiring for IG management.", hourlyRate: 0, skills: [], role: "HIRE" },
  { email: "alex@bu.edu", name: "Alex Rivera", university: "Boston University", major: "Computer Science", gradYear: 2026, headline: "Full-stack developer · Open to design work", bio: "CS junior at BU passionate about clean interfaces and shipping side projects.", hourlyRate: 32, skills: ["React", "TypeScript", "Node.js", "Tailwind", "Figma", "PostgreSQL"], role: "BOTH" },
];

const jobSeeds: Array<{
  clientEmail: string;
  title: string;
  description: string;
  category: string;
  budgetType: "FIXED" | "HOURLY" | "MONTHLY";
  budgetAmount: number;
  skills: string[];
}> = [
  { clientEmail: "ethan@cornell.edu", title: "Build a landing page for my campus startup", description: "Looking for a React dev to build a clean, mobile-first landing page with 3 sections, a sign-up form, and animations. Need it within 2 weeks.", category: "Web Dev", budgetType: "FIXED", budgetAmount: 300, skills: ["React", "Tailwind", "Framer Motion"] },
  { clientEmail: "zoe@ucla.edu", title: "Logo + brand kit for new student podcast", description: "Need a friendly, modern logo and a small brand kit (colors, fonts, IG templates) for a podcast about college life.", category: "Graphic Design", budgetType: "FIXED", budgetAmount: 150, skills: ["Logo Design", "Branding", "Figma"] },
  { clientEmail: "noah@utexas.edu", title: "Weekly Calc II tutoring – 1hr sessions", description: "Struggling with integrals and series. Need a patient tutor for weekly sessions through finals.", category: "Tutoring", budgetType: "HOURLY", budgetAmount: 25, skills: ["Calculus", "Tutoring"] },
  { clientEmail: "riley@psu.edu", title: "Edit 10-min YouTube video — gaming highlights", description: "Need clean cuts, captions, and a few zoom effects. Footage is around 45 minutes.", category: "Video Editing", budgetType: "FIXED", budgetAmount: 75, skills: ["Premiere Pro", "Captions"] },
  { clientEmail: "ava@brown.edu", title: "Proofread my 20-page senior thesis", description: "English/Lit major preferred. Looking for grammar, clarity, and structural feedback.", category: "Writing", budgetType: "FIXED", budgetAmount: 80, skills: ["Editing", "Proofreading"] },
  { clientEmail: "diego@asu.edu", title: "Run our club's Instagram for the semester", description: "3 posts a week, 5 stories. We'll provide brand assets. Looking for someone creative and reliable.", category: "Social Media", budgetType: "MONTHLY", budgetAmount: 200, skills: ["Instagram", "Content", "Canva"] },
  { clientEmail: "ethan@cornell.edu", title: "Design a pitch deck for seed round", description: "10-slide pitch deck for a YC-style seed pitch. Need someone with strong typography sense.", category: "Graphic Design", budgetType: "FIXED", budgetAmount: 250, skills: ["Figma", "Pitch Deck", "Typography"] },
  { clientEmail: "zoe@ucla.edu", title: "Edit weekly 30-min podcast episodes", description: "Cleanup, leveling, ads. 4 episodes a month, ongoing.", category: "Video Editing", budgetType: "MONTHLY", budgetAmount: 320, skills: ["Audio Editing", "Podcasting"] },
  { clientEmail: "riley@psu.edu", title: "Design 20 YouTube thumbnails", description: "Bulk thumbnail design for a back-catalog. Reference style provided.", category: "Graphic Design", budgetType: "FIXED", budgetAmount: 180, skills: ["Photoshop", "Thumbnails"] },
  { clientEmail: "alex@bu.edu", title: "Build a small inventory CRUD app", description: "Looking for a freelancer to build a small inventory tracking app for a student business.", category: "Web Dev", budgetType: "FIXED", budgetAmount: 450, skills: ["React", "Node.js", "PostgreSQL"] },
];

async function main() {
  console.log("→ Seeding skills, users, jobs, proposals…");

  // 1) Skills
  const allSkillNames = Array.from(
    new Set([
      ...studentSeeds.flatMap((s) => s.skills),
      ...jobSeeds.flatMap((j) => j.skills),
    ]),
  );
  const skillIdByName = new Map<string, string>();
  for (const name of allSkillNames) {
    const s = await prisma.skill.upsert({
      where: { slug: slug(name) },
      create: { name, slug: slug(name) },
      update: { name },
    });
    skillIdByName.set(name, s.id);
  }
  console.log(`  ✓ ${allSkillNames.length} skills`);

  // 2) Users (idempotent: upsert by email)
  const userIdByEmail = new Map<string, string>();
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);

  for (const s of studentSeeds) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      create: {
        email: s.email,
        password: passwordHash,
        name: s.name,
        university: s.university,
        major: s.major,
        gradYear: s.gradYear,
        headline: s.headline,
        bio: s.bio,
        hourlyRate: s.hourlyRate || null,
        role: s.role,
        avatar: avatar(s.name),
        emailVerified: true,
        authProvider: "LOCAL",
      },
      update: {
        name: s.name,
        university: s.university,
        major: s.major,
        gradYear: s.gradYear,
        headline: s.headline,
        bio: s.bio,
        hourlyRate: s.hourlyRate || null,
        role: s.role,
        avatar: avatar(s.name),
        emailVerified: true,
      },
    });
    userIdByEmail.set(s.email, user.id);

    // Reset and recreate user skills (idempotent)
    await prisma.userSkill.deleteMany({ where: { userId: user.id } });
    if (s.skills.length > 0) {
      await prisma.userSkill.createMany({
        data: s.skills
          .map((name) => skillIdByName.get(name))
          .filter((id): id is string => Boolean(id))
          .map((skillId) => ({ userId: user.id, skillId })),
        skipDuplicates: true,
      });
    }
  }
  console.log(`  ✓ ${studentSeeds.length} users (password: ${SEED_PASSWORD})`);

  // 3) Jobs — idempotent by (clientId, title)
  const jobIds: string[] = [];
  for (const j of jobSeeds) {
    const clientId = userIdByEmail.get(j.clientEmail);
    if (!clientId) continue;
    const existing = await prisma.job.findFirst({
      where: { clientId, title: j.title },
    });
    let job;
    const data: Prisma.JobCreateInput | Prisma.JobUpdateInput = {
      title: j.title,
      description: j.description,
      category: j.category,
      budgetType: j.budgetType,
      budgetAmount: j.budgetAmount,
    };
    if (existing) {
      job = await prisma.job.update({ where: { id: existing.id }, data });
    } else {
      job = await prisma.job.create({
        data: { ...(data as Prisma.JobCreateInput), client: { connect: { id: clientId } } },
      });
    }
    jobIds.push(job.id);
    await prisma.jobSkill.deleteMany({ where: { jobId: job.id } });
    if (j.skills.length > 0) {
      await prisma.jobSkill.createMany({
        data: j.skills
          .map((name) => skillIdByName.get(name))
          .filter((id): id is string => Boolean(id))
          .map((skillId) => ({ jobId: job.id, skillId })),
        skipDuplicates: true,
      });
    }
  }
  console.log(`  ✓ ${jobIds.length} jobs`);

  // 4) Proposals — a handful of cross-pollinated examples
  const freelancers = ["maya@stanford.edu", "priya@mit.edu", "liam@usc.edu", "sofia@umich.edu", "jordan@nyu.edu", "marcus@yale.edu"];
  const proposalPairs: Array<{ jobIdx: number; freelancerEmail: string; bid: number; cover: string }> = [
    { jobIdx: 0, freelancerEmail: "maya@stanford.edu", bid: 280, cover: "Hi! I've built four landing pages with React + Tailwind + Framer Motion. I can ship in 10 days with one round of revisions." },
    { jobIdx: 0, freelancerEmail: "priya@mit.edu", bid: 320, cover: "Stanford CS, available evenings. Happy to share my recent work." },
    { jobIdx: 1, freelancerEmail: "jordan@nyu.edu", bid: 150, cover: "Branding is my main thing — I'd love to take this on. Can deliver in 5 days." },
    { jobIdx: 3, freelancerEmail: "liam@usc.edu", bid: 75, cover: "Film major, I edit gaming content weekly for my own channel. Quick turnaround." },
    { jobIdx: 4, freelancerEmail: "sofia@umich.edu", bid: 80, cover: "Lit major, edited dozens of senior theses. Two-day turnaround." },
    { jobIdx: 5, freelancerEmail: "marcus@yale.edu", bid: 200, cover: "I've grown two student orgs from 0 → 10k. I'd love to do the same for your club." },
  ];

  let proposalCount = 0;
  for (const p of proposalPairs) {
    const jobId = jobIds[p.jobIdx];
    const freelancerId = userIdByEmail.get(p.freelancerEmail);
    if (!jobId || !freelancerId) continue;
    await prisma.proposal.upsert({
      where: { jobId_freelancerId: { jobId, freelancerId } },
      create: { jobId, freelancerId, bidAmount: p.bid, coverLetter: p.cover },
      update: { bidAmount: p.bid, coverLetter: p.cover, status: "PENDING" },
    });
    proposalCount++;
  }
  console.log(`  ✓ ${proposalCount} proposals`);

  console.log("\n✓ Seed complete.");
  console.log(`  Login: any seeded email, password "${SEED_PASSWORD}"`);
  console.log(`  Example: alex@bu.edu / ${SEED_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
