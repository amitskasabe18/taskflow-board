import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { TicketCard } from "@/components/board/TicketCard";
import { TicketDetailSheet } from "@/components/tickets/TicketDetailSheet";
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
  const { tickets, updateTicket } = useAppState();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeSprintTickets = useMemo(
    () => tickets.filter((t) => t.sprintId === "s4"),
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

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Board</h1>
        <p className="text-sm text-muted-foreground mt-1">Sprint 4 — Alpha Launch</p>
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
    </div>
  );
}
