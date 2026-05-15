import { createFileRoute } from "@tanstack/react-router";
import { Plus, Star, MapPin } from "lucide-react";
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
import { freelancers } from "@/lib/mockData";

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
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Find student talent</h1>
            <p className="text-sm text-muted-foreground">
              {freelancers.length}+ verified students ready to work.
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
            {freelancers.map((f) => (
              <article
                key={f.id}
                className="group flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-primary-soft">
                    <AvatarImage src={f.avatar} />
                    <AvatarFallback>{f.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="truncate font-semibold">{f.name}</div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-coral text-coral" />
                        <span className="font-medium">{f.rating}</span>
                        <span className="text-xs text-muted-foreground">({f.reviews})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {f.university} · {f.major}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium">{f.headline}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {f.skills.slice(0, 4).map((s) => (
                    <Badge key={s} variant="secondary" className="rounded-full font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t pt-4">
                  <div>
                    <div className="text-lg font-bold">${f.rate}<span className="text-xs font-normal text-muted-foreground">/hr</span></div>
                  </div>
                  <Button size="sm" className="rounded-full">View profile</Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function PostJobDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full">
          <Plus className="mr-1.5 h-4 w-4" />
          Post a Job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Post a job</DialogTitle>
          <DialogDescription>
            Tell us what you need — you'll get proposals within hours.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="title">Job title</Label>
            <Input id="title" placeholder="e.g. Build a landing page" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web Dev</SelectItem>
                  <SelectItem value="design">Graphic Design</SelectItem>
                  <SelectItem value="tutor">Tutoring</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" rows={4} placeholder="Describe what you need..." />
          </div>
          <div className="grid gap-2">
            <Label>Budget</Label>
            <RadioGroup defaultValue="fixed" className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="fixed" /> Fixed price
              </label>
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="hourly" /> Hourly
              </label>
            </RadioGroup>
            <Input type="number" placeholder="$ amount" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="skills">Skills needed</Label>
            <Input id="skills" placeholder="e.g. React, Tailwind, Figma" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => setOpen(false)}>Post job</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
