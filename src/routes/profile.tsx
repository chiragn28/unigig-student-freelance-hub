import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Plus, X } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { currentUser } from "@/lib/mockData";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — unigig" },
      { name: "description", content: "Edit your unigig student profile and portfolio." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [skills, setSkills] = useState(currentUser.skills);
  const [skillInput, setSkillInput] = useState("");
  const [mode, setMode] = useState<"work" | "hire">("work");

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v || skills.includes(v)) return;
    setSkills([...skills, v]);
    setSkillInput("");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
            <p className="text-sm text-muted-foreground">Make a great first impression.</p>
          </div>
          <div className="flex items-center gap-3 rounded-full border bg-card p-1 pl-4 pr-1.5">
            <span className="text-sm font-medium">
              {mode === "work" ? "Work mode" : "Hire mode"}
            </span>
            <Switch
              checked={mode === "hire"}
              onCheckedChange={(v) => setMode(v ? "hire" : "work")}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Avatar + basics card */}
          <section className="rounded-2xl border bg-card p-6 lg:col-span-1">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-28 w-28 ring-4 ring-primary-soft">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-md hover:scale-105">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h2 className="mt-4 text-xl font-bold">{currentUser.name}</h2>
              <p className="text-sm text-muted-foreground">
                {currentUser.university} · Class of {currentUser.graduationYear}
              </p>
            </div>
            <div className="mt-6 grid gap-3">
              <Field label="Full name" defaultValue={currentUser.name} />
              <Field label="University" defaultValue={currentUser.university} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Major" defaultValue={currentUser.major} />
                <Field label="Grad year" defaultValue={String(currentUser.graduationYear)} />
              </div>
            </div>
          </section>

          {/* Main editable */}
          <section className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                About
              </h3>
              <div className="mt-4 grid gap-4">
                <Field label="Headline" defaultValue={currentUser.headline} />
                <div className="grid gap-1.5">
                  <Label>Bio</Label>
                  <Textarea rows={4} defaultValue={currentUser.bio} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Hourly rate ($)</Label>
                    <Input type="number" defaultValue={currentUser.rate} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Languages</Label>
                    <Input defaultValue={currentUser.languages.join(", ")} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Skills
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" className="rounded-full pl-3 pr-1.5 py-1 text-sm">
                    {s}
                    <button
                      onClick={() => setSkills(skills.filter((x) => x !== s))}
                      className="ml-1 grid h-5 w-5 place-items-center rounded-full hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button onClick={addSkill} variant="outline" className="shrink-0">
                  <Plus className="mr-1 h-4 w-4" /> Add
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Portfolio
                </h3>
                <Button variant="ghost" size="sm">
                  <Plus className="mr-1 h-4 w-4" /> Add work
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {currentUser.portfolio.map((src, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-xl border bg-muted">
                    <img src={src} alt={`Portfolio piece ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Save changes</Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} />
    </div>
  );
}
