import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Ticket, Sprint, Project } from "@/types";
import { ticketService, ProjectTicketsResponse } from "@/services/ticketService";

interface AppState {
  tickets: Ticket[];
  sprints: Sprint[];
  currentProject: Project;
  loading: boolean;
  error: string | null;
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  setSprints: React.Dispatch<React.SetStateAction<Sprint[]>>;
  setCurrentProject: (p: Project) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  addTicket: (ticket: Ticket) => void;
  refreshTickets: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [currentProject, setCurrentProject] = useState<Project>({
    id: "6e972d92-0193-487f-91e8-f134bd4576fb",
    name: "Codeseed CMS",
    key: "CMS",
    description: "Main project for codeseed CMS"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTickets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response: ProjectTicketsResponse = await ticketService.getProjectTickets(
        "1", // Use numeric project ID 1 for now
        {
          include_archived: false,
          per_page: 100,
          sort_by: 'position',
          sort_order: 'asc'
        }
      );
      
      // Transform API tickets to frontend format
      const transformedTickets: Ticket[] = response.data.tickets.map(apiTicket => {
        const transformed = {
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
        labels: apiTicket.labels?.map(label => label.name) || [],
        dueDate: apiTicket.due_date,
        linkedIssues: [],
        comments: [],
        attachments: (apiTicket as any).attachments || [],
        createdAt: apiTicket.created_at,
        updatedAt: apiTicket.updated_at,
        estimate: apiTicket.original_estimate_minutes ? `${apiTicket.original_estimate_minutes}m` : null,
      };
        return transformed;
      });
      
      setTickets(transformedTickets);
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTickets();
  }, [currentProject]);

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)));
  };

  const addTicket = (ticket: Ticket) => {
    setTickets((prev) => [...prev, ticket]);
  };

  return (
    <AppContext.Provider value={{ 
      tickets, 
      sprints, 
      currentProject, 
      loading,
      error,
      setTickets, 
      setSprints, 
      setCurrentProject, 
      updateTicket, 
      addTicket,
      refreshTickets
    }}>
      {children}
    </AppContext.Provider>
  );
};
