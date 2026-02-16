import { Status, IssueType, Priority } from "@/types";

export const statusConfig: Record<Status, { label: string; color: string }> = {
  todo: { label: "Todo", color: "text-muted-foreground" },
  in_progress: { label: "In Progress", color: "text-info" },
  in_review: { label: "In Review", color: "text-warning" },
  done: { label: "Done", color: "text-success" },
};

export const typeConfig: Record<IssueType, { label: string; emoji: string }> = {
  bug: { label: "Bug", emoji: "🐛" },
  task: { label: "Task", emoji: "✅" },
  story: { label: "Story", emoji: "📖" },
  epic: { label: "Epic", emoji: "⚡" },
};

export const priorityConfig: Record<Priority, { label: string; emoji: string; className: string }> = {
  critical: { label: "Critical", emoji: "🔴", className: "priority-critical" },
  high: { label: "High", emoji: "🟠", className: "priority-high" },
  medium: { label: "Medium", emoji: "🟡", className: "priority-medium" },
  low: { label: "Low", emoji: "🔵", className: "priority-low" },
  none: { label: "None", emoji: "⚪", className: "priority-none" },
};

export const statusColumns: Status[] = ["todo", "in_progress", "in_review", "done"];

export const columnColors: Record<Status, string> = {
  todo: "bg-muted-foreground/60",
  in_progress: "bg-info",
  in_review: "bg-warning",
  done: "bg-success",
};
