import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Code2,
  Palette,
  GraduationCap,
  PenLine,
  Video,
  Share2,
  Search,
  Database,
  ArrowRight,
  Briefcase,
  FileText,
  Star,
  CheckCircle2,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { stats, categories, testimonials } from "@/lib/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "unigig — Freelance, by students, for students" },
      {
        name: "description",
        content:
          "The freelance marketplace built exclusively for college students. Hire trusted student talent or earn money on your own schedule.",
      },
      { property: "og:title", content: "unigig — Freelance, by students, for students" },
      {
        property: "og:description",
        content: "Hire student talent or get paid for what you're good at — all on your schedule.",
      },
    ],
  }),
  component: Landing,
});

const iconMap = {
  Code2, Palette, GraduationCap, PenLine, Video, Share2, Search, Database,
} as const;

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link to="/signup">Sign up</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(800px 400px at 20% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 60%), radial-gradient(700px 400px at 90% 10%, color-mix(in oklab, var(--coral) 14%, transparent), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="grid h-1.5 w-1.5 place-items-center rounded-full bg-coral" />
              .edu verified · 5,000+ students
            </span>
            <h1 className="mt-6 text-5xl font-extrabold tracking-tight sm:text-7xl">
              Freelance, by students,{" "}
              <span className="bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent">
                for students.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Get work done by talented college students — or earn money on your
              own schedule between classes. No middlemen, no agencies.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-14 rounded-full px-8 text-base">
                <Link to="/hire">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Hire Talent
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 rounded-full px-8 text-base border-2"
              >
                <Link to="/work">
                  <FileText className="mr-2 h-5 w-5" />
                  Find Work
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border bg-card p-6 text-center shadow-sm"
              >
                <div className="text-3xl font-extrabold tracking-tight text-primary">
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-muted-foreground">
              Whichever side you're on, getting started takes minutes.
            </p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <HowCard
              tag="For Clients"
              accent="primary"
              icon={<Briefcase className="h-5 w-5" />}
              steps={[
                { title: "Post a job", body: "Describe what you need in 2 minutes." },
                { title: "Review proposals", body: "Compare student profiles and pick the best fit." },
                { title: "Hire & pay safely", body: "Funds held in escrow until you approve the work." },
              ]}
            />
            <HowCard
              tag="For Freelancers"
              accent="coral"
              icon={<GraduationCap className="h-5 w-5" />}
              steps={[
                { title: "Build your profile", body: "Show off your skills, classes, and portfolio." },
                { title: "Submit proposals", body: "Browse open jobs and pitch yourself in seconds." },
                { title: "Get paid", body: "Withdraw to your bank or Venmo when work is approved." },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">Popular categories</h2>
              <p className="mt-3 text-muted-foreground">
                Find help in the areas students hire for most.
              </p>
            </div>
            <Link
              to="/hire"
              className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
            >
              Browse all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => {
              const Icon = iconMap[c.icon as keyof typeof iconMap];
              return (
                <Link
                  key={c.name}
                  to="/hire"
                  className="group rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary transition group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 font-semibold">{c.name}</div>
                  <div className="text-sm text-muted-foreground">{c.count} freelancers</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t bg-muted/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-4xl font-bold tracking-tight">
            Loved by students everywhere
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t) => (
              <figure
                key={t.id}
                className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm"
              >
                <div className="flex gap-0.5 text-coral">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={t.avatar} />
                    <AvatarFallback>{t.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.university}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-coral p-10 text-primary-foreground sm:p-16">
            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Ready to start?
                </h3>
                <p className="mt-2 max-w-md text-primary-foreground/85">
                  Join thousands of students getting work done — and getting paid.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full bg-background px-8 text-base text-foreground hover:bg-background/90"
              >
                <Link to="/signup">Create your account</Link>
              </Button>
            </div>
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <Logo />
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                The freelance marketplace built exclusively for college students.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-success" />
                .edu verification required
              </div>
            </div>
            <FooterCol title="Company" items={["About", "How it Works", "Trust & Safety"]} />
            <FooterCol title="Support" items={["Help Center", "Contact", "Community"]} />
            <FooterCol title="Legal" items={["Terms", "Privacy", "Cookies"]} />
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
            <div>© {new Date().getFullYear()} unigig. Built between classes.</div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> By students, for students.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i}>
            <a href="#" className="hover:text-foreground">{i}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HowCard({
  tag,
  accent,
  icon,
  steps,
}: {
  tag: string;
  accent: "primary" | "coral";
  icon: React.ReactNode;
  steps: { title: string; body: string }[];
}) {
  const accentClass =
    accent === "primary"
      ? "bg-primary-soft text-primary"
      : "bg-coral/15 text-coral";
  return (
    <div className="rounded-3xl border bg-card p-8 shadow-sm">
      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${accentClass}`}>
        {icon}
        {tag}
      </div>
      <ol className="mt-6 space-y-5">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-background text-sm font-semibold">
              {i + 1}
            </div>
            <div>
              <div className="flex items-center gap-2 font-semibold">
                {s.title}
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
              <div className="text-sm text-muted-foreground">{s.body}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
