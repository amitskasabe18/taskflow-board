import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { CreateIssueDialog } from "@/components/tickets/CreateIssueDialog";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { Menu, X } from "lucide-react";

const viewNames: Record<string, string> = {
  "/": "Board",
  "/dashboard": "Dashboard",
  "/board": "Board",
  "/backlog": "Backlog",
  "/sprints": "Sprints",
  "/team": "Team",
  "/reports": "Reports",
  "/projects": "Projects",
  "/projects/create": "Create Project",
};

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const viewName = viewNames[location.pathname] || "Board";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      // Add keyboard shortcut for sidebar toggle
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setIsSidebarCollapsed(!isSidebarCollapsed);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      <div className={`flex flex-1 flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <TopBar 
          viewName={viewName} 
          onCreateIssue={() => setCreateOpen(true)} 
          onSearchOpen={() => setSearchOpen(true)}
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <CreateIssueDialog open={createOpen} onOpenChange={setCreateOpen} />
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
