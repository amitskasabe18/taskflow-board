import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useProject } from '@/context/ProjectContext';
import { Plus, FolderOpen, Calendar, Users, Tag } from 'lucide-react';

interface ProjectsDropdownProps {
  isCollapsed?: boolean;
}

export const ProjectsDropdown = ({ isCollapsed = false }: ProjectsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { projects, loading } = useProject();
  const location = useLocation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const triggerContent = (
    <Button 
      variant="ghost" 
      className={`w-full justify-between ${location.pathname.startsWith('/projects') ? 'bg-accent' : ''}`}
    >
      <div className="flex items-center gap-2">
        <FolderOpen className="h-4 w-4 shrink-0" />
        {!isCollapsed && <span>Projects</span>}
      </div>
      {!isCollapsed && <span className="text-muted-foreground">{projects.length}</span>}
    </Button>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              {triggerContent}
            </DropdownMenuTrigger>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
          Projects
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {triggerContent}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start">
        <div className="p-2">
          <Link to="/projects" onClick={() => setIsOpen(false)}>
            <DropdownMenuItem className="flex items-center gap-2 p-2 cursor-pointer">
              <FolderOpen className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">All Projects</div>
                <div className="text-sm text-muted-foreground">
                  View and manage all projects
                </div>
              </div>
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuSeparator />
          
          <Link to="/projects/create" onClick={() => setIsOpen(false)}>
            <DropdownMenuItem className="flex items-center gap-2 p-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">Create New Project</div>
                <div className="text-sm text-muted-foreground">
                  Start a new project
                </div>
              </div>
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuSeparator />
          
          <div className="px-2 py-1">
            <div className="text-sm font-medium text-muted-foreground mb-2">Recent Projects</div>
            {loading ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No projects found
              </div>
            ) : (
            <div className="space-y-1">
              {projects.slice(0, 5).map((project) => (
                <Link 
                  key={project.id} 
                  to={`/projects/${project.id}`} 
                  onClick={() => setIsOpen(false)}
                >
                  <DropdownMenuItem className="flex flex-col items-start p-2 cursor-pointer">
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-medium truncate">{project.name}</span>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {project.startDate.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {project.team.length}
                        </div>
                      </div>
                      <Badge variant="outline" className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                </Link>
              ))}
            </div>
            )}
          </div>
          
          {projects.length > 5 && (
            <>
              <DropdownMenuSeparator />
              <Link to="/projects" onClick={() => setIsOpen(false)}>
                <DropdownMenuItem className="flex items-center justify-center p-2 cursor-pointer text-sm text-muted-foreground">
                  View all {projects.length} projects
                </DropdownMenuItem>
              </Link>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
