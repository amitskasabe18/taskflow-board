import { Project, TeamMember, Sprint, Ticket, BurndownPoint } from "@/types";

export const projects: Project[] = [
  { id: "p1", name: "Phoenix Platform", key: "PHX", description: "Main product platform" },
  { id: "p2", name: "Design System", key: "DSN", description: "Shared component library" },
  { id: "p3", name: "Mobile App", key: "MOB", description: "iOS & Android application" },
];

export const team: TeamMember[] = [
  { id: "u1", name: "Sarah Chen", role: "Frontend Engineer", avatarColor: "hsl(242 100% 71%)", initials: "SC", status: "available" },
  { id: "u2", name: "Alex Rivera", role: "Backend Engineer", avatarColor: "hsl(142 71% 45%)", initials: "AR", status: "available" },
  { id: "u3", name: "Jordan Kim", role: "Product Designer", avatarColor: "hsl(38 92% 50%)", initials: "JK", status: "busy" },
  { id: "u4", name: "Maya Patel", role: "Full Stack Developer", avatarColor: "hsl(0 84% 60%)", initials: "MP", status: "available" },
  { id: "u5", name: "Liam O'Brien", role: "QA Engineer", avatarColor: "hsl(199 89% 60%)", initials: "LO", status: "away" },
  { id: "u6", name: "Priya Sharma", role: "Engineering Manager", avatarColor: "hsl(280 70% 60%)", initials: "PS", status: "available" },
];

export const sprints: Sprint[] = [
  { id: "s1", name: "Sprint 1", goal: "Foundation & Auth", status: "completed", startDate: "2024-09-02", endDate: "2024-09-15", projectId: "p1" },
  { id: "s2", name: "Sprint 2", goal: "Dashboard & Analytics", status: "completed", startDate: "2024-09-16", endDate: "2024-09-29", projectId: "p1" },
  { id: "s3", name: "Sprint 3", goal: "Integrations & API", status: "completed", startDate: "2024-09-30", endDate: "2024-10-13", projectId: "p1" },
  { id: "s4", name: "Sprint 4 — Alpha Launch", goal: "Polish UI, fix critical bugs, prepare for alpha release", status: "active", startDate: "2024-10-28", endDate: "2024-11-11", projectId: "p1" },
  { id: "s5", name: "Sprint 5 — Beta Hardening", goal: "Performance optimization and beta testing", status: "planning", startDate: "2024-11-12", endDate: "2024-11-25", projectId: "p1" },
];

const mkTicket = (
  n: number, title: string, type: Ticket["type"], priority: Ticket["priority"],
  status: Ticket["status"], assigneeId: string | null, sprintId: string | null,
  points: number | null, labels: string[] = [], desc = ""
): Ticket => ({
  id: `t${n}`, projectKey: "PHX", number: n, title, description: desc || `Details for ${title}`,
  type, priority, status, assigneeId, reporterId: "u6", sprintId, storyPoints: points,
  labels, dueDate: null, linkedIssues: [], comments: [
    { id: `c${n}-1`, authorId: "u1", text: "I'll take a look at this.", createdAt: "2024-10-20T10:00:00Z" },
    { id: `c${n}-2`, authorId: "u6", text: "Let me know if you need help.", createdAt: "2024-10-20T14:00:00Z" },
  ],
  createdAt: "2024-10-15T08:00:00Z", updatedAt: "2024-10-28T12:00:00Z", estimate: points ? `${points}h` : null,
});

export const tickets: Ticket[] = [
  // Sprint 4 - Active
  mkTicket(1, "Fix login redirect loop", "bug", "critical", "in_progress", "u1", "s4", 5, ["auth", "urgent"]),
  mkTicket(2, "Add password reset flow", "story", "high", "todo", "u2", "s4", 8, ["auth"]),
  mkTicket(3, "Redesign settings page", "task", "medium", "review", "u3", "s4", 5, ["ui"]),
  mkTicket(4, "Fix date picker timezone bug", "bug", "high", "in_progress", "u4", "s4", 3, ["ui"]),
  mkTicket(5, "Implement notification system", "story", "high", "todo", "u1", "s4", 13, ["feature"]),
  mkTicket(6, "Update API rate limiting", "task", "medium", "done", "u2", "s4", 3, ["api"]),
  mkTicket(7, "Write E2E tests for onboarding", "task", "low", "todo", "u5", "s4", 5, ["testing"]),
  mkTicket(8, "Optimize bundle size", "task", "medium", "in_progress", "u4", "s4", 8, ["performance"]),
  mkTicket(9, "Fix mobile nav overflow", "bug", "high", "review", "u3", "s4", 2, ["ui", "mobile"]),
  mkTicket(10, "Add analytics tracking", "story", "medium", "done", "u1", "s4", 5, ["analytics"]),

  // Sprint 5 - Planning
  mkTicket(11, "Implement real-time collaboration", "epic", "high", "todo", "u1", "s5", 13, ["feature"]),
  mkTicket(12, "Add dark mode toggle", "story", "low", "todo", "u3", "s5", 3, ["ui"]),
  mkTicket(13, "Database query optimization", "task", "high", "todo", "u2", "s5", 8, ["performance"]),
  mkTicket(14, "Create user onboarding tour", "story", "medium", "todo", "u3", "s5", 5, ["ux"]),
  mkTicket(15, "Fix memory leak in dashboard", "bug", "critical", "todo", "u4", "s5", 5, ["bug"]),

  // Sprint 3 - Completed
  mkTicket(16, "Build REST API endpoints", "story", "high", "done", "u2", "s3", 8, ["api"]),
  mkTicket(17, "Integrate Stripe payments", "story", "high", "done", "u4", "s3", 13, ["payments"]),
  mkTicket(18, "Add webhook handlers", "task", "medium", "done", "u2", "s3", 5, ["api"]),
  mkTicket(19, "Fix CORS configuration", "bug", "high", "done", "u1", "s3", 2, ["api"]),
  mkTicket(20, "API documentation", "task", "low", "done", "u5", "s3", 3, ["docs"]),

  // Sprint 2 - Completed
  mkTicket(21, "Build dashboard layout", "story", "high", "done", "u3", "s2", 8, ["ui"]),
  mkTicket(22, "Add chart components", "task", "medium", "done", "u1", "s2", 5, ["ui"]),
  mkTicket(23, "Implement data aggregation", "task", "high", "done", "u2", "s2", 8, ["data"]),
  mkTicket(24, "User activity feed", "story", "medium", "done", "u4", "s2", 5, ["feature"]),
  mkTicket(25, "Fix chart tooltip positioning", "bug", "low", "done", "u3", "s2", 2, ["ui"]),

  // Sprint 1 - Completed
  mkTicket(26, "Set up project boilerplate", "task", "high", "done", "u1", "s1", 3, ["setup"]),
  mkTicket(27, "Implement auth system", "story", "critical", "done", "u2", "s1", 13, ["auth"]),
  mkTicket(28, "Design system tokens", "task", "high", "done", "u3", "s1", 5, ["design"]),
  mkTicket(29, "Database schema design", "task", "high", "done", "u2", "s1", 8, ["data"]),
  mkTicket(30, "CI/CD pipeline setup", "task", "medium", "done", "u4", "s1", 5, ["devops"]),

  // Backlog (no sprint)
  mkTicket(31, "Add file upload support", "story", "medium", "todo", null, null, 8, ["feature"]),
  mkTicket(32, "Implement search functionality", "story", "high", "todo", null, null, 8, ["feature"]),
  mkTicket(33, "Add keyboard shortcuts", "task", "low", "todo", null, null, 3, ["ux"]),
  mkTicket(34, "Create admin panel", "epic", "medium", "todo", null, null, 13, ["admin"]),
  mkTicket(35, "Fix table sorting bug", "bug", "medium", "todo", null, null, 2, ["ui"]),
  mkTicket(36, "Add export to CSV", "task", "low", "todo", null, null, 3, ["feature"]),
  mkTicket(37, "Implement SSO login", "story", "high", "todo", null, null, 8, ["auth"]),
  mkTicket(38, "Performance monitoring setup", "task", "medium", "todo", null, null, 5, ["devops"]),
  mkTicket(39, "Add multi-language support", "epic", "low", "todo", null, null, 13, ["i18n"]),
  mkTicket(40, "Fix tooltip z-index issues", "bug", "low", "todo", null, null, 1, ["ui"]),
  mkTicket(41, "Create email templates", "task", "medium", "todo", null, null, 5, ["email"]),
  mkTicket(42, "Implement audit logging", "story", "high", "todo", null, null, 8, ["security"]),
  mkTicket(43, "Add 2FA support", "story", "high", "todo", null, null, 8, ["auth", "security"]),
  mkTicket(44, "Optimize image loading", "task", "medium", "todo", null, null, 3, ["performance"]),
];

export const burndownData: BurndownPoint[] = [
  { day: "Oct 28", ideal: 57, actual: 57 },
  { day: "Oct 29", ideal: 53, actual: 55 },
  { day: "Oct 30", ideal: 49, actual: 52 },
  { day: "Oct 31", ideal: 45, actual: 48 },
  { day: "Nov 1", ideal: 41, actual: 45 },
  { day: "Nov 2", ideal: 37, actual: 40 },
  { day: "Nov 3", ideal: 33, actual: 38 },
  { day: "Nov 4", ideal: 29, actual: 33 },
  { day: "Nov 5", ideal: 25, actual: 30 },
  { day: "Nov 6", ideal: 20, actual: 27 },
  { day: "Nov 7", ideal: 16, actual: 22 },
  { day: "Nov 8", ideal: 12, actual: 18 },
  { day: "Nov 9", ideal: 8, actual: 14 },
  { day: "Nov 10", ideal: 4, actual: 10 },
  { day: "Nov 11", ideal: 0, actual: 6 },
];

export const velocityData = [
  { sprint: "Sprint 1", committed: 34, completed: 34 },
  { sprint: "Sprint 2", committed: 28, completed: 28 },
  { sprint: "Sprint 3", committed: 31, completed: 31 },
  { sprint: "Sprint 4", committed: 57, completed: 18 },
];
