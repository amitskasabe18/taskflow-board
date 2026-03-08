import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProject } from '@/context/ProjectContext';
import { InviteUserDialog } from '@/components/projects/InviteUserDialog';
import {
  ArrowLeft, Calendar, Users, Tag, Edit, Trash2, Loader2,
  Crown, Shield, Clock, Target, Flag, UserPlus, Settings
} from 'lucide-react';
import { projectService } from '@/services/projectService';
import { Project } from '@/types/project';

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteProject } = useProject();
  const [project, setProject] = useState<Project | null>(null);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const projectData = await projectService.getProject(id);
        setProject(projectData);

        setMembersLoading(true);
        const membersData = await projectService.getProjectMembers(id);
        setProjectMembers(membersData.members);
      } catch (err: any) {
        console.error('Error fetching project details:', err);
        setError(err.response?.data?.message || 'Failed to fetch project details');
        setProject(null);
      } finally {
        setLoading(false);
        setMembersLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(project!.id);
        navigate('/projects');
      } catch (err: any) {
        console.error('Error deleting project:', err);
        alert(err.response?.data?.message || 'Failed to delete project. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'completed': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'archived': return 'bg-gray-500/10 text-gray-600 border-gray-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="max-w-md w-full border border-destructive/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Flag className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">
              {error ? 'Error' : 'Project Not Found'}
            </CardTitle>
            <CardDescription>
              {error || "The project you're looking for doesn't exist or has been deleted."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/projects')} variant="default">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-8 border border-primary/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-2xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/projects')}
                className="hover:bg-transparent -ml-3"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Projects
              </Button>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {project.name}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {project.description}
            </p>
          </div>

          <div className="flex gap-2 self-end sm:self-center">
            <Button variant="outline" size="lg" className="shadow-sm hover:shadow-md transition-all">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={handleDelete}
              className="shadow-sm hover:shadow-md transition-all"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Card */}
          <Card className="border">
            <CardHeader className="pb-2 border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Overall Completion</span>
                  <span className="text-3xl font-bold text-primary">{project.progress}%</span>
                </div>
                <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${project.progress}%` }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30 blur-sm" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {project.progress === 100
                    ? 'Project completed successfully!'
                    : `${100 - project.progress}% remaining to reach goal`
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Team Members Card */}
          <Card className="border">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-primary" />
                    Team Members
                  </CardTitle>
                  <CardDescription>
                    People collaborating on this project
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <Users className="h-3 w-3 mr-1" />
                    {projectMembers.length} members
                  </Badge>
                  {membersLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <InviteUserDialog
                    projectUuid={project.id}
                    projectName={project.name}
                  >
                    <Button size="sm" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Invite
                    </Button>
                  </InviteUserDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Project Owner */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-primary/20">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Crown className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Project Owner</span>
                      <Badge variant="secondary" className="text-xs">
                        {project.owner}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Has full administrative access
                    </p>
                  </div>
                </div>

                {/* Members List */}
                {projectMembers.length > 0 ? (
                  <div className="grid gap-3">
                    {projectMembers.map((member, index) => (
                      <div
                        key={member.uuid || index}
                        className="group flex items-center gap-4 p-4 rounded-lg border bg-card transition-all duration-200"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-background">
                            {member.profile_photo_path ? (
                              <img
                                src={member.profile_photo_path}
                                alt={member.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-semibold text-foreground">
                                {member.name?.[0]?.toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                          {member.is_project_owner && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 border-2 border-background flex items-center justify-center">
                              <Crown className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold truncate">{member.name || 'Unknown'}</span>
                            {member.is_project_owner && (
                              <Badge variant="outline" className="text-xs border-yellow-200 bg-yellow-50 text-yellow-700">
                                Owner
                              </Badge>
                            )}
                            {member.is_current_user && !member.is_project_owner && (
                              <Badge variant="secondary" className="text-xs">
                                You
                              </Badge>
                            )}
                            {member.role && (
                              <Badge variant="outline" className="text-xs capitalize">
                                <Shield className="h-3 w-3 mr-1" />
                                {member.role}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {member.email}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Joined {new Date(member.joined_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No members added yet</p>
                    <Button variant="link" className="mt-2" onClick={() => { }}>
                      Invite your first team member
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-8">
          {/* Status & Priority Card */}
          <Card className="border">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flag className="h-5 w-5 text-primary" />
                Status & Priority
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge className={`px-3 py-1 text-sm font-medium border ${getStatusColor(project.status)}`}>
                  {project.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Priority</span>
                <Badge className={`px-3 py-1 text-sm font-medium border ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card className="border">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">
                    {project.startDate.toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {project.endDate && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">End Date</p>
                    <p className="text-sm text-muted-foreground">
                      {project.endDate.toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {project.createdAt.toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags Card */}
          {project.tags && project.tags.length > 0 && (
            <Card className="border">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="h-5 w-5 text-primary" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="px-3 py-1 text-sm bg-secondary/50 hover:bg-secondary/70 transition-colors"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Settings Section - Full Width */}
      <Card className="border mt-8">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-32 flex items-center justify-center text-muted-foreground/40">
            <div className="text-center">
              <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Project settings coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 