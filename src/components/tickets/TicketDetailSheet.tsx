import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState } from "@/context/AppContext";
import { Ticket, Priority, Status, Attachment } from "@/types";
import { statusConfig, typeConfig, priorityConfig } from "@/lib/ticketUtils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Paperclip, Download, FileText, Image, Film, Archive, Eye, X, History, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "react-router-dom";
// API User interface
interface ApiUser {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  organisation_id: number;
  profile_photo_path: string | null;
}

// Transform API user to team member format
const transformApiUser = (user: ApiUser) => ({
  id: user.id.toString(),
  name: `${user.first_name} ${user.last_name}`,
  role: user.role,
  avatarColor: `hsl(${Math.random() * 360}, 70%, 60%)`, // Generate random color
  initials: user.first_name && user.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : user.email ? user.email[0].toUpperCase() : 'U',
  status: "available" as const,
});

interface Props {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function TicketDetailSheet({ ticket, open, onOpenChange }: Props) {
  const { updateTicket, sprints } = useAppState();
  const { projectUuid: currentProjectId } = useParams(); // Get project ID from URL
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  
  // History state
  const [ticketHistory, setTicketHistory] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch ticket history
  const fetchTicketHistory = async () => {
    if (!ticket?.id) return;
    
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/v1/tickets/${ticket.id}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setTicketHistory(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch ticket history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Fetch history when ticket changes or sheet opens
  useEffect(() => {
    if (open && ticket?.id) {
      fetchTicketHistory();
    }
  }, [open, ticket?.id]);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'list' | 'calendar'>('list');

  // Helper functions for calendar
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getHistoryForDate = (date: Date) => {
    if (!ticketHistory?.history) return [];
    
    return ticketHistory.history.filter((item: any) => {
      const itemDate = new Date(item.created_at);
      return itemDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getStatusColor = (statusName: string) => {
    const colors: Record<string, string> = {
      'Backlog': 'bg-gray-100 text-gray-700',
      'To Do': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-purple-100 text-purple-700',
      'Review': 'bg-orange-100 text-orange-700',
      'Done': 'bg-green-100 text-green-700',
      'Blocked': 'bg-red-100 text-red-700',
    };
    return colors[statusName] || 'bg-gray-100 text-gray-700';
  };

  const closePreview = () => {
    setPreviewAttachment(null);
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && previewAttachment) {
        closePreview();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [previewAttachment]);

  useEffect(() => {
    if (!open) {
      setPreviewAttachment(null);
    }
  }, [open]);


  // Helper function to get file icon based on MIME type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Film;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return Archive;
    return Paperclip;
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to get file URL
  const getFileUrl = (path: string) => {
    return `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/storage/${path}`;
  };

  // Fetch API users for assignee dropdown
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['project-users'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/v1/users/${currentProjectId || 2}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data || [];
    },
    enabled: open
  });

  // Transform API users to team member format
  const team = usersData ? usersData.map(transformApiUser) : [];

  if (!ticket) return null;
  const assignee = team.find((m) => m.id === ticket.assigneeId);
  const reporter = team.find((m) => m.id === ticket.reporterId);
  const tc = typeConfig[ticket.type] || { className: "", emoji: "📋", label: "Unknown" };
  const sc = statusConfig[ticket.status] || { className: "", label: "Unknown", color: "" };
  const pc = priorityConfig[ticket.priority] || { className: "", emoji: "📋", label: "Unknown" };

  const startEditTitle = () => { setTitleDraft(ticket.title); setEditingTitle(true); };
  const saveTitle = () => { if (titleDraft.trim()) updateTicket(ticket.id, { title: titleDraft }); setEditingTitle(false); };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto" style={{ width: '1000px', maxWidth: '95vw' }}>
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-sm font-medium">
                  {ticket.projectKey}-{ticket.number}
                </SheetTitle>
                <Badge className={cn("text-xs", "className" in tc ? tc.className : "")}>
                  {tc.emoji} {tc.label}
                </Badge>
              </div>
              <Select value={ticket.status} onValueChange={(v) => updateTicket(ticket.id, { status: v as Status })}>
                <SelectTrigger className={cn("w-auto gap-1.5 border-none bg-accent text-xs font-medium h-7", sc.color)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SheetHeader>

          {/* Title */}
          <div className="px-6 py-4">
            {editingTitle ? (
              <Input autoFocus value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} onBlur={saveTitle} onKeyDown={(e) => e.key === "Enter" && saveTitle()} className="text-xl font-semibold bg-background border-border" />
            ) : (
              <h2 onClick={startEditTitle} className="text-xl font-semibold text-foreground cursor-pointer hover:text-primary transition-colors">{ticket.title}</h2>
            )}
          </div>

          <Tabs defaultValue="details" className="px-6">
            <TabsList className="bg-accent border border-border">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="attachments">Attachments ({ticket.attachments?.length || 0})</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              {/* Fields Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Assignee">
                  <Select value={ticket.assigneeId || ""} onValueChange={(v) => updateTicket(ticket.id, { assigneeId: v })}>
                    <SelectTrigger className="bg-background border-border h-8 text-sm">
                      <SelectValue placeholder="Unassigned">
                        {assignee && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-[8px] font-semibold" style={{ backgroundColor: assignee.avatarColor, color: "white" }}>{assignee.initials}</AvatarFallback>
                            </Avatar>
                            {assignee.name}
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {team.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Reporter">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    {reporter && (
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[9px] font-semibold" style={{ backgroundColor: reporter.avatarColor, color: "white" }}>{reporter.initials}</AvatarFallback>
                      </Avatar>
                    )}
                    {reporter?.name || "Unassigned"}
                  </div>
                </Field>
                <Field label="Priority">
                  <Select value={ticket.priority} onValueChange={(v) => updateTicket(ticket.id, { priority: v as Priority })}>
                    <SelectTrigger className="bg-background border-border h-8 text-sm">
                      <SelectValue placeholder="Select priority">
                        {pc.emoji} {pc.label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Story Points">
                  <Input type="number" value={ticket.storyPoints ?? ""} onChange={(e) => updateTicket(ticket.id, { storyPoints: e.target.value ? parseInt(e.target.value) : null })} className="bg-background border-border h-8 text-sm" />
                </Field>
                <Field label="Sprint">
                  <Select value={ticket.sprintId || ""} onValueChange={(v) => updateTicket(ticket.id, { sprintId: v || null })}>
                    <SelectTrigger className="bg-background border-border h-8 text-sm"><SelectValue placeholder="No Sprint" /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {sprints.filter((s) => s.status !== "completed").map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Labels">
                  <div className="flex flex-wrap gap-1">
                    {ticket.labels.map((l) => <Badge key={l} variant="secondary" className="text-[10px]">{l}</Badge>)}
                    {ticket.labels.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                  </div>
                </Field>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">Description</label>
                <RichTextEditor
                  value={ticket.description || ""}
                  onChange={(value) => updateTicket(ticket.id, { description: value })}
                  placeholder="Enter ticket description..."
                  className="border-2 focus:border-primary/50"
                />
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="pt-4">
              <div className="space-y-4">
                {(!ticket.attachments || ticket.attachments.length === 0) ? (
                  <div className="text-center py-8">
                    <Paperclip className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">No attachments yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {ticket.attachments.map((attachment) => {
                      const FileIcon = getFileIcon(attachment.mime_type);
                      const isImage = attachment.mime_type.startsWith('image/');
                      return (
                        <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-accent transition-colors">
                          <div className="flex-shrink-0">
                            {isImage ? (
                              <div className="w-8 h-8 rounded overflow-hidden">
                                <img
                                  src={getFileUrl(attachment.path)}
                                  alt={attachment.filename}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <FileIcon className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {attachment.filename}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatFileSize(attachment.size)}</span>
                              <span>•</span>
                              <span>{format(new Date(attachment.created_at), "MMM d, yyyy")}</span>
                              <span>•</span>
                              <span>by {attachment.uploader.name}</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 flex gap-1">
                            {isImage && (
                              <button
                                onClick={() => setPreviewAttachment(attachment)}
                                className="p-2 rounded-md hover:bg-accent transition-colors"
                                title="Preview image"
                              >
                                <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              </button>
                            )}
                            <a
                              href={getFileUrl(attachment.path)}
                              download={attachment.filename}
                              className="p-2 rounded-md hover:bg-accent transition-colors"
                              title="Download attachment"
                            >
                              <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="pt-4">
              <div className="space-y-6">
                {/* View Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">Ticket Activity</h3>
                    {ticketHistory && (
                      <span className="text-xs text-muted-foreground">({ticketHistory.total_changes} changes)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCalendarView('list')}
                      className={cn(
                        "px-3 py-1 text-xs rounded-md transition-colors",
                        calendarView === 'list' 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      List View
                    </button>
                    <button
                      onClick={() => setCalendarView('calendar')}
                      className={cn(
                        "px-3 py-1 text-xs rounded-md transition-colors",
                        calendarView === 'calendar' 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      Calendar View
                    </button>
                  </div>
                </div>

                {calendarView === 'calendar' ? (
                  /* Calendar View */
                  <div className="space-y-4">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <button
                        onClick={() => navigateMonth('prev')}
                        className="p-1 hover:bg-background rounded transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <h4 className="text-sm font-medium">
                        {format(currentMonth, 'MMMM yyyy')}
                      </h4>
                      <button
                        onClick={() => navigateMonth('next')}
                        className="p-1 hover:bg-background rounded transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Weekday Headers */}
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-xs font-medium text-muted-foreground text-center py-2">
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar Days */}
                      {getDaysInMonth(currentMonth).map((date, index) => {
                        if (!date) {
                          return <div key={`empty-${index}`} className="p-2" />;
                        }
                        
                        const dayHistory = getHistoryForDate(date);
                        const hasActivity = dayHistory.length > 0;
                        const isToday = date.toDateString() === new Date().toDateString();
                        
                        return (
                          <div
                            key={date.toISOString()}
                            className={cn(
                              "p-2 border rounded-lg min-h-[80px] transition-colors",
                              isToday && "border-primary bg-primary/5",
                              hasActivity && "border-orange-200 bg-orange-50",
                              !hasActivity && "border-border"
                            )}
                          >
                            <div className="text-xs font-medium mb-1">
                              {format(date, 'd')}
                            </div>
                            {hasActivity && (
                              <div className="space-y-1">
                                {dayHistory.slice(0, 2).map((item: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className={cn(
                                      "text-xs px-1 py-0.5 rounded truncate",
                                      item.field_display_name === 'Status' && getStatusColor(item.value_display.new_value),
                                      item.field_display_name === 'Ticket Created' && "bg-blue-100 text-blue-700"
                                    )}
                                    title={`${item.field_display_name}: ${item.value_display.new_value}`}
                                  >
                                    {item.field_display_name === 'Status' 
                                      ? item.value_display.new_value 
                                      : 'Created'
                                    }
                                  </div>
                                ))}
                                {dayHistory.length > 2 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{dayHistory.length - 2} more
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Calendar Legend */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-orange-200 bg-orange-50 rounded"></div>
                        <span>Activity Day</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-primary bg-primary/5 rounded"></div>
                        <span>Today</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* List View (Existing) */
                  <div className="space-y-6">
                    {/* History Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-foreground">Ticket History</h3>
                        {ticketHistory && (
                          <span className="text-xs text-muted-foreground">({ticketHistory.total_changes} changes)</span>
                        )}
                      </div>
                      
                      {loadingHistory ? (
                        <div className="text-sm text-muted-foreground text-center py-4">Loading history...</div>
                      ) : ticketHistory?.history && ticketHistory.history.length > 0 ? (
                        <div className="space-y-3">
                          {ticketHistory.history.map((item: any) => (
                            <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <History className="h-4 w-4 text-primary" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-foreground">
                                    {item.user ? item.user.name : 'Unknown User'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(item.created_at), "MMM d, h:mm a")}
                                  </span>
                                </div>
                                <div className="text-sm text-foreground/80">
                                  <span className="font-medium">{item.field_display_name}</span>
                                  {item.change_type === 'created' ? (
                                    <span> created</span>
                                  ) : (
                                    <span>
                                      {' changed from '}
                                      <span className="font-medium text-muted-foreground">
                                        {item.value_display.old_value || 'None'}
                                      </span>
                                      {' to '}
                                      <span className="font-medium text-foreground">
                                        {item.value_display.new_value || 'None'}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-4">No history available</div>
                      )}
                    </div>

                    {/* Comments Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-medium text-foreground">Comments</span>
                        <span className="text-xs text-muted-foreground">({ticket.comments.length})</span>
                      </div>
                      
                      <div className="space-y-4">
                        {ticket.comments.map((c) => {
                          const author = team.find((m) => m.id === c.authorId);
                          return (
                            <div key={c.id} className="flex gap-3">
                              <Avatar className="h-7 w-7 mt-0.5">
                                <AvatarFallback className="text-[9px] font-semibold" style={{ backgroundColor: author?.avatarColor, color: "white" }}>{author?.initials}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">{author?.name || 'Unknown User'}</span>
                                  <span className="text-xs text-muted-foreground">{format(new Date(c.createdAt), "MMM d, h:mm a")}</span>
                                </div>
                                <p className="text-sm text-foreground/80 mt-1">{c.text}</p>
                              </div>
                            </div>
                          );
                        })}
                        {ticket.comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Image Preview Modal */}
      {previewAttachment && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            closePreview();
          }}
        >
          <div className="flex h-full w-full items-center justify-center p-4 pointer-events-none">
            <div
              className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closePreview();
                }}
                className="absolute top-3 right-3 z-[10000] p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                title="Close preview"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="p-4 bg-gray-50">
                <img
                  src={getFileUrl(previewAttachment.path)}
                  alt={previewAttachment.filename}
                  className="max-w-full max-h-[80vh] object-contain mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1 block">{label}</label>
      {children}
    </div>
  );
}
