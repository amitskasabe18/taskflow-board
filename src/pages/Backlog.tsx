import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, GripVertical, Plus } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { team } from "@/data/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketDetailSheet } from "@/components/tickets/TicketDetailSheet";
import { statusConfig, priorityConfig, typeConfig } from "@/lib/ticketUtils";
import { Ticket } from "@/types";
import { cn } from "@/lib/utils";

export default function Backlog() {
  const { tickets, sprints } = useAppState();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ s4: true, s5: true, backlog: true });

  const toggle = (id: string) => setExpandedSections((p) => ({ ...p, [id]: !p[id] }));

  const sprintSections = useMemo(() => {
    const activeSprints = sprints.filter((s) => s.status !== "completed");
    return activeSprints.map((sprint) => ({
      sprint,
      tickets: tickets.filter((t) => t.sprintId === sprint.id),
    }));
  }, [tickets, sprints]);

  const backlogTickets = useMemo(() => tickets.filter((t) => !t.sprintId), [tickets]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Backlog</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and prioritize your product backlog</p>
      </div>

      <div className="space-y-2">
        {sprintSections.map(({ sprint, tickets: sprintTickets }) => (
          <Section
            key={sprint.id}
            id={sprint.id}
            title={sprint.name}
            subtitle={sprint.goal}
            count={sprintTickets.length}
            expanded={expandedSections[sprint.id] ?? true}
            onToggle={() => toggle(sprint.id)}
            badge={sprint.status === "active" ? "Active" : "Planning"}
            badgeVariant={sprint.status === "active" ? "default" : "secondary"}
            tickets={sprintTickets}
            onTicketClick={setSelectedTicket}
          />
        ))}

        <Section
          id="backlog"
          title="Backlog"
          count={backlogTickets.length}
          expanded={expandedSections.backlog ?? true}
          onToggle={() => toggle("backlog")}
          tickets={backlogTickets}
          onTicketClick={setSelectedTicket}
        />
      </div>

      <TicketDetailSheet ticket={selectedTicket} open={!!selectedTicket} onOpenChange={(o) => !o && setSelectedTicket(null)} />
    </div>
  );
}

function Section({ id, title, subtitle, count, expanded, onToggle, badge, badgeVariant, tickets, onTicketClick }: {
  id: string; title: string; subtitle?: string; count: number; expanded: boolean; onToggle: () => void;
  badge?: string; badgeVariant?: "default" | "secondary"; tickets: Ticket[]; onTicketClick: (t: Ticket) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <button onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors">
        {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {subtitle && <span className="text-xs text-muted-foreground">— {subtitle}</span>}
        <span className="ml-auto flex items-center gap-2">
          {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
          <span className="text-xs text-muted-foreground">{count} issues</span>
        </span>
      </button>
      {expanded && (
        <div className="border-t border-border">
          {tickets.map((t) => <TicketRow key={t.id} ticket={t} onClick={() => onTicketClick(t)} />)}
          {tickets.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No issues</p>}
        </div>
      )}
    </div>
  );
}

function TicketRow({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  const assignee = team.find((m) => m.id === ticket.assigneeId);
  const sc = statusConfig[ticket.status];
  const pc = priorityConfig[ticket.priority];
  const tc = typeConfig[ticket.type];

  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/30 transition-colors border-b border-border/50 last:border-b-0">
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab" />
      <span className="text-xs">{tc.emoji}</span>
      <span className="text-xs font-mono text-muted-foreground w-16">{ticket.projectKey}-{ticket.number}</span>
      <span className="flex-1 text-foreground text-left truncate">{ticket.title}</span>
      <span className="text-xs">{pc.emoji}</span>
      {assignee && (
        <Avatar className="h-5 w-5">
          <AvatarFallback className="text-[9px] font-semibold" style={{ backgroundColor: assignee.avatarColor, color: "white" }}>{assignee.initials}</AvatarFallback>
        </Avatar>
      )}
      {ticket.storyPoints && <span className="text-xs text-muted-foreground w-6 text-right">{ticket.storyPoints}</span>}
      <Badge variant="outline" className={cn("text-[10px] w-20 justify-center", sc.color)}>{sc.label}</Badge>
    </button>
  );
}
