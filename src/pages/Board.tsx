import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { TicketCard } from "@/components/board/TicketCard";
import { TicketDetailSheet } from "@/components/tickets/TicketDetailSheet";
import { CreateTicketDialog } from "@/components/backlog/CreateTicketDialog";
import { statusColumns, statusConfig, columnColors } from "@/lib/ticketUtils";
import { Ticket, Status } from "@/types";
import { cn } from "@/lib/utils";
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
import ProjectCard from "@/components/ProjectCard";

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
  const { tickets, updateTicket, loading, error, refreshTickets, currentProject, addTicket } = useAppState();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projects, setProjects] = useState([
    { id: "6e972d92-0193-487f-91e8-f134bd4576fb", name: "Codeseed CMS", key: "CMS", description: "Main project for codeseed CMS" }
  ]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { isDark } = useTheme();

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

  if (loading && !projectsLoading) {
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your projects and team collaborations
            </p>
          </div>
          
          {currentProject && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Ticket
            </button>
          )}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className={`text-6xl mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                📁
              </div>
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                No projects yet
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Get started by creating your first project
              </p>
              <a
                href="/projects/create"
                className={`px-4 py-2 text-sm font-medium rounded-md text-white ${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                Create Your First Project
              </a>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/board?project=${project.id}`)}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105"
              >
                <ProjectCard
                  project={project}
                  onJoin={() => {/* Handle join if needed */}}
                  onLeave={() => {/* Handle leave if needed */}}
                />
              </div>
            ))
          )}
        </div>

        {/* Board Section - Only show if project is selected */}
        {currentProject && (
          <div className="mt-8 border-t pt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {currentProject.name} Board
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {tickets.length} tickets
                </p>
              </div>
              
              <div className="flex items-center gap-4">
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

            {/* Kanban Board */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-4 gap-4 h-[calc(100vh-280px)]">
                {columns.map(({ status, tickets: colTickets }) => {
                  const sc = statusConfig[status];
                  const cc = columnColors[status];
                  return (
                    <div key={status} className="flex flex-col rounded-lg bg-surface border border-border overflow-hidden">
                      <div className="p-3 border-b border-border">
                        <div className={cn("h-0.5 rounded-full mb-2.5", cc)} />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{sc.label}</span>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-muted-foreground">{colTickets.length}</span>
                          </div>
                          <button
                            onClick={() => setShowCreateDialog(true)}
                            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            aria-label={`Add ${sc.label} ticket`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <DroppableColumn status={status}>
                        {colTickets.map((ticket) => (
                          <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            onClick={() => setSelectedTicket(ticket)}
                          />
                        ))}
                      </DroppableColumn>
                    </div>
                  );
                })}
              </div>

              <DragOverlay>
                {activeTicket && (
                  <TicketCard
                    ticket={activeTicket}
                    onClick={() => {}}
                  />
                )}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </div>

      {/* Create Ticket Dialog */}
      {currentProject && (
        <CreateTicketDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          projectId={currentProject.id}
          onTicketCreated={handleTicketCreated}
        />
      )}

      <TicketDetailSheet
        ticket={selectedTicket}
        open={!!selectedTicket}
        onOpenChange={(o) => !o && setSelectedTicket(null)}
      />
    </div>
  );
}