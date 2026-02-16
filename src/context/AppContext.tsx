import React, { createContext, useContext, useState, ReactNode } from "react";
import { tickets as initialTickets, projects, sprints as initialSprints } from "@/data/mockData";
import { Ticket, Sprint, Project } from "@/types";

interface AppState {
  tickets: Ticket[];
  sprints: Sprint[];
  currentProject: Project;
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  setSprints: React.Dispatch<React.SetStateAction<Sprint[]>>;
  setCurrentProject: (p: Project) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  addTicket: (ticket: Ticket) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [sprints, setSprints] = useState<Sprint[]>(initialSprints);
  const [currentProject, setCurrentProject] = useState<Project>(projects[0]);

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)));
  };

  const addTicket = (ticket: Ticket) => {
    setTickets((prev) => [...prev, ticket]);
  };

  return (
    <AppContext.Provider value={{ tickets, sprints, currentProject, setTickets, setSprints, setCurrentProject, updateTicket, addTicket }}>
      {children}
    </AppContext.Provider>
  );
};
