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
    setLoading(false);
    setError(null);
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
