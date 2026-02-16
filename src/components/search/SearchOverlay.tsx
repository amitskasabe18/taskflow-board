import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppState } from "@/context/AppContext";
import { team } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { statusConfig, typeConfig } from "@/lib/ticketUtils";

export function SearchOverlay({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { tickets, sprints } = useAppState();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return { tickets: [], sprints: [], members: [] };
    const q = query.toLowerCase();
    return {
      tickets: tickets.filter((t) => t.title.toLowerCase().includes(q) || `${t.projectKey}-${t.number}`.toLowerCase().includes(q)).slice(0, 8),
      sprints: sprints.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 3),
      members: team.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 3),
    };
  }, [query, tickets, sprints]);

  const hasResults = results.tickets.length > 0 || results.sprints.length > 0 || results.members.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 bg-surface border-border overflow-hidden gap-0">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets, sprints, team members..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {!query.trim() && <p className="text-sm text-muted-foreground p-4 text-center">Start typing to search...</p>}
          {query.trim() && !hasResults && <p className="text-sm text-muted-foreground p-4 text-center">No results found</p>}

          {results.tickets.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-2 py-1">Tickets</p>
              {results.tickets.map((t) => {
                const sc = statusConfig[t.status];
                return (
                  <button key={t.id} onClick={() => onOpenChange(false)} className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors">
                    <span className="text-xs font-mono text-muted-foreground">{t.projectKey}-{t.number}</span>
                    <span className="flex-1 truncate text-foreground text-left">{t.title}</span>
                    <Badge variant="outline" className={`text-[10px] ${sc.color} border-current/20`}>{sc.label}</Badge>
                  </button>
                );
              })}
            </div>
          )}

          {results.sprints.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-2 py-1">Sprints</p>
              {results.sprints.map((s) => (
                <button key={s.id} onClick={() => onOpenChange(false)} className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors">
                  <span className="flex-1 text-foreground text-left">{s.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{s.status}</span>
                </button>
              ))}
            </div>
          )}

          {results.members.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-2 py-1">Team Members</p>
              {results.members.map((m) => (
                <button key={m.id} onClick={() => onOpenChange(false)} className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors">
                  <span className="flex-1 text-foreground text-left">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.role}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
