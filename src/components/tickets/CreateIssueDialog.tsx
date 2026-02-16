import { useState } from "react";
import { Bug, CheckSquare, BookOpen, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState } from "@/context/AppContext";
import { team } from "@/data/mockData";
import { IssueType, Priority, Ticket } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const issueTypes: { type: IssueType; icon: typeof Bug; label: string }[] = [
  { type: "bug", icon: Bug, label: "Bug" },
  { type: "task", icon: CheckSquare, label: "Task" },
  { type: "story", icon: BookOpen, label: "Story" },
  { type: "epic", icon: Zap, label: "Epic" },
];

export function CreateIssueDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { addTicket, tickets, sprints, currentProject } = useAppState();
  const { toast } = useToast();
  const [type, setType] = useState<IssueType>("task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [sprintId, setSprintId] = useState<string>("");
  const [points, setPoints] = useState("");

  const handleCreate = () => {
    if (!title.trim()) return;
    const num = Math.max(...tickets.map((t) => t.number), 0) + 1;
    const newTicket: Ticket = {
      id: `t${num}`, projectKey: currentProject.key, number: num, title, description,
      type, priority, status: "todo", assigneeId: assignee || null, reporterId: "u1",
      sprintId: sprintId || null, storyPoints: points ? parseInt(points) : null,
      labels: [], dueDate: null, linkedIssues: [], comments: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), estimate: null,
    };
    addTicket(newTicket);
    toast({ title: "Issue created", description: `${currentProject.key}-${num}: ${title}` });
    setTitle(""); setDescription(""); setAssignee(""); setPoints(""); setSprintId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Type selector */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">Issue Type</label>
            <div className="flex gap-2">
              {issueTypes.map((it) => (
                <button
                  key={it.type}
                  onClick={() => setType(it.type)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors border",
                    type === it.type ? "bg-brand-muted border-primary text-primary" : "border-border text-muted-foreground hover:bg-accent"
                  )}
                >
                  <it.icon className="h-3.5 w-3.5" />
                  {it.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">Summary</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" className="bg-background border-border" />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details..." rows={3} className="bg-background border-border resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">Assignee</label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {team.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">Priority</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="critical">🔴 Critical</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">🔵 Low</SelectItem>
                  <SelectItem value="none">⚪ None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">Sprint</label>
              <Select value={sprintId} onValueChange={setSprintId}>
                <SelectTrigger className="bg-background border-border"><SelectValue placeholder="No Sprint" /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {sprints.filter((s) => s.status !== "completed").map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">Story Points</label>
              <Input type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="0" className="bg-background border-border" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!title.trim()}>Create Issue</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
