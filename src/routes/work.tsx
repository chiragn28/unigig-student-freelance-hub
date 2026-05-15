import { createFileRoute } from "@tanstack/react-router";
import { Clock, Users } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { FilterSidebar } from "@/components/FilterSidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { jobs } from "@/lib/mockData";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Find Work — unigig" },
      { name: "description", content: "Browse student-posted gigs and submit proposals on your schedule." },
    ],
  }),
  component: WorkPage,
});

function WorkPage() {
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
                {jobs.map((j) => (
                  <article key={j.id} className="rounded-2xl border bg-card p-6 shadow-sm transition hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" /> Posted {j.postedAgo}
                          <span>·</span>
                          <Badge variant="secondary" className="rounded-full">{j.category}</Badge>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold">{j.title}</h3>
                      </div>
                      <div className="text-right">
                        <div className="rounded-full bg-coral/10 px-3 py-1 text-sm font-semibold text-coral">
                          {j.budget}
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
                          <AvatarImage src={j.client.avatar} />
                          <AvatarFallback>{j.client.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <div className="font-medium">{j.client.name}</div>
                          <div className="text-xs text-muted-foreground">{j.client.university}</div>
                        </div>
                        <div className="ml-3 flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5" /> {j.proposals} proposals
                        </div>
                      </div>
                      <Button className="rounded-full">Submit Proposal</Button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="proposals" className="mt-6">
            <EmptyState title="No proposals yet" body="Submit your first proposal to start tracking it here." />
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
