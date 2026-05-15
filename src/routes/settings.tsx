import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { currentUser } from "@/lib/mockData";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — unigig" },
      { name: "description", content: "Manage your unigig account, notifications, and payments." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
        </div>

        <div className="space-y-6">
          <Section title="Account">
            <Row label="University email">
              <Input defaultValue={`${currentUser.name.toLowerCase().split(" ").join(".")}@bu.edu`} />
            </Row>
            <Row label="Phone">
              <Input defaultValue="+1 (555) 123-4567" />
            </Row>
            <Row label="Password">
              <Button variant="outline">Change password</Button>
            </Row>
          </Section>

          <Section title="Notifications">
            <ToggleRow label="New messages" desc="Get notified when someone sends you a message." defaultChecked />
            <ToggleRow label="Job matches" desc="Weekly digest of jobs that fit your skills." defaultChecked />
            <ToggleRow label="Proposal updates" desc="When a client responds to your proposal." defaultChecked />
            <ToggleRow label="Marketing emails" desc="Tips, success stories, and product news." />
          </Section>

          <Section title="Payments">
            <Row label="Payout method">
              <div className="flex items-center gap-3">
                <div className="rounded-md border bg-muted px-3 py-1.5 text-sm">Venmo · @alex-r</div>
                <Button variant="ghost" size="sm">Change</Button>
              </div>
            </Row>
            <Row label="Tax info">
              <Button variant="outline">Add W-9</Button>
            </Row>
          </Section>

          <Section title="Privacy">
            <ToggleRow label="Public profile" desc="Allow others to find your profile through search." defaultChecked />
            <ToggleRow label="Show earnings on profile" desc="Display total earned to build trust." />
          </Section>

          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
            <h3 className="font-semibold text-destructive">Danger zone</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Permanently delete your account and all related data. This cannot be undone.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link to="/login">Log out</Link>
              </Button>
              <Button variant="destructive">Delete account</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="mt-4 divide-y">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-3 py-4 sm:grid-cols-[200px_1fr]">
      <Label className="text-sm font-medium">{label}</Label>
      <div>{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  defaultChecked,
}: {
  label: string;
  desc: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
