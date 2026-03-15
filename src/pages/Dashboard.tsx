import { useNavigate } from "react-router-dom";
import { Loader2, ArrowUpRight, CheckCircle2, Circle, Clock, AlertCircle, Flame, TrendingUp, Users, LayoutGrid, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";

// ─── Mock data (replace with real API calls) ─────────────────────────────────

const RECENT_ISSUES = [
  { id: "PLN-142", title: "Fix OAuth token refresh race condition", priority: "urgent", status: "in_progress", assignee: "AK" },
  { id: "PLN-139", title: "Implement drag-and-drop for sprint board",  priority: "high",   status: "todo",        assignee: "RJ" },
  { id: "PLN-136", title: "Add CSV export to reports page",            priority: "medium", status: "in_progress", assignee: "ME" },
  { id: "PLN-133", title: "Write unit tests for auth middleware",       priority: "medium", status: "todo",        assignee: "AK" },
  { id: "PLN-130", title: "Update onboarding flow copy",               priority: "low",    status: "done",        assignee: "SL" },
];

const SPRINT = {
  name: "Sprint 12 — Velocity Push",
  daysLeft: 5,
  progress: 62,
  totalPoints: 42,
  completedPoints: 26,
};

const ACTIVITY = [
  { actor: "RJ", action: "moved", target: "PLN-139", detail: "to In Progress",  time: "2m ago"  },
  { actor: "SL", action: "closed", target: "PLN-130", detail: "Update onboarding flow copy", time: "14m ago" },
  { actor: "ME", action: "commented on", target: "PLN-136", detail: '"CSV delimiter should be configurable"', time: "1h ago" },
  { actor: "AK", action: "created", target: "PLN-143", detail: "Migrate CI to GitHub Actions", time: "2h ago" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_META: Record<string, { label: string; color: string; dot: string }> = {
  urgent: { label: "Urgent", color: "text-red-400",    dot: "bg-red-400"    },
  high:   { label: "High",   color: "text-orange-400", dot: "bg-orange-400" },
  medium: { label: "Med",    color: "text-yellow-400", dot: "bg-yellow-400" },
  low:    { label: "Low",    color: "text-zinc-500",   dot: "bg-zinc-500"   },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  todo:        { label: "Todo",        color: "bg-zinc-700 text-zinc-300"   },
  in_progress: { label: "In Progress", color: "bg-blue-500/20 text-blue-400" },
  done:        { label: "Done",        color: "bg-emerald-500/20 text-emerald-400" },
};

const AVATAR_COLORS: Record<string, string> = {
  AK: "#4f6ef7", RJ: "#f97316", ME: "#a855f7", SL: "#14b8a6",
};

function Avatar({ initials, size = "sm" }: { initials: string; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-[11px]";
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-semibold text-white shrink-0 ring-1 ring-black/20`}
      style={{ background: AVATAR_COLORS[initials] ?? "#6366f1" }}
    >
      {initials}
    </div>
  );
}

// ─── Loading / Auth guards ────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        <p className="text-sm text-zinc-500">Loading workspace…</p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading, token } = useAuthContext(); // Get token from context
  const [stats, setStats] = useState([
    { label: "Created Tickets", value: 0, delta: "by you", icon: Circle, accent: "#60a5fa" },
    { label: "Assigned Tickets", value: 0, delta: "to you", icon: Clock, accent: "#fbbf24" },
    { label: "Resolved Tickets", value: 0, delta: "by you", icon: CheckCircle2, accent: "#34d399" },
    { label: "Overdue", value: 0, delta: "need attention", icon: AlertCircle, accent: "#f87171" },
  ]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch user statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'localhost:8000';
        const fullBaseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
        
        const authToken = token || localStorage.getItem('auth_token');
        
        if (!authToken) {
          setStatsLoading(false);
          return;
        }
        
        const fullUrl = `${fullBaseUrl}/api/v1/users/statistics/my`;
        
        const response = await axios.get(fullUrl, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          const data = response.data.data;
          setStats([
            { label: "Created Tickets", value: data.created_tickets || 0, delta: "by you", icon: Circle, accent: "#60a5fa" },
            { label: "Assigned Tickets", value: data.assigned_tickets || 0, delta: "to you", icon: Clock, accent: "#fbbf24" },
            { label: "Resolved Tickets", value: data.resolved_tickets || 0, delta: "by you", icon: CheckCircle2, accent: "#34d399" },
            { label: "Overdue", value: 0, delta: "need attention", icon: AlertCircle, accent: "#f87171" },
          ]);
        }
      } catch (error) {
        // Silently handle error
      } finally {
        setStatsLoading(false);
      }
    };

    if (user && token) {
      fetchStats();
    } else {
      setStatsLoading(false);
    }
  }, [user, token]);

  if (isLoading || statsLoading) return <LoadingScreen />;

  if (!user) {
    navigate("/auth/login", { replace: true });
    return null;
  }

  const firstName = user.first_name;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 p-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
            <p className="text-sm text-zinc-500 mb-1">{greeting}</p>
            <h1 className="text-[28px] font-semibold tracking-tight dark:text-white">
              {firstName} <span className="text-zinc-600">👋</span>
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Here's what's happening across your projects today.
            </p>
          </div>
          <Button
            onClick={() => navigate("/board")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg px-4 py-2 h-9 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Issue
          </Button>
        </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, delta, icon: Icon, accent }) => (
          <div
            key={label}
            className="group relative rounded-xl border border-border bg-card p-5 hover:border-border/80 transition-all duration-200 cursor-default overflow-hidden"
          >
            {/* Subtle glow */}
            <div
              className="absolute -top-6 -right-6 h-16 w-16 rounded-full opacity-10 blur-xl transition-opacity duration-300 group-hover:opacity-20"
              style={{ background: accent }}
            />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4" style={{ color: accent }} strokeWidth={1.5} />
            </div>
            <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{delta}</p>
          </div>
        ))}
      </div>

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* Left: Recent issues */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Recent Issues</h2>
            </div>
            <button
              onClick={() => navigate("/board")}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
            >
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-border">
            {RECENT_ISSUES.map((issue) => {
              const p = PRIORITY_META[issue.priority];
              const s = STATUS_META[issue.status];
              return (
                <div
                  key={issue.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  {/* Priority dot */}
                  <div className={`h-2 w-2 rounded-full shrink-0 ${p.dot}`} />

                  {/* ID */}
                  <span
                    className="text-[11px] font-medium shrink-0 w-14 text-muted-foreground"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {issue.id}
                  </span>

                  {/* Title */}
                  <span className="flex-1 text-[13px] text-muted-foreground truncate group-hover:text-foreground transition-colors">
                    {issue.title}
                  </span>

                  {/* Status badge */}
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${s.color}`}>
                    {s.label}
                  </span>

                  {/* Assignee */}
                  <Avatar initials={issue.assignee} />

                  {/* Arrow hint */}
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors shrink-0" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Sprint progress card */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-400" />
              <h2 className="text-sm font-semibold text-foreground">Active Sprint</h2>
            </div>
            <p className="text-[11px] text-muted-foreground mb-4">{SPRINT.name}</p>

            {/* Progress bar */}
            <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden mb-3">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                style={{ width: `${SPRINT.progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">
                {SPRINT.completedPoints} / {SPRINT.totalPoints} pts
              </span>
              <span className="font-semibold text-blue-400">{SPRINT.progress}%</span>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {SPRINT.daysLeft} days left
              </span>
              <button
                onClick={() => navigate("/sprints")}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
              >
                Sprint board <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Activity feed */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Activity</h2>
            </div>

            <div className="space-y-4">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Avatar initials={a.actor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-muted-foreground leading-snug">
                      <span className="font-medium text-foreground">{a.actor}</span>{" "}
                      {a.action}{" "}
                      <span
                        className="font-medium text-blue-400 cursor-pointer hover:underline"
                        style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px" }}
                      >
                        {a.target}
                      </span>
                      {" — "}{a.detail}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team quick-view */}
          <div
            className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:border-border/80 transition-colors group"
            onClick={() => navigate("/team")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Team</h2>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
            </div>
            <div className="flex items-center gap-2 mt-4">
              {Object.entries(AVATAR_COLORS).map(([initials]) => (
                <Avatar key={initials} initials={initials} size="md" />
              ))}
              <div className="h-8 w-8 rounded-full bg-muted border border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-colors cursor-pointer">
                <Plus className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">4 members · 2 active now</p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;