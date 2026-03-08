import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Ticket } from "@/types";
import { priorityConfig, typeConfig } from "@/lib/ticketUtils";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Clock, Paperclip, MessageCircle, Tag, History } from "lucide-react";
import { useState, useEffect } from "react";

interface Props {
  ticket: Ticket;
  onClick: () => void;
}

export function TicketCard({ ticket, onClick }: Props) {
  const assignee = ticket.assignee;
  const pc = priorityConfig[ticket.priority] || { className: "", emoji: "📋", label: "Unknown" };
  const tc = typeConfig[ticket.type] || { className: "", emoji: "📋", label: "Unknown" };
  
  // History state
  const [ticketHistory, setTicketHistory] = useState<any>(null);
  const [historyCount, setHistoryCount] = useState(0);

  // Fetch ticket history
  useEffect(() => {
    const fetchTicketHistory = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL || 'localhost:8000'}/api/v1/tickets/${ticket.id}/history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (data.success) {
          setTicketHistory(data.data);
          setHistoryCount(data.data.total_changes || 0);
        }
      } catch (error) {
        console.error('Failed to fetch ticket history:', error);
      }
    };

    if (ticket.id) {
      fetchTicketHistory();
    }
  }, [ticket.id]);

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

  // Calculate completion percentage if estimates exist
  const completionPercentage = ticket.originalEstimateMinutes && ticket.remainingEstimateMinutes
    ? Math.round(((ticket.originalEstimateMinutes - ticket.remainingEstimateMinutes) / ticket.originalEstimateMinutes) * 100)
    : null;

  // Format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const dueDate = formatDate(ticket.dueDate);
  const startDate = formatDate(ticket.startDate);

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
      {/* Header with ticket number and type */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">#{ticket.projectKey}-{ticket.number}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
            {tc.label}
          </span>
        </div>
        <span className="text-xs opacity-70">{tc.emoji}</span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-foreground leading-snug mb-3 line-clamp-2">{ticket.title}</h4>

      {/* Progress bar if estimates exist */}
      {completionPercentage !== null && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Main info row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {pc.emoji} {pc.label}
          </span>
          {ticket.storyPoints && (
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
              {ticket.storyPoints}pt
            </span>
          )}
        </div>
        
        {/* Date indicators */}
        <div className="flex items-center gap-1 text-xs">
          {startDate && (
            <span className="flex items-center gap-1 text-muted-foreground" title="Start Date">
              <Calendar className="h-3 w-3" />
              {startDate}
            </span>
          )}
          {dueDate && (
            <span className={cn(
              "flex items-center gap-1 font-medium",
              new Date(ticket.dueDate) < new Date() ? "text-destructive" : "text-muted-foreground"
            )} title="Due Date">
              <Clock className="h-3 w-3" />
              {dueDate}
            </span>
          )}
        </div>
      </div>

      {/* Footer with assignee and additional info */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          {assignee && (
            <div className="flex items-center gap-1.5">
              <Avatar className="h-4 w-4">
                <AvatarFallback 
                  className="text-[7px] font-semibold" 
                  style={{ backgroundColor: `hsl(${assignee.id * 137 % 360}, 70%, 60%)`, color: "white" }}
                >
                  {assignee.first_name && assignee.last_name 
                    ? `${assignee.first_name[0]}${assignee.last_name[0]}`.toUpperCase()
                    : assignee.email ? assignee.email[0].toUpperCase() : 'U'
                  }
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {assignee.first_name} {assignee.last_name}
              </span>
            </div>
          )}
          
          {/* Additional indicators */}
          <div className="flex items-center gap-1">
            {ticket.attachments && ticket.attachments.length > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground" title="Attachments">
                <Paperclip className="h-3 w-3" />
                {ticket.attachments.length}
              </span>
            )}
            {ticket.comments && ticket.comments.length > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground" title="Comments">
                <MessageCircle className="h-3 w-3" />
                {ticket.comments.length}
              </span>
            )}
            {ticket.labels && ticket.labels.length > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground" title="Labels">
                <Tag className="h-3 w-3" />
                {ticket.labels.length}
              </span>
            )}
            {historyCount > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground" title={`History: ${historyCount} changes`}>
                <History className="h-3 w-3" />
                {historyCount}
              </span>
            )}
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1">
          {ticket.resolutionStatus && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-warning/10 text-warning">
              {ticket.resolutionStatus}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
