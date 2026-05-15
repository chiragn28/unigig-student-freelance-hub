import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Briefcase, MessageSquare, ArrowUpRight } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { currentUser, dashboardStats, jobs, conversations, notifications } from "@/lib/mockData";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — unigig" },
      { name: "description", content: "Your unigig overview: gigs, earnings, and messages." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {currentUser.name.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-muted-foreground">Here's what's happening with your gigs.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/work">Find work</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link to="/hire">Post a job</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card p-5">
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="mt-2 text-3xl font-bold">{s.value}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-coral">
                <TrendingUp className="h-3 w-3" /> {s.trend}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border bg-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Briefcase className="h-4 w-4" /> Active gigs
              </h2>
              <Link to="/work" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {jobs.slice(0, 3).map((j) => (
                <div
                  key={j.id}
                  className="flex items-center justify-between rounded-xl border bg-background p-4"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{j.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="rounded-full">{j.category}</Badge>
                      <span>{j.client.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-coral">{j.budget}</div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <MessageSquare className="h-4 w-4" /> Recent messages
                </h2>
                <Link to="/messages" className="text-xs font-medium text-primary hover:underline">
                  Inbox
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {conversations.slice(0, 3).map((c) => (
                  <Link
                    key={c.id}
                    to="/messages"
                    className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={c.avatar} />
                      <AvatarFallback>{c.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="truncate text-sm font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.time}</div>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{c.lastMessage}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Notifications
              </h2>
              <div className="mt-4 space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="flex gap-3">
                    <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.unread ? "bg-coral" : "bg-muted"}`} />
                    <div>
                      <div className="text-sm">{n.text}</div>
                      <div className="text-xs text-muted-foreground">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
