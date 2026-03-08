import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProject } from '@/context/ProjectContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Tag, 
  MoreHorizontal, 
  Target,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Layers
} from 'lucide-react';
import { format } from 'date-fns';

export const ProjectList = () => {
  const { projects, loading, error } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />;
      case 'completed': return <Target className="h-3 w-3" />;
      case 'on_hold': return <AlertCircle className="h-3 w-3" />;
      case 'archived': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-500/20';
      case 'on_hold': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200 hover:bg-yellow-500/20';
      case 'archived': return 'bg-gray-500/10 text-gray-700 border-gray-200 hover:bg-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200 hover:bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-700 border-red-200 hover:bg-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-700 border-orange-200 hover:bg-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200 hover:bg-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200 hover:bg-gray-500/20';
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'manager': return { color: 'bg-purple-500/10 text-purple-700 border-purple-200', label: 'Manager', icon: '👑' };
      case 'lead': return { color: 'bg-blue-500/10 text-blue-700 border-blue-200', label: 'Lead', icon: '🎯' };
      case 'member': return { color: 'bg-green-500/10 text-green-700 border-green-200', label: 'Member', icon: '👤' };
      case 'viewer': return { color: 'bg-gray-500/10 text-gray-700 border-gray-200', label: 'Viewer', icon: '👁️' };
      default: return { color: 'bg-gray-500/10 text-gray-700 border-gray-200', label: 'Member', icon: '👤' };
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarGradient = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-gradient-to-br from-purple-500 to-purple-600';
      case 'lead': return 'bg-gradient-to-br from-blue-500 to-blue-600';
      default: return 'bg-gradient-to-br from-primary to-primary/80';
    }
  };

  const activeCount = projects.filter(p => p.status === 'active').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const onHoldCount = projects.filter(p => p.status === 'on_hold').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border border-primary/10 p-8">
          {/* decorative blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage and track all your projects in one place
                </p>
              </div>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-background/70 backdrop-blur-sm border px-3 py-1.5 text-sm shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-semibold text-foreground">{activeCount}</span>
                  <span className="text-muted-foreground">Active</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-background/70 backdrop-blur-sm border px-3 py-1.5 text-sm shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-semibold text-foreground">{completedCount}</span>
                  <span className="text-muted-foreground">Completed</span>
                </div>
                {onHoldCount > 0 && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/70 backdrop-blur-sm border px-3 py-1.5 text-sm shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="font-semibold text-foreground">{onHoldCount}</span>
                    <span className="text-muted-foreground">On Hold</span>
                  </div>
                )}
                <div className="inline-flex items-center gap-2 rounded-full bg-background/70 backdrop-blur-sm border px-3 py-1.5 text-sm shadow-sm">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{projects.length}</span>
                  <span className="text-muted-foreground">Total</span>
                </div>
              </div>
            </div>

            <Link to="/projects/create" className="shrink-0">
              <Button size="default" className="shadow-md hover:shadow-lg transition-shadow gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name or description…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-36 text-sm gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-9 w-36 text-sm gap-1.5">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count when filtering */}
        {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && !loading && !error && (
          <p className="text-sm text-muted-foreground -mt-2">
            Showing <span className="font-medium text-foreground">{filteredProjects.length}</span> of {projects.length} projects
          </p>
        )}

        {/* ── Loading State ── */}
        {loading && (
          <div className="flex items-center justify-center min-h-[360px]">
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-10 w-10">
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">Loading projects…</p>
            </div>
          </div>
        )}

        {/* ── Error State ── */}
        {error && (
          <div className="flex items-center justify-center min-h-[360px]">
            <Card className="max-w-sm w-full border-destructive/20 text-center">
              <CardHeader className="pb-2">
                <div className="mx-auto w-11 h-11 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <CardTitle className="text-lg">Failed to load projects</CardTitle>
                <CardDescription className="text-sm">{error}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* ── Projects Grid ── */}
        {!loading && !error && (
          <>
            {filteredProjects.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="group flex flex-col border hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card overflow-hidden"
                  >
                    {/* ── Card Header ── */}
                    <CardHeader className="pb-3 pt-5 px-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors truncate">
                              {project.name}
                            </CardTitle>
                            {project.user_role && (
                              <Badge variant="outline" className={`text-[11px] px-1.5 py-0 h-5 shrink-0 ${getRoleBadge(project.user_role).color}`}>
                                {getRoleBadge(project.user_role).icon} {getRoleBadge(project.user_role).label}
                              </Badge>
                            )}
                          </div>
                          {project.description && (
                            <CardDescription className="text-xs line-clamp-2 leading-relaxed">
                              {project.description}
                            </CardDescription>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -mt-0.5 -mr-1"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-1 gap-4 px-5 pb-5">

                      {/* Status + Priority */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium border rounded-full ${getStatusColor(project.status)}`}>
                          {getStatusIcon(project.status)}
                          <span className="capitalize">{project.status.replace('_', ' ')}</span>
                        </Badge>
                        <Badge className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium border rounded-full ${getPriorityColor(project.priority)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getPriorityDot(project.priority)}`} />
                          <span className="capitalize">{project.priority}</span>
                        </Badge>
                      </div>

                      {/* Progress */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5" />
                            Progress
                          </span>
                          <span className="text-xs font-semibold tabular-nums">{project.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Team Members */}
                      {project.users && project.users.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" />
                              Team
                              <span className="font-medium text-foreground">{project.users.length}</span>
                            </span>
                          </div>

                          {/* Avatar stack + overflow */}
                          <div className="flex items-center gap-1.5">
                            {/* Overlapping avatars */}
                            <div className="flex -space-x-2">
                              {project.users.slice(0, 5).map((user) => (
                                <div
                                  key={user.id}
                                  title={`${user.first_name} ${user.last_name} · ${user.role}`}
                                  className={`w-7 h-7 rounded-full border-2 border-background text-white text-[10px] font-semibold flex items-center justify-center ring-0 transition-transform hover:scale-110 hover:z-10 relative ${getAvatarGradient(user.role)}`}
                                >
                                  {getInitials(user.first_name, user.last_name)}
                                </div>
                              ))}
                              {project.users.length > 5 && (
                                <div className="w-7 h-7 rounded-full border-2 border-background bg-muted text-muted-foreground text-[10px] font-semibold flex items-center justify-center">
                                  +{project.users.length - 5}
                                </div>
                              )}
                            </div>

                            {/* Name list for first 2 */}
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 ml-1">
                              {project.users.slice(0, 2).map((user) => (
                                <span key={user.id} className="text-xs text-muted-foreground">
                                  {user.first_name} {user.last_name}
                                  {user.role === 'manager' && <span className="ml-1 text-purple-600">·&nbsp;Mgr</span>}
                                  {user.role === 'lead' && <span className="ml-1 text-blue-600">·&nbsp;Lead</span>}
                                </span>
                              ))}
                              {project.users.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{project.users.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Meta row: dates + budget */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          {project.start_date && project.end_date
                            ? `${format(new Date(project.start_date), 'MMM d')} – ${format(new Date(project.end_date), 'MMM d, yyyy')}`
                            : project.start_date
                              ? `Started ${format(new Date(project.start_date), 'MMM d, yyyy')}`
                              : 'No dates set'}
                        </span>
                        {project.budget && (
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <BarChart3 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            {project.currency || 'USD'} {project.budget.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Spacer pushes buttons to bottom */}
                      <div className="flex-1" />

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3 border-t">
                        <Link to={`/${project.uuid}/board`} className="flex-1">
                          <Button size="sm" variant="default" className="w-full gap-1.5 text-xs h-8">
                            <Target className="h-3.5 w-3.5" />
                            Open Board
                          </Button>
                        </Link>
                        <Link to={`/projects/${project.uuid}`}>
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 px-3">
                            <Settings className="h-3.5 w-3.5" />
                            Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* ── Empty State ── */
              <div className="flex items-center justify-center min-h-[360px]">
                <div className="text-center max-w-sm space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Target className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-foreground">
                      {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                        ? 'No matching projects'
                        : 'No projects yet'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                        ? 'Try adjusting your search or filters to find what you\'re looking for.'
                        : 'Create your first project to get started managing your work.'}
                    </p>
                  </div>
                  {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' ? (
                    <Link to="/projects/create">
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Project
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPriorityFilter('all'); }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};