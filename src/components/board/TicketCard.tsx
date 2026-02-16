import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Ticket } from "@/types";
import { team } from "@/data/mockData";
import { priorityConfig, typeConfig } from "@/lib/ticketUtils";
import { cn } from "@/lib/utils";

interface Props {
  ticket: Ticket;
  onClick: () => void;
}

export function TicketCard({ ticket, onClick }: Props) {
  const assignee = team.find((m) => m.id === ticket.assigneeId);
  const pc = priorityConfig[ticket.priority];
  const tc = typeConfig[ticket.type];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg bg-surface-raised p-3 border border-border hover:border-primary/50 transition-all hover-lift",
        pc.className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-mono text-muted-foreground">{ticket.projectKey}-{ticket.number}</span>
        <span className="text-xs">{tc.emoji}</span>
      </div>
      <h4 className="text-sm font-medium text-foreground leading-snug mb-3">{ticket.title}</h4>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{pc.emoji} {pc.label}</span>
          {ticket.storyPoints && <span>• {ticket.storyPoints}pt</span>}
        </div>
        {assignee && (
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[9px] font-semibold" style={{ backgroundColor: assignee.avatarColor, color: "white" }}>{assignee.initials}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </button>
  );
}
