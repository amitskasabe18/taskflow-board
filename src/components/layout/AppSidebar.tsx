import { memo, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import React from "react";
import {
  LayoutGrid,
  List,
  Timer,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  Hexagon,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // assuming you have shadcn tooltip
import { ProjectsDropdown } from "@/components/projects/ProjectsDropdown";
import { useAppState } from "@/context/AppContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// ==================== Types ====================
interface NavItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

// ==================== Constants ====================
const MAIN_NAV_ITEMS: NavItem[] = [
  { title: "Board", path: "/board", icon: LayoutGrid },
  { title: "Backlog", path: "/backlog", icon: List },
  { title: "Sprints", path: "/sprints", icon: Timer },
];

const TEAM_NAV_ITEMS: NavItem[] = [
  { title: "Team", path: "/team", icon: Users },
];

const TOOLS_NAV_ITEMS: NavItem[] = [
  { title: "Reports", path: "/reports", icon: BarChart3 },
  { title: "Settings", path: "/settings", icon: Settings },
];

const AVATAR_COLORS = [
  "hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--muted))", 
  "hsl(var(--accent))", "hsl(var(--destructive))",
];

// ==================== Subcomponents ====================

const Logo = memo(({ isCollapsed }: { isCollapsed: boolean }) => (
  <div className="flex items-center justify-center px-4 py-4 border-b border-border">
    <img 
      src="/images/logo/logo_light.png" 
      alt="Logo" 
      className="h-6 w-6 object-contain" 
    />
    {!isCollapsed && <span className="text-lg font-bold text-foreground ml-2">Orbit</span>}
  </div>
));
Logo.displayName = "Logo";

const CollapseButton = memo(({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle?: () => void }) => (
  <div className="px-3 py-2 border-b border-border">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
    </button>
  </div>
));
CollapseButton.displayName = "CollapseButton";

interface NavSectionProps {
  title: string;
  items: NavItem[];
  isCollapsed: boolean;
}

const NavSection = memo(({ title, items, isCollapsed }: NavSectionProps) => {
  if (items.length === 0) return null;

  return (
    <div className="space-y-1">
      {!isCollapsed && (
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      {items.map((item) => (
        <NavItemComponent key={item.path} item={item} isCollapsed={isCollapsed} />
      ))}
    </div>
  );
});
NavSection.displayName = "NavSection";

interface NavItemComponentProps {
  item: NavItem;
  isCollapsed: boolean;
}

const NavItemComponent = memo(({ item, isCollapsed }: NavItemComponentProps) => {
  const Icon = item.icon;

  const linkContent = (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
      "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg"
    )}>
      <Icon className="h-4 w-4 shrink-0" />
      {!isCollapsed && <span className="truncate">{item.title}</span>}
    </div>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <NavLink to={item.path} end={item.path === "/board"} className="block">
            {({ isActive }) =>
              React.cloneElement(linkContent, { 'data-active': isActive })
            }
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <NavLink to={item.path} end={item.path === "/board"}>
      {({ isActive }) => React.cloneElement(linkContent, { 'data-active': isActive })}
    </NavLink>
  );
});
NavItemComponent.displayName = "NavItemComponent";

const UserMenu = memo(({ isCollapsed }: { isCollapsed: boolean }) => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthContext();

  const userInitials = useMemo(() => {
    if (!user || !user.first_name || !user.last_name) return "G";
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }, [user]);

  const avatarColor = useMemo(() => {
    if (!user) return AVATAR_COLORS[0];
    return AVATAR_COLORS[user.id % AVATAR_COLORS.length];
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="border-t border-border px-3 py-4">
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted" />
          {!isCollapsed && (
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          )}
        </div>
      </div>
    );
  }

  const userContent = (
    <div className="flex items-center gap-3 w-full">
      <Avatar className="h-8 w-8 ring-2 ring-border">
        <AvatarFallback
          className="text-xs font-semibold"
          style={{ backgroundColor: avatarColor, color: "white" }}
        >
          {userInitials}
        </AvatarFallback>
      </Avatar>
      {!isCollapsed && (
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-foreground truncate">
            {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.email || 'guest@example.com'}
          </p>
        </div>
      )}
      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  );

  return (
    <div className="border-t border-border px-3 py-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 w-full hover:bg-accent/50 rounded-lg p-1 transition-colors">
            {userContent}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={5}
          className="w-56 bg-popover border-border text-popover-foreground"
        >
          <DropdownMenuItem
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 cursor-pointer hover:bg-accent focus:bg-accent"
          >
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-accent cursor-pointer focus:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});
UserMenu.displayName = "UserMenu";

// ==================== Main Component ====================

export const AppSidebar = memo(({ isCollapsed = false, onToggle }: SidebarProps) => {
  const { currentProject } = useAppState(); // used for project context

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "flex h-screen flex-col bg-background border-r border-border fixed left-0 top-0 z-30 shadow-xl transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <Logo isCollapsed={isCollapsed} />
        <CollapseButton isCollapsed={isCollapsed} onToggle={onToggle} />

        <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {/* Dashboard */}
          <NavItemComponent
            item={{ title: "Dashboard", path: "/dashboard", icon: Home }}
            isCollapsed={isCollapsed}
          />

          {/* Projects section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Projects
                </h3>
              </div>
            )}
            {isCollapsed ? (
              <TooltipProvider>
                <ProjectsDropdown isCollapsed={isCollapsed} />
              </TooltipProvider>
            ) : (
              <ProjectsDropdown isCollapsed={isCollapsed} />
            )}
          </div>

          {/* Main navigation sections */}
          <NavSection title="Main" items={MAIN_NAV_ITEMS} isCollapsed={isCollapsed} />
          <NavSection title="Team" items={TEAM_NAV_ITEMS} isCollapsed={isCollapsed} />
          <NavSection title="Tools" items={TOOLS_NAV_ITEMS} isCollapsed={isCollapsed} />
        </nav>

        <UserMenu isCollapsed={isCollapsed} />
      </aside>
    </TooltipProvider>
  );
});

AppSidebar.displayName = "AppSidebar";
