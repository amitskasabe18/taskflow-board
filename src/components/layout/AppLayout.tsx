import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { CreateIssueDialog } from "@/components/tickets/CreateIssueDialog";
import { SearchOverlay } from "@/components/search/SearchOverlay";

const viewNames: Record<string, string> = {
  "/": "Board",
  "/board": "Board",
  "/backlog": "Backlog",
  "/sprints": "Sprints",
  "/team": "Team",
  "/reports": "Reports",
};

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const viewName = viewNames[location.pathname] || "Board";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col ml-[220px]">
        <TopBar viewName={viewName} onCreateIssue={() => setCreateOpen(true)} onSearchOpen={() => setSearchOpen(true)} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <CreateIssueDialog open={createOpen} onOpenChange={setCreateOpen} />
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
