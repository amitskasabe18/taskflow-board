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
import { Plus, Bug, AlertCircle, CheckCircle, Loader2, CalendarIcon, ChevronDown, ChevronUp, Paperclip, X } from "lucide-react";
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

const TICKET_TYPES = [
  { value: "task", label: "Task", icon: CheckCircle, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30" },
  { value: "bug", label: "Bug", icon: Bug, color: "text-red-400", bg: "bg-red-400/10 border-red-400/30" },
  { value: "story", label: "Story", icon: Plus, color: "text-green-400", bg: "bg-green-400/10 border-green-400/30" },
  { value: "epic", label: "Epic", icon: AlertCircle, color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/30" },
];

const PRIORITIES = [
  { value: "lowest", label: "Lowest", dot: "bg-slate-400" },
  { value: "low", label: "Low", dot: "bg-blue-400" },
  { value: "medium", label: "Medium", dot: "bg-yellow-400" },
  { value: "high", label: "High", dot: "bg-orange-400" },
  { value: "highest", label: "Highest", dot: "bg-red-500" },
];

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (open && projectId) {
      fetchProjectUsers();
      fetchProjectStatuses();
    }
  }, [open, projectId]);

  const fetchProjectUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/v1/users/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      setUsers(response.data.data || []);
    } catch (err) {
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchProjectStatuses = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/v1/projects/${projectId}/statuses`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const statuses = response.data.data || [];
      setProjectStatuses(statuses);
      if (statuses.length > 0 && !selectedStatus) {
        const firstStatus = statuses.find((s: any) => s.category === 'todo') || statuses[0];
        setSelectedStatus(firstStatus.id.toString());
      }
    } catch {
      setProjectStatuses([]);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    setAttachments(prev => [...prev, ...Array.from(files)]);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeAttachment = (index: number) => setAttachments(prev => prev.filter((_, i) => i !== index));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📎';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Ticket title is required"); return; }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      if (description.trim()) formData.append('description', description.trim());
      formData.append('type', type);
      formData.append('priority', priority);
      formData.append('project_id', projectId.toString());
      if (selectedStatus) formData.append('status_id', selectedStatus);
      if (assigneeId && assigneeId !== "unassigned") formData.append('assignee_id', assigneeId);
      if (storyPoints) formData.append('story_points', storyPoints);
      if (dueDate) formData.append('due_date', dueDate);
      if (startDate) formData.append('start_date', startDate);
      if (environment) formData.append('environment', environment);
      if (originalEstimateMinutes) formData.append('original_estimate_minutes', originalEstimateMinutes);
      attachments.forEach((file, index) => formData.append(`attachments[${index}]`, file));

      const response = await ticketService.createProjectTicketWithAttachments(projectId, formData);
      resetForm();
      onOpenChange(false);
      if (onTicketCreated) onTicketCreated(response.data.ticket);
    } catch (err: any) {
      setError(err.message || "Failed to create ticket. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setType("task"); setPriority("medium");
    setSelectedStatus(""); setAssigneeId(""); setStoryPoints(""); setDueDate("");
    setStartDate(format(new Date(), 'yyyy-MM-dd')); setEnvironment("");
    setOriginalEstimateMinutes(""); setAttachments([]); setShowAdvanced(false); setError("");
  };

  const handleClose = () => { if (!isLoading) { resetForm(); onOpenChange(false); } };

  const selectedType = TICKET_TYPES.find(t => t.value === type);
  const selectedPriority = PRIORITIES.find(p => p.value === priority);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[780px] max-w-[95vw] max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
          <div>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              Create Ticket
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
              Add a new item to your project backlog
            </DialogDescription>
          </div>

          {/* Type selector pills in header */}
          <div className="flex gap-1.5 mr-8">
            {TICKET_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  title={t.label}
                  className={cn(
                    "w-8 h-8 rounded-md border flex items-center justify-center transition-all duration-150",
                    type === t.value
                      ? `${t.bg} ${t.color} shadow-sm scale-105`
                      : "border-border/40 text-muted-foreground/50 hover:border-border hover:text-muted-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 px-3.5 py-2.5 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Title <span className="text-primary">*</span>
            </Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              required
              className="h-10 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-background transition-colors placeholder:text-muted-foreground/40"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Add more context, steps to reproduce, acceptance criteria..."
              className="bg-muted/30 border-border/50 focus-within:border-primary/50 transition-colors"
            />
          </div>

          {/* Core fields row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Priority */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</Label>
              <Select value={priority} onValueChange={setPriority} disabled={isLoading}>
                <SelectTrigger className="h-9 bg-muted/30 border-border/50 focus:border-primary/50 text-sm">
                  <SelectValue>
                    {selectedPriority && (
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full shrink-0", selectedPriority.dot)} />
                        {selectedPriority.label}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full", p.dot)} />
                        {p.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={isLoading || projectStatuses.length === 0}>
                <SelectTrigger className="h-9 bg-muted/30 border-border/50 focus:border-primary/50 text-sm">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {projectStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id.toString()}>{status.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId} disabled={isLoading}>
                <SelectTrigger className="h-9 bg-muted/30 border-border/50 focus:border-primary/50 text-sm">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {isLoadingUsers ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />Loading…
                      </div>
                    </SelectItem>
                  ) : users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                          {user.first_name && user.last_name
                            ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                            : user.email?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <span className="text-sm">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.email ?? 'Unknown'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Start Date", value: startDate, setter: setStartDate },
              { label: "Due Date", value: dueDate, setter: setDueDate },
            ].map(({ label, value, setter }) => (
              <div key={label} className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-9 justify-start text-left font-normal text-sm bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-border",
                        !value && "text-muted-foreground/50"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                      {value ? format(new Date(value), "MMM d, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={value ? new Date(value) : undefined}
                      onSelect={(date) => setter(date ? format(date, 'yyyy-MM-dd') : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>

          {/* Attachments */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Attachments {attachments.length > 0 && <span className="text-primary ml-1">({attachments.length})</span>}
            </Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer",
                isDragging
                  ? "border-primary/60 bg-primary/5"
                  : "border-border/40 hover:border-border/70 hover:bg-muted/20"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('attachments-input')?.click()}
            >
              <input id="attachments-input" type="file" multiple className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                onChange={(e) => handleFileSelect(e.target.files)} />
              <div className="flex items-center justify-center gap-2 text-muted-foreground/60">
                <Paperclip className="h-4 w-4" />
                <span className="text-sm">Drop files here or <span className="text-primary/70 font-medium">browse</span></span>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {attachments.map((file, index) => (
                  <div key={index} className="relative group flex items-center gap-2 p-2 bg-muted/40 rounded-md border border-border/30 hover:border-border/60 transition-colors">
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt={file.name} className="w-8 h-8 object-cover rounded shrink-0" />
                    ) : (
                      <span className="text-lg shrink-0">{getFileIcon(file.type)}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate leading-tight">{file.name}</p>
                      <p className="text-xs text-muted-foreground/60">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeAttachment(index); }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-muted border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:border-destructive/30"
                    >
                      <X className="h-2.5 w-2.5 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Advanced section */}
          <div className="border border-border/30 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:bg-muted/30 transition-colors"
            >
              Advanced Options
              {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showAdvanced && (
              <div className="px-4 pb-4 pt-2 space-y-3 border-t border-border/30 bg-muted/10">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Story Points</Label>
                    <Input
                      type="number" min="0" max="999" step="0.5"
                      placeholder="0"
                      value={storyPoints}
                      onChange={(e) => setStoryPoints(e.target.value)}
                      disabled={isLoading}
                      className="h-9 bg-muted/30 border-border/50 focus:border-primary/50 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estimate (min)</Label>
                    <Input
                      type="number" min="0" placeholder="60"
                      value={originalEstimateMinutes}
                      onChange={(e) => setOriginalEstimateMinutes(e.target.value)}
                      disabled={isLoading}
                      className="h-9 bg-muted/30 border-border/50 focus:border-primary/50 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Environment</Label>
                    <Select value={environment} onValueChange={setEnvironment} disabled={isLoading}>
                      <SelectTrigger className="h-9 bg-muted/30 border-border/50 focus:border-primary/50 text-sm">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/10 shrink-0">
          {/* Type badge */}
          {selectedType && (
            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium", selectedType.bg, selectedType.color)}>
              <selectedType.icon className="h-3 w-3" />
              {selectedType.label}
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading} className="h-9 px-4 text-sm">
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-ticket-form"
              disabled={!title.trim() || isLoading}
              onClick={handleSubmit}
              className="h-9 px-5 text-sm font-medium"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Creating…</>
              ) : (
                "Create Ticket"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}