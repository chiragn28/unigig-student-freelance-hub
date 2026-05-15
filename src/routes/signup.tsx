import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Briefcase, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";

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
  { id: "hire", label: "Hire", icon: Briefcase },
  { id: "work", label: "Work", icon: FileText },
  { id: "both", label: "Both", icon: Sparkles },
] as const;

function SignupPage() {
  const [intent, setIntent] = useState<(typeof intents)[number]["id"]>("both");
  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-3xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Join unigig</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Free for students. Always.
          </p>
          <form className="mt-6 grid gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Alex Rivera" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">University email</Label>
              <Input id="email" type="email" placeholder="you@university.edu" />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                .edu verification required to keep unigig students-only.
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="At least 8 characters" />
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
            <Button type="submit" size="lg" className="mt-2 h-12 rounded-full">
              Create account
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
