import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppState } from '@/context/AppContext'
import { TicketCard } from '@/components/board/TicketCard'
import { TicketDetailSheet } from '@/components/tickets/TicketDetailSheet'
import { CreateTicketDialog } from '@/components/backlog/CreateTicketDialog'
import { statusColumns, statusConfig, columnColors } from '@/lib/ticketUtils'
import { Ticket, Status } from '@/types'
import { cn } from '@/lib/utils'
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
} from '@dnd-kit/core'
import { Plus, RefreshCw, AlertCircle } from 'lucide-react'

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

const ProjectBoard = () => {
  const { projectUuid } = useParams<{ projectUuid: string }>()
  const { tickets, updateTicket, loading, error, refreshTickets, addTicket, setTickets } = useAppState()
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [projectTickets, setProjectTickets] = useState<Ticket[]>([])
  const [projectName, setProjectName] = useState<string>('')

  // Fetch project details to get project name
  const fetchProjectDetails = async () => {
    if (!projectUuid) return;
    
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:8000/api/v1/projects/${projectUuid}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const json = await response.json();
      if (json.success && json.data) {
        setProjectName(json.data.project.name || 'Unknown Project');
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  }

  // Fetch tickets for specific project
  const fetchProjectTickets = async () => {
    if (!projectUuid) return;
    
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:8000/api/v1/projects/${projectUuid}/tickets`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const json = await response.json();
      console.log('Fetched project tickets:', json);
      if (json.success) {
        // Transform API tickets to frontend format
        const transformedTickets: Ticket[] = json.data.tickets.map((apiTicket: any) => ({
          id: apiTicket.uuid,
          projectKey: apiTicket.project?.key || 'PROJ',
          number: apiTicket.key_sequence,
          title: apiTicket.title,
          description: apiTicket.description || '',
          type: apiTicket.type as any,
          priority: apiTicket.priority as any,
          status: apiTicket.status?.slug as any,
          assigneeId: apiTicket.assignee_id?.toString() || null,
          reporterId: apiTicket.reporter_id?.toString() || '',
          sprintId: apiTicket.sprint_id?.toString() || null,
          storyPoints: apiTicket.story_points,
          labels: apiTicket.labels?.map((label: any) => label.name) || [],
          dueDate: apiTicket.due_date,
          linkedIssues: [],
          comments: [],
          createdAt: apiTicket.created_at,
          updatedAt: apiTicket.updated_at,
          estimate: apiTicket.original_estimate_minutes ? `${apiTicket.original_estimate_minutes}m` : null,
        }));
        
        console.log('Transformed tickets:', transformedTickets);
        setProjectTickets(transformedTickets);
      } else {
        console.error('Failed to fetch project tickets');
      }
    } catch (error) {
      console.error('Error fetching project tickets:', error);
    }
  }

  // Fetch project details and tickets on component mount
  useEffect(() => {
    fetchProjectDetails();
    fetchProjectTickets();
  }, [projectUuid]);

  // Fetch project tickets on component mount

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // Show all project tickets (no sprint filter for project board view)
  const activeSprintTickets = projectTickets

  const columns = statusColumns.map((status) => ({
    status,
    tickets: activeSprintTickets.filter((t) => t.status === status),
  }))

  console.log('Project tickets:', projectTickets);
  console.log('Active sprint tickets:', activeSprintTickets);
  console.log('Columns:', columns);

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = activeSprintTickets.find((t) => t.id === event.active.id)
    if (ticket) setActiveTicket(ticket)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTicket(null)
    const { active, over } = event
    if (!over) return

    const ticketId = active.id as string
    let newStatus: Status | undefined

    if (statusColumns.includes(over.id as Status)) {
      newStatus = over.id as Status
    } else {
      const overTicket = activeSprintTickets.find((t) => t.id === over.id)
      if (overTicket) newStatus = overTicket.status
    }

    if (newStatus) {
      const current = activeSprintTickets.find((t) => t.id === ticketId)
      if (current && current.status !== newStatus) {
        updateTicket(ticketId, { status: newStatus })
      }
    }
  }

  const handleTicketCreated = (newTicket: any) => {
    console.log('Ticket created with data:', newTicket);
    console.log('Project UUID being used:', projectUuid);
    
    const transformedTicket: Ticket = {
      id: newTicket.uuid,
      projectKey: newTicket.project?.key || 'PROJ',
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
    }

    addTicket(transformedTicket)
    fetchProjectTickets() // Refresh project tickets
  }

  // Show loading state while fetching project tickets
  if (loading && projectTickets.length === 0) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading project tickets...</p>
        </div>
      </div>
    )
  }

  // Show error state if project tickets fetch failed
  if (error && projectTickets.length === 0) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive mb-4">Failed to load project tickets</p>
          <button
            onClick={fetchProjectTickets}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {projectName || 'Project Board'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {projectTickets.length} tickets
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
          <div className="grid grid-cols-4 gap-6 h-[calc(100vh-260px)]">
            {columns.map(({ status, tickets: colTickets }) => {
              const sc = statusConfig[status]
              const cc = columnColors[status]

              return (
                <div
                  key={status}
                  className="flex flex-col rounded-xl border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Column Header */}
                  <div className="p-4 border-b bg-muted/30 sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {/* status color dot */}
                        <div className={cn("h-2.5 w-2.5 rounded-full", cc)} />
                        <span className="text-sm font-semibold text-foreground">
                          {sc.label}
                        </span>
                        {/* count */}
                        <span className="flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {colTickets.length}
                        </span>
                      </div>
                      {/* Add button */}
                      <button
                        onClick={() => setShowCreateDialog(true)}
                        className="flex items-center justify-center h-7 w-7 rounded-md border border-border bg-background hover:bg-accent transition"
                      >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                    {/* progress bar */}
                    <div className={cn("h-[3px] rounded-full", cc)} />
                  </div>

                  {/* Column Content */}
                  <DroppableColumn status={status}>
                    <div className="flex flex-col gap-3 p-3 overflow-y-auto h-full">
                      {colTickets.map((ticket) => (
                        <TicketCard
                          key={ticket.id}
                          ticket={ticket}
                          onClick={() => setSelectedTicket(ticket)}
                        />
                      ))}
                      {/* Empty state */}
                      {colTickets.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-xs text-muted-foreground py-10">
                          No tickets
                        </div>
                      )}
                    </div>
                  </DroppableColumn>
                </div>
              )
            })}
          </div>

          <DragOverlay>
            {activeTicket && (
              <div className="rotate-2 scale-105 shadow-xl">
                <TicketCard
                  ticket={activeTicket}
                  onClick={() => { }}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create Ticket Dialog */}
      <CreateTicketDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        projectId={projectUuid}
        onTicketCreated={handleTicketCreated}
      />

      <TicketDetailSheet
        ticket={selectedTicket}
        open={!!selectedTicket}
        onOpenChange={(o) => !o && setSelectedTicket(null)}
      />
    </div>
  )
}

export default ProjectBoard
