import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Ticket } from "@/types";
import { team } from "@/data/mockData";
import { priorityConfig, typeConfig } from "@/lib/ticketUtils";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  ticket: Ticket;
  onClick: () => void;
}

export function TicketCard({ ticket, onClick }: Props) {
  const assignee = team.find((m) => m.id === ticket.assigneeId);
  const pc = priorityConfig[ticket.priority] || { className: "", emoji: "📋", label: "Unknown" };
  const tc = typeConfig[ticket.type] || { className: "", emoji: "📋", label: "Unknown" };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id, data: { ticket } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg bg-surface-raised p-3 border border-border hover:border-primary/50 transition-all hover-lift",
        pc.className,
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary/40"
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
