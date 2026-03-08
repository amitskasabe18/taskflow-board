import { Status, IssueType, Priority } from "@/types";

export const statusConfig: Record<Status, { label: string; color: string }> = {
  backlog: { label: "Backlog", color: "text-muted-foreground" },
  todo: { label: "Todo", color: "text-muted-foreground" },
  in_progress: { label: "In Progress", color: "text-info" },
  review: { label: "Review", color: "text-warning" },
  done: { label: "Done", color: "text-success" },
  blocked: { label: "Blocked", color: "text-destructive" },
};

export const typeConfig: Record<IssueType, { label: string; emoji: string }> = {
  bug: { label: "Bug", emoji: "🐞" },
  task: { label: "Task", emoji: "🎯" },
  story: { label: "Story", emoji: "✨" },
  epic: { label: "Epic", emoji: "⚡" },
};

export const priorityConfig: Record<Priority, { label: string; emoji: string; className: string }> = {
  critical: { label: "Critical", emoji: "🔴", className: "priority-critical" },
  high: { label: "High", emoji: "🟠", className: "priority-high" },
  medium: { label: "Medium", emoji: "🟡", className: "priority-medium" },
  low: { label: "Low", emoji: "🔵", className: "priority-low" },
  none: { label: "None", emoji: "⚪", className: "priority-none" },
};

export const statusColumns: Status[] = ["backlog", "todo", "in_progress", "review", "blocked", "done"];

export const columnColors: Record<Status, string> = {
  backlog: "bg-muted-foreground/30",
  todo: "bg-muted-foreground/60",
  in_progress: "bg-info",
  review: "bg-warning",
  done: "bg-success",
  blocked: "bg-destructive",
};
