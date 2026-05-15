import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useVerifyEmail } from "@/lib/queries";
import { getApiError } from "@/lib/api";

type Search = { token?: string };

export const Route = createFileRoute("/verify-email")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  head: () => ({
    meta: [{ title: "Verify email — unigig" }],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = Route.useSearch();
  const verify = useVerifyEmail();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState<string>("Verifying your email…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token in URL.");
      return;
    }
    verify
      .mutateAsync(token)
      .then((r) => {
        setStatus("success");
        setMessage(`Email verified${r.email ? ` for ${r.email}` : ""}. You can log in now.`);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(getApiError(err));
      });
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <Link to="/"><Logo /></Link>
        </div>
        <div className="rounded-3xl border bg-card p-8 shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full">
            {status === "pending" && <Loader2 className="h-7 w-7 animate-spin text-primary" />}
            {status === "success" && <CheckCircle2 className="h-7 w-7 text-success" />}
            {status === "error" && <XCircle className="h-7 w-7 text-destructive" />}
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            {status === "pending" ? "Verifying…" : status === "success" ? "Verified" : "Couldn't verify"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <div className="mt-6 flex justify-center gap-2">
            {status === "success" && (
              <Button asChild className="rounded-full"><Link to="/login">Log in</Link></Button>
            )}
            {status === "error" && (
              <Button asChild variant="outline" className="rounded-full"><Link to="/signup">Sign up again</Link></Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
