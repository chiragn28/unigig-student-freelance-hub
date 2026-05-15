import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-coral text-primary-foreground font-bold">
        u
      </div>
      <span className="text-lg font-bold tracking-tight">unigig</span>
    </Link>
  );
}
