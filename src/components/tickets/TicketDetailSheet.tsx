import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState } from "@/context/AppContext";
import { Ticket, Priority, Status } from "@/types";
import { statusConfig, typeConfig, priorityConfig } from "@/lib/ticketUtils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  // Fetch API users for assignee dropdown
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['project-users'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://localhost:8000/api/v1/users/845646bb-a9ca-4469-9c3d-bdae3af6798b', {
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] bg-surface border-border overflow-y-auto p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{ticket.projectKey}-{ticket.number}</span>
            <Badge variant="outline" className="text-xs">{tc.emoji} {tc.label}</Badge>
          </div>
          <Select value={ticket.status} onValueChange={(v) => updateTicket(ticket.id, { status: v as Status })}>
            <SelectTrigger className={cn("w-auto gap-1.5 border-none bg-accent text-xs font-medium h-7", sc.color)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

          <TabsContent value="activity" className="pt-4">
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
              {ticket.comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
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
