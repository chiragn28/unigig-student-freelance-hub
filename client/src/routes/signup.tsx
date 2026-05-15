import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Briefcase, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import { getApiError } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — unigig" },
      { name: "description", content: "Create a unigig account with your .edu email." },
    ],
  }),
  component: SignupPage,
});

const intents = [
  { id: "HIRE", label: "Hire", icon: Briefcase },
  { id: "WORK", label: "Work", icon: FileText },
  { id: "BOTH", label: "Both", icon: Sparkles },
] as const;

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [intent, setIntent] = useState<(typeof intents)[number]["id"]>("BOTH");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { message } = await signup({
        email,
        password,
        name,
        university: university || undefined,
        role: intent,
      });
      setSuccessMessage(message);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30 px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <Link to="/"><Logo /></Link>
          </div>
          <div className="rounded-3xl border bg-card p-8 shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Check your inbox</h1>
            <p className="mt-2 text-sm text-muted-foreground">{successMessage}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              In development, the verification email is written to{" "}
              <code className="rounded bg-muted px-1 py-0.5">server/dev-emails/</code> and logged to your server console.
            </p>
            <div className="mt-6">
              <Button asChild className="rounded-full">
                <Link to="/login">Go to log in</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link to="/"><Logo /></Link>
        </div>
        <div className="rounded-3xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Join unigig</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Free for students. Always.
          </p>
          <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">University email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                .edu verification required to keep unigig students-only.
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                placeholder="e.g. Stanford University"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                autoComplete="organization"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>I want to</Label>
              <div className="grid grid-cols-3 gap-2">
                {intents.map((i) => {
                  const Icon = i.icon;
                  const active = intent === i.id;
                  return (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => setIntent(i.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-sm font-medium transition ${
                        active
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {i.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" size="lg" className="mt-2 h-12 rounded-full" disabled={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
