import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Users, Loader2 } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { FilterSidebar } from "@/components/FilterSidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useJobs, useMyProposals, useCreateProposal } from "@/lib/queries";
import { useAuth } from "@/lib/auth-context";
import { type ApiJob, getApiError } from "@/lib/api";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Find Work — unigig" },
      { name: "description", content: "Browse student-posted gigs and submit proposals on your schedule." },
    ],
  }),
  component: WorkPage,
});

function formatBudget(j: ApiJob): string {
  const amount = `$${j.budgetAmount}`;
  if (j.budgetType === "FIXED") return `${amount} fixed`;
  if (j.budgetType === "HOURLY") return `${amount}/hr`;
  return `${amount}/month`;
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  const mo = Math.floor(d / 30);
  return `${mo} mo${mo === 1 ? "" : "s"} ago`;
}

function WorkPage() {
  const jobsQuery = useJobs({ limit: 30, status: "OPEN" });
  const { user } = useAuth();
  const myProposalsQuery = useMyProposals();
  const [proposalJob, setProposalJob] = useState<ApiJob | null>(null);

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Find your next gig</h1>
          <p className="text-sm text-muted-foreground">Curated jobs posted by fellow students.</p>
        </div>

        <Tabs defaultValue="browse">
          <TabsList className="rounded-full">
            <TabsTrigger value="browse" className="rounded-full">Browse Jobs</TabsTrigger>
            <TabsTrigger value="proposals" className="rounded-full">My Proposals</TabsTrigger>
            <TabsTrigger value="contracts" className="rounded-full">Active Contracts</TabsTrigger>
            <TabsTrigger value="earnings" className="rounded-full">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <div className="flex gap-6">
              <FilterSidebar
                groups={[
                  { title: "Category", options: ["Web Dev", "Graphic Design", "Tutoring", "Writing", "Video Editing"] },
                  { title: "Project length", options: ["< 1 week", "1-4 weeks", "1-3 months", "Ongoing"] },
                  { title: "Experience level", options: ["Entry", "Intermediate", "Expert"] },
                ]}
                rangeLabel="Budget"
                rangeMax={1000}
              />
              <div className="flex-1 space-y-4">
                {jobsQuery.isLoading && (
                  <div className="grid place-items-center py-20 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
                {jobsQuery.isError && (
                  <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
                    Couldn't load jobs: {getApiError(jobsQuery.error)}
                  </div>
                )}
                {jobsQuery.data?.items.map((j) => (
                  <article key={j.id} className="rounded-2xl border bg-card p-6 shadow-sm transition hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" /> Posted {relativeTime(j.createdAt)}
                          <span>·</span>
                          <Badge variant="secondary" className="rounded-full">{j.category}</Badge>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold">{j.title}</h3>
                      </div>
                      <div className="text-right">
                        <div className="rounded-full bg-coral/10 px-3 py-1 text-sm font-semibold text-coral">
                          {formatBudget(j)}
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{j.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {j.skills.map((s) => (
                        <Badge key={s} variant="outline" className="rounded-full font-normal">{s}</Badge>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={j.client.avatar ?? undefined} />
                          <AvatarFallback>{j.client.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <div className="font-medium">{j.client.name}</div>
                          <div className="text-xs text-muted-foreground">{j.client.university ?? "—"}</div>
                        </div>
                        <div className="ml-3 flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5" /> {j.proposalCount} proposal{j.proposalCount === 1 ? "" : "s"}
                        </div>
                      </div>
                      <Button
                        className="rounded-full"
                        onClick={() => setProposalJob(j)}
                        disabled={!!user && user.id === j.client.id}
                      >
                        {user && user.id === j.client.id ? "Your job" : "Submit Proposal"}
                      </Button>
                    </div>
                  </article>
                ))}
                {jobsQuery.data && jobsQuery.data.items.length === 0 && (
                  <EmptyState title="No open jobs right now" body="Check back soon — new jobs are posted daily." />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="proposals" className="mt-6">
            {!user ? (
              <EmptyState title="Log in to see your proposals" body="Sign in to track the jobs you've pitched on." />
            ) : myProposalsQuery.isLoading ? (
              <div className="grid place-items-center py-20 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : !myProposalsQuery.data || myProposalsQuery.data.items.length === 0 ? (
              <EmptyState title="No proposals yet" body="Submit your first proposal to start tracking it here." />
            ) : (
              <div className="space-y-3">
                {myProposalsQuery.data.items.map((p) => (
                  <div key={p.id} className="rounded-2xl border bg-card p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold">{p.job.title}</h4>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Your bid: ${p.bidAmount} · {relativeTime(p.createdAt)}
                        </div>
                      </div>
                      <Badge variant={p.status === "ACCEPTED" ? "default" : "secondary"} className="rounded-full">
                        {p.status}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.coverLetter}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="contracts" className="mt-6">
            <EmptyState title="No active contracts" body="When a client hires you, your contracts will live here." />
          </TabsContent>
          <TabsContent value="earnings" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Available to withdraw", value: "$0.00" },
                { label: "Pending clearance", value: "$0.00" },
                { label: "Lifetime earnings", value: "$0.00" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border bg-card p-6">
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                  <div className="mt-2 text-3xl font-bold">{s.value}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <ProposalDialog
        job={proposalJob}
        onClose={() => setProposalJob(null)}
      />
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border bg-card p-12 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function ProposalDialog({ job, onClose }: { job: ApiJob | null; onClose: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createProposal = useCreateProposal();
  const [coverLetter, setCoverLetter] = useState("");
  const [bidAmount, setBidAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  function closeAndReset() {
    onClose();
    setCoverLetter("");
    setBidAmount("");
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!job) return;
    setError(null);
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    try {
      await createProposal.mutateAsync({
        jobId: job.id,
        coverLetter,
        bidAmount: Number(bidAmount),
      });
      closeAndReset();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  return (
    <Dialog open={!!job} onOpenChange={(o) => !o && closeAndReset()}>
      <DialogContent className="max-w-xl">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Submit a proposal</DialogTitle>
            <DialogDescription>
              {job?.title} · {job ? formatBudget(job) : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="bid">Your bid ($)</Label>
              <Input
                id="bid"
                type="number"
                min={1}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cover">Cover letter</Label>
              <Textarea
                id="cover"
                rows={6}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Why are you a great fit? (at least 20 characters)"
                required
                minLength={20}
              />
            </div>
            {!user && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
                You need to log in before submitting a proposal.
              </div>
            )}
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeAndReset}>Cancel</Button>
            <Button type="submit" disabled={createProposal.isPending}>
              {createProposal.isPending ? "Submitting…" : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
