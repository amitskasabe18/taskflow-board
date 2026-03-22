import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Ticket, Sprint } from "@/types";
import { Project } from "@/types/project";
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
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
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
    id: 1,
    uuid: "6e972d92-0193-487f-91e8-f134bd4576fb",
    name: "ORBIT",
    shortcode: "ORBI",
    description: "Main project for orbit",
    status: "active",
    priority: "medium",
    organisation_id: 1,
    created_by: {
      id: 1,
      uuid: "user-uuid",
      first_name: "Admin",
      last_name: "User",
      email: "admin@example.com",
      role: "admin",
      is_active: 1,
      organisation_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTickets = async () => {
    setLoading(false);
    setError(null);
  };

  useEffect(() => {
    refreshTickets();
  }, [currentProject]);

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    console.log('Updating ticket:', id, 'with updates:', updates);
    try {
      const token = localStorage.getItem('auth_token');
      const url = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/v1/tickets/${id}`;
      console.log('API URL:', url);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      console.log('API response status:', response.status);
      
      if (response.ok) {
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)));
        console.log('Ticket updated successfully in local state');
      } else {
        const errorText = await response.text();
        console.error('Failed to update ticket:', response.statusText, 'Response:', errorText);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
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
