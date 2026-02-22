import { Search, Bell, Plus, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { team } from "@/data/mockData";
import { useAppState } from "@/context/AppContext";

interface TopBarProps {
  viewName: string;
  onCreateIssue: () => void;
  onSearchOpen: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export function TopBar({ viewName, onCreateIssue, onSearchOpen, onToggleSidebar, isSidebarCollapsed }: TopBarProps) {
  const { currentProject } = useAppState();
  const onlineMembers = team.filter((m) => m.status === "available").slice(0, 3);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{currentProject.name}</span>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-medium text-foreground">{viewName}</span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Search */}
        <button
          onClick={onSearchOpen}
          className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/50 transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded bg-accent px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Create Issue */}
        <Button onClick={onCreateIssue} size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Create Issue
        </Button>

        {/* Notifications */}
        <button className="relative rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        {/* Online Avatars */}
        <div className="flex -space-x-1.5">
          {onlineMembers.map((m) => (
            <Avatar key={m.id} className="h-7 w-7 border-2 border-surface">
              <AvatarFallback className="text-[10px] font-semibold" style={{ backgroundColor: m.avatarColor, color: "white" }}>
                {m.initials}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
    </header>
  );
}
