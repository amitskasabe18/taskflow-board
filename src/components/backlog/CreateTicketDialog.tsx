import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Bug, AlertCircle, CheckCircle, Loader2, CalendarIcon } from "lucide-react";
import { ticketService, CreateTicketRequest } from "@/services/ticketService";
import axios from "axios";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onTicketCreated?: (ticket: any) => void;
}

export function CreateTicketDialog({ open, onOpenChange, projectId, onTicketCreated }: CreateTicketDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("task");
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [environment, setEnvironment] = useState("");
  const [originalEstimateMinutes, setOriginalEstimateMinutes] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [projectStatuses, setProjectStatuses] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("");

  // Fetch project users when dialog opens
  useEffect(() => {
    if (open && projectId) {
      fetchProjectUsers();
      fetchProjectStatuses();
    }
  }, [open, projectId]);

  const fetchProjectUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Make direct axios call to the API
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/v1/users/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Users API response:', response.data);
      console.log('Users data:', response.data.data);

      setUsers(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchProjectStatuses = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/v1/projects/${projectId}/statuses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Statuses API response:', response.data);
      console.log('Statuses data:', response.data.data);

      const statuses = response.data.data || [];
      setProjectStatuses(statuses);
      
      // Auto-select the first status (usually "To Do" or "Backlog")
      if (statuses.length > 0 && !selectedStatus) {
        const firstStatus = statuses.find((s: any) => s.category === 'todo') || statuses[0];
        setSelectedStatus(firstStatus.id.toString());
      }
    } catch (err: any) {
      console.error('Failed to fetch project statuses:', err);
      setProjectStatuses([]);
    }
  };

  // Extract numeric project ID from UUID if needed, or use as-is if already numeric
  const getProjectId = () => {
    // Return the project ID as-is (can be either UUID or numeric ID)
    // The backend will handle both formats
    return projectId;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setAttachments(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files) {
      handleFileSelect(files);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return '🗜️';
    return '📎'; // Default file icon
  };

  const createPreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const renderAttachmentPreview = (file: File, index: number) => {
    const fileType = file.type.split('/')[0];
    const previewUrl = createPreviewUrl(file);

    if (fileType === 'image') {
      return (
        <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
          <img
            src={previewUrl}
            alt={file.name}
            className="w-16 h-16 object-cover rounded-md border"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
        </div>
      );
    } else if (fileType === 'video') {
      return (
        <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
          <div className="relative">
            <video
              src={previewUrl}
              className="w-16 h-16 object-cover rounded-md border"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
              <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-8 border-l-white border-t-4 border-b-4 transform -translate-x-1"></div>
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-2xl border">
            {getFileIcon(file.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
        </div>
      );
    }
  };

  const ticketTypes = [
    { value: "task", label: "Task", icon: CheckCircle },
    { value: "bug", label: "Bug", icon: Bug },
    { value: "story", label: "Story", icon: Plus },
    { value: "epic", label: "Epic", icon: AlertCircle },
  ];

  const priorities = [
    { value: "lowest", label: "Lowest" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "highest", label: "Highest" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Ticket title is required");
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add ticket data
      formData.append('title', title.trim());
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      formData.append('type', type);
      formData.append('priority', priority);
      formData.append('project_id', getProjectId().toString());
      
      // Add status_id to prevent backend default status error
      if (selectedStatus) {
        formData.append('status_id', selectedStatus);
      }

      if (assigneeId && assigneeId !== "unassigned") {
        formData.append('assignee_id', assigneeId);
      }

      if (storyPoints) {
        formData.append('story_points', storyPoints);
      }

      if (dueDate) {
        formData.append('due_date', dueDate);
      }

      if (startDate) {
        formData.append('start_date', startDate);
      }

      if (environment) {
        formData.append('environment', environment);
      }

      if (originalEstimateMinutes) {
        formData.append('original_estimate_minutes', originalEstimateMinutes);
      }

      // Add attachments
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });

      console.log('Creating ticket with FormData:', formData);
      console.log('Selected assigneeId:', assigneeId);
      console.log('Available users:', users);
      console.log('Attachments count:', attachments.length);

      const response = await ticketService.createProjectTicketWithAttachments(projectId, formData);

      // Reset form
      setTitle("");
      setDescription("");
      setType("task");
      setPriority("medium");
      setSelectedStatus("");
      setAssigneeId("");
      setStoryPoints("");
      setDueDate("");
      setStartDate(format(new Date(), 'yyyy-MM-dd'));
      setEnvironment("");
      setOriginalEstimateMinutes("");
      setAttachments([]);

      // Close dialog
      onOpenChange(false);

      // Notify parent component
      if (onTicketCreated) {
        onTicketCreated(response.data.ticket);
      }

      // Show success message
      console.log('Ticket created successfully:', response.data.ticket);
      // You could show a success toast here

    } catch (err: any) {
      setError(err.message || "Failed to create ticket. Please try again.");
      console.error('Ticket creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError("");
      setTitle("");
      setDescription("");
      setType("task");
      setPriority("medium");
      setSelectedStatus("");
      setDueDate("");
      setStartDate(format(new Date(), 'yyyy-MM-dd'));
      setEnvironment("");
      setOriginalEstimateMinutes("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-w-[90vw] max-h-[90vh] my-8 overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create New Ticket
          </DialogTitle>
          <DialogDescription>
            Create a new ticket to add to your backlog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter ticket title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                required
                className="border-2 focus:border-primary/50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Enter ticket description..."
                className="border-2 focus:border-primary/50"
              />
            </div>

            {/* Attachments Section */}
            <div className="grid gap-2">
              <Label htmlFor="attachments">Attachments</Label>
              <div
                className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center transition-colors hover:border-primary/50 focus-within:border-primary/50"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  id="attachments"
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.gif,.png,.jpg,.jpeg,.mp4,.avi,.mov,.wmv,.flv,.webm"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                <div className="space-y-2">
                  <div className="text-muted-foreground">
                    <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 8.09 4.5 4.5 0 00-4.5 4.5 4.5 0 00-4.5-4.5 4.5 4.5 0 00-4.5 4.5zm0 0L14 18m-7-7h7m-7 0v7" />
                    </svg>
                    <p className="mt-2 text-sm font-medium">Drag & drop files here, or click to browse</p>
                    <p className="text-xs">Support for images, videos, documents and archives</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('attachments')?.click()}
                    className="mx-auto"
                  >
                    Choose Files
                  </Button>
                </div>
              </div>

              {/* Attachment List */}
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Attached Files:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {attachments.map((file, index) => (
                      <div key={index} className="relative group">
                        {renderAttachmentPreview(file, index)}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80 hover:bg-background text-muted-foreground hover:text-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType} disabled={isLoading}>
                  <SelectTrigger className="border-2 focus:border-primary/50">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketTypes.map((ticketType) => (
                      <SelectItem key={ticketType.value} value={ticketType.value}>
                        <div className="flex items-center gap-2">
                          <ticketType.icon className="h-4 w-4" />
                          {ticketType.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority} disabled={isLoading}>
                  <SelectTrigger className="border-2 focus:border-primary/50">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={isLoading || projectStatuses.length === 0}>
                  <SelectTrigger className="border-2 focus:border-primary/50">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStatuses.map((status) => (
                      <SelectItem key={status.id} value={status.id.toString()}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="storyPoints">Story Points</Label>
              <Input
                id="storyPoints"
                type="number"
                min="0"
                max="999"
                step="0.5"
                placeholder="Enter story points (optional)"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                disabled={isLoading}
                className="border-2 focus:border-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground",
                        isLoading && "opacity-50"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(new Date(dueDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate ? new Date(dueDate) : undefined}
                      onSelect={(date) => setDueDate(date ? format(date, 'yyyy-MM-dd') : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                        isLoading && "opacity-50"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(new Date(startDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate ? new Date(startDate) : undefined}
                      onSelect={(date) => setStartDate(date ? format(date, 'yyyy-MM-dd') : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="environment">Environment</Label>
                <Select value={environment} onValueChange={setEnvironment} disabled={isLoading}>
                  <SelectTrigger className="border-2 focus:border-primary/50">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="originalEstimateMinutes">Original Estimate (minutes)</Label>
                <Input
                  id="originalEstimateMinutes"
                  type="number"
                  min="0"
                  placeholder="e.g. 60"
                  value={originalEstimateMinutes}
                  onChange={(e) => setOriginalEstimateMinutes(e.target.value)}
                  disabled={isLoading}
                  className="border-2 focus:border-primary/50"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId} disabled={isLoading}>
                <SelectTrigger className="border-2 focus:border-primary/50">
                  <SelectValue placeholder="Select assignee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {isLoadingUsers ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading users...
                      </div>
                    </SelectItem>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary-foreground text-xs font-medium">
                            {user.first_name && user.last_name
                              ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                              : user.email ? user.email[0].toUpperCase() : 'U'
                            }
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : user.email || 'Unknown User'
                            }
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-users" disabled>
                      No users available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Ticket"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
