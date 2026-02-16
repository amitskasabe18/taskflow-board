import { NavLink, useLocation } from "react-router-dom";
import { LayoutGrid, List, Timer, Users, BarChart3, Settings, ChevronDown, Hexagon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { projects, team } from "@/data/mockData";
import { useAppState } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Board", path: "/board", icon: LayoutGrid },
  { title: "Backlog", path: "/backlog", icon: List },
  { title: "Sprints", path: "/sprints", icon: Timer },
  { title: "Team", path: "/team", icon: Users },
  { title: "Reports", path: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const location = useLocation();
  const { currentProject, setCurrentProject } = useAppState();
  const currentUser = team[0];

  return (
    <aside className="flex h-screen w-[220px] flex-col border-r border-border bg-surface fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <Hexagon className="h-6 w-6 text-primary" strokeWidth={2.5} />
        <span className="text-lg font-semibold text-foreground">Planeify</span>
      </div>

      {/* Project Switcher */}
      <div className="px-3 mb-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <span className="truncate">{currentProject.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 bg-popover border-border">
            {projects.map((p) => (
              <DropdownMenuItem key={p.id} onClick={() => setCurrentProject(p)} className={cn(p.id === currentProject.id && "bg-accent")}>
                <span className="font-medium">{p.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{p.key}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active = location.pathname === item.path || (item.path === "/board" && location.pathname === "/");
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-muted text-primary border-l-2 border-l-primary -ml-px"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: currentUser.avatarColor, color: "white" }}>
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
        </div>
      </div>
    </aside>
  );
}
