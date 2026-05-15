import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Star, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import { FilterSidebar } from "@/components/FilterSidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUsers, useCreateJob, type CreateJobInput } from "@/lib/queries";
import { useAuth } from "@/lib/auth-context";
import { getApiError } from "@/lib/api";

export const Route = createFileRoute("/hire")({
  head: () => ({
    meta: [
      { title: "Hire Talent — unigig" },
      { name: "description", content: "Browse verified student freelancers and post your job." },
    ],
  }),
  component: HirePage,
});

function HirePage() {
  const { data, isLoading, isError, error } = useUsers({ limit: 30 });

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Find student talent</h1>
            <p className="text-sm text-muted-foreground">
              {data ? `${data.pagination.total} verified students ready to work.` : "Loading…"}
            </p>
          </div>
          <PostJobDialog />
        </div>

        <div className="flex gap-6">
          <FilterSidebar
            groups={[
              { title: "Category", options: ["Web Dev", "Graphic Design", "Tutoring", "Writing", "Video Editing"] },
              { title: "University", options: ["Stanford", "MIT", "NYU", "UC Berkeley", "USC"] },
              { title: "Availability", options: ["< 30 hrs/week", "30+ hrs/week", "As needed"] },
              { title: "Rating", options: ["4.5+", "4.0+", "Any"] },
            ]}
            rangeLabel="Hourly rate"
            rangeMax={100}
          />
          <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading && (
              <div className="col-span-full grid place-items-center py-20 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            {isError && (
              <div className="col-span-full rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
                Couldn't load freelancers: {getApiError(error)}
              </div>
            )}
            {data?.items.map((f) => (
              <article
                key={f.id}
                className="group flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-primary-soft">
                    <AvatarImage src={f.avatar ?? undefined} />
                    <AvatarFallback>{f.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="truncate font-semibold">{f.name}</div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-coral text-coral" />
                        <span className="font-medium">—</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {f.university ?? "—"}{f.major ? ` · ${f.major}` : ""}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium">{f.headline ?? "Student freelancer"}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(f.skills ?? []).slice(0, 4).map((s) => (
                    <Badge key={s} variant="secondary" className="rounded-full font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t pt-4">
                  <div>
                    {f.hourlyRate ? (
                      <div className="text-lg font-bold">
                        ${f.hourlyRate}<span className="text-xs font-normal text-muted-foreground">/hr</span>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Rate on request</div>
                    )}
                  </div>
                  <Button size="sm" className="rounded-full">View profile</Button>
                </div>
              </article>
            ))}
            {data && data.items.length === 0 && (
              <div className="col-span-full rounded-2xl border bg-card p-12 text-center">
                <h3 className="text-lg font-semibold">No freelancers match your filters yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting filters or check back later.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function PostJobDialog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createJob = useCreateJob();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [budgetType, setBudgetType] = useState<"FIXED" | "HOURLY" | "MONTHLY">("FIXED");
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [skills, setSkills] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    const input: CreateJobInput = {
      title,
      category,
      description,
      budgetType,
      budgetAmount: Number(budgetAmount),
      ...(deadline ? { deadline: new Date(deadline).toISOString() } : {}),
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      await createJob.mutateAsync(input);
      setOpen(false);
      setTitle(""); setCategory(""); setDescription(""); setBudgetAmount(""); setSkills(""); setDeadline("");
    } catch (err) {
      setError(getApiError(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full">
          <Plus className="mr-1.5 h-4 w-4" />
          Post a Job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Post a job</DialogTitle>
            <DialogDescription>
              Tell us what you need — you'll get proposals within hours.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Job title</Label>
              <Input
                id="title"
                placeholder="e.g. Build a landing page"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Dev">Web Dev</SelectItem>
                    <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                    <SelectItem value="Tutoring">Tutoring</SelectItem>
                    <SelectItem value="Writing">Writing</SelectItem>
                    <SelectItem value="Video Editing">Video Editing</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                rows={4}
                placeholder="Describe what you need... (at least 20 characters)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={20}
              />
            </div>
            <div className="grid gap-2">
              <Label>Budget</Label>
              <RadioGroup
                value={budgetType}
                onValueChange={(v) => setBudgetType(v as typeof budgetType)}
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="FIXED" /> Fixed
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="HOURLY" /> Hourly
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="MONTHLY" /> Monthly
                </label>
              </RadioGroup>
              <Input
                type="number"
                placeholder="$ amount"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                required
                min={1}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skills">Skills needed (comma-separated)</Label>
              <Input
                id="skills"
                placeholder="e.g. React, Tailwind, Figma"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
            {!user && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
                You need to log in before posting a job.
              </div>
            )}
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createJob.isPending}>
              {createJob.isPending ? "Posting…" : "Post job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
