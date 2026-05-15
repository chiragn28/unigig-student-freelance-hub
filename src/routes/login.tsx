import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — unigig" },
      { name: "description", content: "Log in to your unigig student account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-3xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log in to your student account.
          </p>
          <form className="mt-6 grid gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-1.5">
              <Label htmlFor="email">University email</Label>
              <Input id="email" type="email" placeholder="you@university.edu" />
            </div>
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
              </div>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button type="submit" size="lg" className="mt-2 h-12 rounded-full">Log in</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to unigig?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
