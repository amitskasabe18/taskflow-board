import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  User,
  AlertTriangle,
  ArrowUpRight,
  Layers,
  RefreshCw,
  Clock,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  Flame,
  ChevronRight,
} from "lucide-react";

const BASE_URL = "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Creator {
  first_name: string;
  last_name: string;
}

interface Project {
  id: string | number;
  name: string;
  description?: string;
  priority: string;
  status: string;
  start_date: string;
  end_date?: string;
  created_by: Creator;
}

// ─── Config maps ──────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<string, { label: string; icon: React.FC<any>; cls: string; dot: string }> = {
  urgent:   { label: "Urgent",   icon: Flame,        cls: "bg-red-500/10 text-red-400 border-red-500/20",    dot: "bg-red-400"    },
  high:     { label: "High",     icon: AlertTriangle, cls: "bg-orange-500/10 text-orange-400 border-orange-500/20", dot: "bg-orange-400" },
  medium:   { label: "Medium",   icon: CircleDot,    cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", dot: "bg-yellow-400" },
  low:      { label: "Low",      icon: CircleDashed, cls: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", dot: "bg-zinc-500"   },
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.FC<any>; cls: string }> = {
  active:      { label: "Active",      icon: CircleDot,    cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  in_progress: { label: "In Progress", icon: RefreshCw,    cls: "bg-blue-500/10 text-blue-400 border-blue-500/20"         },
  planning:    { label: "Planning",    icon: CircleDashed, cls: "bg-violet-500/10 text-violet-400 border-violet-500/20"   },
  completed:   { label: "Completed",   icon: CheckCircle2, cls: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"         },
  on_hold:     { label: "On Hold",     icon: Clock,        cls: "bg-amber-500/10 text-amber-400 border-amber-500/20"      },
};

function getPriority(key: string) {
  return PRIORITY_CONFIG[key?.toLowerCase()] ?? PRIORITY_CONFIG["low"];
}

function getStatus(key: string) {
  return STATUS_CONFIG[key?.toLowerCase()] ?? STATUS_CONFIG["planning"];
}

function formatDate(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initials(p: Project) {
  return `${p.created_by.first_name[0]}${p.created_by.last_name[0]}`.toUpperCase();
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <Skeleton className="h-5 w-40 bg-zinc-800 rounded" />
        <Skeleton className="h-5 w-16 bg-zinc-800 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full bg-zinc-800 rounded" />
      <Skeleton className="h-3 w-2/3 bg-zinc-800 rounded" />
      <div className="pt-2 border-t border-zinc-800 space-y-2">
        <Skeleton className="h-3 w-24 bg-zinc-800 rounded" />
        <Skeleton className="h-3 w-32 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const priority = getPriority(project.priority);
  const status   = getStatus(project.status);
  const PriorityIcon = priority.icon;
  const StatusIcon   = status.icon;

  return (
    <div
      className="group relative rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden
                 hover:border-zinc-700 transition-all duration-300 cursor-pointer
                 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.4)]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top accent strip — dual tone signature */}
      <div className="h-[2px] w-full bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-800
                      group-hover:from-blue-600 group-hover:via-blue-400 group-hover:to-blue-600
                      transition-all duration-500" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-semibold text-zinc-100 truncate tracking-tight
                           group-hover:text-white transition-colors duration-200">
              {project.name}
            </h2>
          </div>

          {/* Priority badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md
                           text-[10px] font-semibold border tracking-wide uppercase shrink-0
                           ${priority.cls}`}>
            <PriorityIcon className="w-3 h-3" strokeWidth={2} />
            {priority.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-[12.5px] text-zinc-500 leading-relaxed line-clamp-2 mb-4 min-h-[36px]">
          {project.description || "No description provided for this project."}
        </p>

        {/* Status */}
        <div className="mb-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md
                           text-[10px] font-semibold border tracking-wide ${status.cls}`}>
            <StatusIcon className="w-3 h-3" strokeWidth={2} />
            {status.label}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-800 mb-4" />

        {/* Meta row */}
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-1.5">
            {/* Dates */}
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <Calendar className="w-3 h-3 text-zinc-600" />
              <span>
                {formatDate(project.start_date)}
                {project.end_date && (
                  <> <span className="text-zinc-700 mx-0.5">→</span> {formatDate(project.end_date)}</>
                )}
              </span>
            </div>

            {/* Creator */}
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <User className="w-3 h-3 text-zinc-600" />
              <span>{project.created_by.first_name} {project.created_by.last_name}</span>
            </div>
          </div>

          {/* Avatar + arrow */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700
                           flex items-center justify-center text-[10px] font-semibold text-zinc-300">
              {initials(project)}
            </div>
            <ArrowUpRight
              className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors duration-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="col-span-2 flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
        <Layers className="w-6 h-6 text-zinc-600" />
      </div>
      <p className="text-sm font-medium text-zinc-400 mb-1">No projects yet</p>
      <p className="text-xs text-zinc-600">Projects assigned to you will appear here.</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const Board = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${BASE_URL}/api/v1/projects/my`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      const json = await res.json();
      if (json.success) setProjects(json.data.projects.data);
      else              setError("Failed to load projects");
    } catch {
      setError("Unable to reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        .board-root { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-enter { animation: fadeUp 0.35s ease both; }
      `}</style>

      <div className="board-root min-h-screen bg-zinc-950 text-zinc-100">
        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* ── Page header ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-8">
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 rounded-full bg-blue-500" />
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                  Workspace
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">My Projects</h1>
              {!loading && !error && (
                <p className="text-sm text-zinc-600 mt-1">
                  {projects.length} {projects.length === 1 ? "project" : "projects"} assigned to you
                </p>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={fetchProjects}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg
                         bg-zinc-900 border border-zinc-800 text-zinc-400
                         hover:border-zinc-700 hover:text-zinc-200
                         text-[12px] font-medium transition-all duration-200
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* ── Error ────────────────────────────────────────────────── */}
          {error && (
            <Alert className="mb-6 bg-red-500/5 border-red-500/20 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* ── Grid ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              : projects.length === 0
              ? <EmptyState />
              : projects.map((p, i) => (
                  <div key={p.id} className="card-enter" style={{ animationDelay: `${i * 55}ms` }}>
                    <ProjectCard project={p} index={i} />
                  </div>
                ))
            }
          </div>

        </div>
      </div>
    </>
  );
};

export default Board;