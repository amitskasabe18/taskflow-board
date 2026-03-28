import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { projectService } from '@/services/projectService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, ArrowLeft, Save, Users, Tag } from 'lucide-react';

interface ProjectFormData {
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  status: 'active' | 'completed' | 'archived' | 'on_hold';
}

export const EditProject = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectFormData | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectData = await projectService.getProject(uuid);
        if (projectData) {
          setProject({
            name: projectData.name || '',
            description: projectData.description || '',
            priority: projectData.priority || 'medium',
            start_date: projectData.start_date || '',
            end_date: projectData.end_date || '',
            budget: projectData.budget || 0,
            currency: projectData.currency || 'USD',
            status: projectData.status || 'active',
          });
          
          // Check if user can edit (admin or creator)
          const userRole = await projectService.getUserRole(uuid);
          setCanEdit(userRole === 'admin' || projectData.owner === 'Current User');
        }
      } catch (err) {
        setError('Failed to load project');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [uuid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    try {
      setSaving(true);
      setError(null);

      const updates = {
        name: project.name,
        description: project.description,
        priority: project.priority,
        start_date: project.start_date,
        end_date: project.end_date,
        budget: project.budget,
        currency: project.currency,
        status: project.status,
      };

      await projectService.updateProject(uuid, updates);
      navigate(`/projects/${uuid}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update project');
      setSaving(false);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProjectFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!project) return;
    
    const value = e.target.value;
    setProject(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => navigate('/projects')} variant="outline">
                Back to Projects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/projects/${uuid}`)}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Project</h1>
            <p className="text-sm text-muted-foreground">
              {canEdit ? 'Make changes to your project' : 'View project details'}
            </p>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column - Basic Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Project Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={project.name}
                      onChange={(e) => handleInputChange('name')(e)}
                      disabled={!canEdit}
                      placeholder="e.g. Design System Revamp"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={project.description}
                      onChange={(e) => handleInputChange('description')(e)}
                      disabled={!canEdit}
                      placeholder="What are the goals and objectives of this project?"
                      rows={4}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={project.status}
                      onValueChange={(value) => setProject(prev => prev ? { ...prev, status: value as any } : null)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={project.priority}
                      onValueChange={(value) => setProject(prev => prev ? { ...prev, priority: value as any } : null)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column - Timeline & Budget */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline & Budget</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={project.start_date}
                      onChange={(e) => handleInputChange('start_date')(e)}
                      disabled={!canEdit}
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={project.end_date}
                      onChange={(e) => handleInputChange('end_date')(e)}
                      disabled={!canEdit}
                    />
                  </div>

                  {/* Budget */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={project.budget}
                        onChange={(e) => handleInputChange('budget')(e)}
                        disabled={!canEdit}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={project.currency}
                        onValueChange={(value) => setProject(prev => prev ? { ...prev, currency: value as any } : null)}
                        disabled={!canEdit}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="JPY">JPY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/projects/${uuid}`)}
            >
              Cancel
            </Button>
            
            {canEdit && (
              <Button
                type="submit"
                disabled={saving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
