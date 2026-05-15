import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Bell, MessageSquare } from "lucide-react";
import { Logo } from "./Logo";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function DashboardNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden gap-1 md:flex">
          <Link
            to="/hire"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            activeProps={{ className: "rounded-full px-3 py-1.5 text-sm font-medium bg-primary-soft text-primary" }}
          >
            Hire
          </Link>
          <Link
            to="/work"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            activeProps={{ className: "rounded-full px-3 py-1.5 text-sm font-medium bg-primary-soft text-primary" }}
          >
            Work
          </Link>
        </nav>
        <div className="relative ml-auto max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search for skills..." className="rounded-full pl-9" />
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted">
          <MessageSquare className="h-4 w-4" />
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted">
          <Bell className="h-4 w-4" />
        </button>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="h-9 w-9 ring-2 ring-primary-soft">
                <AvatarImage src={user.avatar ?? undefined} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.university ?? "—"}</div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">My profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/hire">Hire dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/work">Work dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded-full"><Link to="/login">Log in</Link></Button>
            <Button asChild size="sm" className="rounded-full"><Link to="/signup">Sign up</Link></Button>
          </div>
        )}
      </div>
    </header>
  );
}
