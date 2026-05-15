import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Paperclip, Search } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { conversations } from "@/lib/mockData";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — unigig" },
      { name: "description", content: "Chat with clients and freelancers on unigig." },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [draft, setDraft] = useState("");
  const active = conversations.find((c) => c.id === activeId)!;

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid h-[calc(100vh-7rem)] grid-cols-1 overflow-hidden rounded-2xl border bg-card md:grid-cols-[320px_1fr]">
          {/* Conversation list */}
          <aside className="flex flex-col border-r">
            <div className="border-b p-4">
              <h1 className="text-xl font-bold">Messages</h1>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search..." className="rounded-full pl-9" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left transition hover:bg-muted ${
                    c.id === activeId ? "bg-primary-soft/40" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={c.avatar} />
                      <AvatarFallback>{c.name[0]}</AvatarFallback>
                    </Avatar>
                    {c.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="truncate text-sm font-semibold">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.time}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="truncate text-xs text-muted-foreground">{c.lastMessage}</div>
                      {c.unread > 0 && (
                        <span className="ml-2 grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1.5 text-xs font-semibold text-white">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Active chat */}
          <section className="flex flex-col">
            <div className="flex items-center gap-3 border-b p-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={active.avatar} />
                <AvatarFallback>{active.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{active.name}</div>
                <div className="text-xs text-muted-foreground">
                  {active.university} {active.online && "· Online"}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-muted/30 p-6">
              {active.messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      m.from === "me"
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-card border"
                    }`}
                  >
                    <div className="text-sm">{m.text}</div>
                    <div
                      className={`mt-1 text-[10px] ${
                        m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDraft("");
              }}
              className="flex items-center gap-2 border-t p-4"
            >
              <Button type="button" variant="ghost" size="icon" className="rounded-full shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message ${active.name.split(" ")[0]}...`}
                className="rounded-full"
              />
              <Button type="submit" size="icon" className="rounded-full shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
