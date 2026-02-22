import { useState, useMemo } from "react";
import { Plus, RefreshCw, AlertCircle, ChevronDown } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { TicketCard } from "@/components/board/TicketCard";
import { TicketDetailSheet } from "@/components/tickets/TicketDetailSheet";
import { CreateTicketDialog } from "@/components/backlog/CreateTicketDialog";
import { statusColumns, statusConfig, columnColors } from "@/lib/ticketUtils";
import { Ticket, Status } from "@/types";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

function DroppableColumn({
  status,
  children,
}: {
  status: Status;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 overflow-y-auto p-2 space-y-2 transition-colors",
        isOver && "bg-primary/5"
      )}
    >
      {children}
    </div>
  );
}

export default function Board() {
  const { tickets, updateTicket, loading, error, refreshTickets, currentProject, addTicket, setCurrentProject } = useAppState();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projects, setProjects] = useState([
    { id: "6e972d92-0193-487f-91e8-f134bd4576fb", name: "Codeseed CMS", key: "CMS", description: "Main project for codeseed CMS" }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeSprintTickets = useMemo(
    () => tickets.filter((t) => t.sprintId === "s4" || !t.sprintId), // Show both sprint and backlog tickets
    [tickets]
  );

  const columns = useMemo(
    () =>
      statusColumns.map((status) => ({
        status,
        tickets: activeSprintTickets.filter((t) => t.status === status),
      })),
    [activeSprintTickets]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = activeSprintTickets.find((t) => t.id === event.active.id);
    if (ticket) setActiveTicket(ticket);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTicket(null);
    const { active, over } = event;
    if (!over) return;

    const ticketId = active.id as string;
    // over.id is either a column status or another ticket id
    let newStatus: Status | undefined;

    if (statusColumns.includes(over.id as Status)) {
      newStatus = over.id as Status;
    } else {
      // Dropped over another ticket — find that ticket's status
      const overTicket = activeSprintTickets.find((t) => t.id === over.id);
      if (overTicket) newStatus = overTicket.status;
    }

    if (newStatus) {
      const current = activeSprintTickets.find((t) => t.id === ticketId);
      if (current && current.status !== newStatus) {
        updateTicket(ticketId, { status: newStatus });
      }
    }
  };

  const handleTicketCreated = (newTicket: any) => {
    // Transform the API response to match frontend Ticket format
    const transformedTicket: Ticket = {
      id: newTicket.uuid,
      projectKey: newTicket.project?.key || 'CMS',
      number: newTicket.key_sequence,
      title: newTicket.title,
      description: newTicket.description || '',
      type: newTicket.type as any,
      priority: newTicket.priority as any,
      status: newTicket.status?.slug as any,
      assigneeId: newTicket.assignee_id?.toString() || null,
      reporterId: newTicket.reporter_id?.toString() || '',
      sprintId: newTicket.sprint_id?.toString() || null,
      storyPoints: newTicket.story_points,
      labels: newTicket.labels?.map((label: any) => label.name) || [],
      dueDate: newTicket.due_date,
      linkedIssues: [],
      comments: [],
      createdAt: newTicket.created_at,
      updatedAt: newTicket.updated_at,
      estimate: newTicket.original_estimate_minutes ? `${newTicket.original_estimate_minutes}m` : null,
    };
    
    addTicket(transformedTicket);
    refreshTickets(); // Refresh to get the latest data
  };

  // Extract numeric project ID from UUID if needed, or use as-is if already numeric
  const getProjectId = () => {
    // For now, use hardcoded project ID 1 since backend expects numeric
    return 1;
  };

  const handleProjectChange = (projectId: string) => {
    const selectedProject = projects.find(p => p.id === projectId);
    if (selectedProject) {
      setCurrentProject(selectedProject);
    }
  };

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={refreshTickets}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Board</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {currentProject.name} — {tickets.length} tickets
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={currentProject.id} onValueChange={handleProjectChange}>
            <SelectTrigger className="w-[200px] border-2 focus:border-primary/50">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-muted-foreground text-sm">({project.key})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Ticket
          </button>
          <button
            onClick={refreshTickets}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            title="Refresh tickets"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-4 h-[calc(100vh-180px)]">
          {columns.map(({ status, tickets: colTickets }) => {
            const sc = statusConfig[status];
            const cc = columnColors[status];
            return (
              <div key={status} className="flex flex-col rounded-lg bg-surface border border-border overflow-hidden">
                <div className="px-3 py-2.5 border-b border-border">
                  <div className={cn("h-0.5 rounded-full mb-2.5", cc)} />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{sc.label}</span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-muted-foreground">{colTickets.length}</span>
                    </div>
                    <button className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" aria-label={`Add ${sc.label} ticket`}>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <DroppableColumn status={status}>
                  <SortableContext items={colTickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {colTickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onClick={() => setSelectedTicket(ticket)}
                      />
                    ))}
                  </SortableContext>
                </DroppableColumn>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTicket ? (
            <div className="w-[280px] opacity-90 pointer-events-none">
              <TicketCard ticket={activeTicket} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TicketDetailSheet
        ticket={selectedTicket}
        open={!!selectedTicket}
        onOpenChange={(o) => !o && setSelectedTicket(null)}
      />

      <CreateTicketDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        projectId={currentProject.id}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
}
