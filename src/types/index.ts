export type IssueType = "bug" | "task" | "story" | "epic";
export type Priority = "critical" | "high" | "medium" | "low" | "none";
export type Status = "backlog" | "todo" | "in_progress" | "review" | "done" | "blocked";
export type SprintStatus = "planning" | "active" | "completed";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  initials: string;
  status: "available" | "busy" | "away";
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Attachment {
  id: number;
  filename: string;
  mime_type: string;
  size: number;
  path: string;
  disk: string;
  uploader: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
}

export interface Ticket {
  id: string;
  projectKey: string;
  number: number;
  title: string;
  description: string;
  type: IssueType;
  priority: Priority;
  status: Status;
  resolutionStatus?: string | null;
  assigneeId: string | null;
  assignee?: {
    id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    is_active: boolean;
    organisation_id: number;
    profile_photo_path: string | null;
  } | null;
  reporterId: string;
  sprintId: string | null;
  parentId?: string | null;
  storyPoints: number | null;
  originalEstimateMinutes?: number | null;
  remainingEstimateMinutes?: number | null;
  labels: string[];
  dueDate: string | null;
  startDate?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  resolutionNote?: string | null;
  environment?: string | null;
  position?: number | null;
  isArchived?: boolean;
  linkedIssues: string[];
  comments: Comment[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  estimate: string | null;
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
}

export interface BurndownPoint {
  day: string;
  ideal: number;
  actual: number;
}
