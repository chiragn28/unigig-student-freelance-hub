import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, Plus, X } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { useUpdateMe } from "@/lib/queries";
import { getApiError } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — unigig" },
      { name: "description", content: "Edit your unigig student profile and portfolio." },
    ],
  }),
  component: ProfilePageGuarded,
});

function ProfilePageGuarded() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}

function ProfilePage() {
  const { user, refreshMe } = useAuth();
  const updateMe = useUpdateMe();

  const [name, setName] = useState(user?.name ?? "");
  const [university, setUniversity] = useState(user?.university ?? "");
  const [major, setMajor] = useState(user?.major ?? "");
  const [gradYear, setGradYear] = useState<string>(user?.gradYear ? String(user.gradYear) : "");
  const [headline, setHeadline] = useState(user?.headline ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [hourlyRate, setHourlyRate] = useState<string>(user?.hourlyRate ? String(user.hourlyRate) : "");
  const [skills, setSkills] = useState<string[]>(user?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [mode, setMode] = useState<"work" | "hire">(user?.role === "HIRE" ? "hire" : "work");
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Re-hydrate form when user data changes (e.g. on first load after auth)
  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setUniversity(user.university ?? "");
    setMajor(user.major ?? "");
    setGradYear(user.gradYear ? String(user.gradYear) : "");
    setHeadline(user.headline ?? "");
    setBio(user.bio ?? "");
    setHourlyRate(user.hourlyRate ? String(user.hourlyRate) : "");
    setSkills(user.skills ?? []);
    setMode(user.role === "HIRE" ? "hire" : "work");
  }, [user?.id]);

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v || skills.includes(v)) return;
    setSkills([...skills, v]);
    setSkillInput("");
  };

  async function onSave() {
    setError(null);
    try {
      await updateMe.mutateAsync({
        name,
        university: university || undefined,
        major: major || undefined,
        gradYear: gradYear ? Number(gradYear) : undefined,
        headline: headline || undefined,
        bio: bio || undefined,
        hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
        skills,
      });
      await refreshMe();
      setSavedAt(Date.now());
    } catch (err) {
      setError(getApiError(err));
    }
  }

  if (!user) return null;

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
                  <AvatarImage src={user.avatar ?? undefined} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <button
                  className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-md hover:scale-105"
                  title="Avatar upload coming soon"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">
                {user.university ?? "—"}
                {user.gradYear ? ` · Class of ${user.gradYear}` : ""}
              </p>
            </div>
            <div className="mt-6 grid gap-3">
              <div className="grid gap-1.5">
                <Label>Full name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label>University</Label>
                <Input value={university} onChange={(e) => setUniversity(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Major</Label>
                  <Input value={major} onChange={(e) => setMajor(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Grad year</Label>
                  <Input
                    type="number"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                  />
                </div>
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
                <div className="grid gap-1.5">
                  <Label>Headline</Label>
                  <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Bio</Label>
                  <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Hourly rate ($)</Label>
                    <Input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                    />
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
                <Button variant="ghost" size="sm" disabled title="Portfolio uploads coming soon">
                  <Plus className="mr-1 h-4 w-4" /> Add work
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(user.portfolio ?? []).map((p) => (
                  <div key={p.id} className="aspect-square overflow-hidden rounded-xl border bg-muted">
                    <img src={p.imageUrl} alt={p.caption ?? "Portfolio piece"} className="h-full w-full object-cover" />
                  </div>
                ))}
                {(!user.portfolio || user.portfolio.length === 0) && (
                  <div className="col-span-full text-sm text-muted-foreground">
                    No portfolio items yet.
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              {savedAt && !updateMe.isPending && (
                <span className="text-xs text-muted-foreground">Saved</span>
              )}
              <Button onClick={onSave} disabled={updateMe.isPending}>
                {updateMe.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
