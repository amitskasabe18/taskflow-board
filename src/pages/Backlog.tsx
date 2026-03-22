import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, GripVertical, Plus, Target } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { team } from "@/data/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketDetailSheet } from "@/components/tickets/TicketDetailSheet";
import { CreateBacklogDialog } from "@/components/backlog/CreateBacklogDialog";
import { CreateTicketDialog } from "@/components/backlog/CreateTicketDialog";
import { statusConfig, priorityConfig, typeConfig } from "@/lib/ticketUtils";
import { Ticket } from "@/types";
import { cn } from "@/lib/utils";
import { ticketService } from "@/services/ticketService";

export default function Backlog() {
  const { tickets, sprints, currentProject } = useAppState();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ s4: true, s5: true, backlog: true });
  const [showCreateBacklogDialog, setShowCreateBacklogDialog] = useState(false);
  const [showCreateTicketDialog, setShowCreateTicketDialog] = useState(false);

  const toggle = (id: string) => setExpandedSections((p) => ({ ...p, [id]: !p[id] }));

  const handleCreateBacklog = (backlog: { name: string; description: string }) => {
    // TODO: Implement backlog creation logic
    console.log('Creating backlog:', backlog);
    // This would typically call an API to create the backlog
  };

  const handleTicketCreated = (newTicket: any) => {
    console.log('Ticket created successfully:', newTicket);
    // You could update the local state or refresh the tickets list
    // For now, just log the success
    // In a real app, you might want to:
    // 1. Add the new ticket to the local state
    // 2. Show a success notification
    // 3. Refresh the tickets list from the server
  };

  const sprintSections = useMemo(() => {
    const activeSprints = sprints.filter((s) => s.status !== "completed");
    return activeSprints.map((sprint) => ({
      sprint,
      tickets: tickets.filter((t) => t.sprintId === sprint.id),
    }));
  }, [tickets, sprints]);

  const backlogTickets = useMemo(() => tickets.filter((t) => !t.sprintId), [tickets]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-8 border border-primary/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-2xl" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Backlog</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Manage and prioritize your product backlog
            </p>
          </div>
          
          <div className="flex gap-2 self-end sm:self-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowCreateBacklogDialog(true)}
              className="border-2 hover:border-primary/50 transition-colors"
            >
              <Target className="h-4 w-4 mr-2" />
              Create Backlog
            </Button>
            <Button 
              size="lg"
              onClick={() => setShowCreateTicketDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ticket
            </Button>
          </div>
        </div>
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
      
      <CreateBacklogDialog 
        open={showCreateBacklogDialog}
        onOpenChange={setShowCreateBacklogDialog}
        onCreateBacklog={handleCreateBacklog}
      />
      
      <CreateTicketDialog 
        open={showCreateTicketDialog}
        onOpenChange={setShowCreateTicketDialog}
        projectId={Number(currentProject?.id) || 1}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
}

function Section({ id, title, subtitle, count, expanded, onToggle, badge, badgeVariant, tickets, onTicketClick }: {
  id: string; title: string; subtitle?: string; count: number; expanded: boolean; onToggle: () => void;
  badge?: string; badgeVariant?: "default" | "secondary"; tickets: Ticket[]; onTicketClick: (t: Ticket) => void;
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
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
        <div className="border-t">
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
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/30 transition-colors border-b last:border-b-0">
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab" />
      <span className="text-xs">{tc.emoji}</span>
      <span className="text-xs font-mono text-muted-foreground w-16">{ticket.key}</span>
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
