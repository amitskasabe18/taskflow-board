import React, { useEffect, useState } from "react";
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
} from "lucide-react";

const BASE_URL = "http://localhost:8000";

interface Creator {
  first_name: string;
  last_name: string;
}

interface Project {
  id: string | number;
  uuid: string;
  name: string;
  description?: string;
  priority: string;
  status: string;
  start_date: string;
  end_date?: string;
  created_by: Creator;
}

const PRIORITY_CONFIG: Record<string, any> = {
  urgent: { label: "Urgent", icon: Flame, color: "text-red-500", bg: "bg-red-50", darkBg: "dark:bg-red-950/20" },
  high: { label: "High", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50", darkBg: "dark:bg-orange-950/20" },
  medium: { label: "Medium", icon: CircleDot, color: "text-yellow-500", bg: "bg-yellow-50", darkBg: "dark:bg-yellow-950/20" },
  low: { label: "Low", icon: CircleDashed, color: "text-blue-500", bg: "bg-blue-50", darkBg: "dark:bg-blue-950/20" },
};

const STATUS_CONFIG: Record<string, any> = {
  active: { label: "Active", icon: CircleDot, color: "text-emerald-500", bg: "bg-emerald-50", darkBg: "dark:bg-emerald-950/20" },
  in_progress: { label: "In Progress", icon: RefreshCw, color: "text-blue-500", bg: "bg-blue-50", darkBg: "dark:bg-blue-950/20" },
  planning: { label: "Planning", icon: CircleDashed, color: "text-purple-500", bg: "bg-purple-50", darkBg: "dark:bg-purple-950/20" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50", darkBg: "dark:bg-green-950/20" },
  on_hold: { label: "On Hold", icon: Clock, color: "text-amber-500", bg: "bg-amber-50", darkBg: "dark:bg-amber-950/20" },
};

function getPriority(key: string) {
  return PRIORITY_CONFIG[key?.toLowerCase()] ?? PRIORITY_CONFIG["low"];
}

function getStatus(key: string) {
  return STATUS_CONFIG[key?.toLowerCase()] ?? STATUS_CONFIG["planning"];
}

function formatDate(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(p: Project) {
  return `${p.created_by.first_name[0]}${p.created_by.last_name[0]}`.toUpperCase();
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border p-5 space-y-4 animate-pulse
    bg-white border-zinc-200
    dark:bg-zinc-900 dark:border-zinc-800">
      <Skeleton className="h-5 w-40 rounded" />
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-2/3 rounded" />
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const priority = getPriority(project.priority);
  const status = getStatus(project.status);

  const PriorityIcon = priority.icon;
  const StatusIcon = status.icon;

  const handleCardClick = () => {
    window.location.href = `/${project.uuid}/board`;
  };

  return (
    <div
      onClick={handleCardClick}
      className="
      group rounded-xl border cursor-pointer transition-all
      bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-lg
      dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:shadow-xl
      "
    >
      {/* Top accent strip */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500
                      group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-blue-600
                      transition-all duration-300" />
      
      <div className="p-5">

        {/* Header */}
        <div className="flex justify-between mb-3">

          <h2 className="
          font-semibold truncate
          text-zinc-900
          dark:text-zinc-100
          group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors
          ">
            {project.name}
          </h2>

          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full
          ${priority.bg} ${priority.color}
          ${priority.darkBg}
          font-medium`}>
            <PriorityIcon size={12}/>
            {priority.label}
          </span>

        </div>

        {/* Description */}

        <p className="
        text-sm mb-4 line-clamp-2
        text-zinc-600
        dark:text-zinc-400
        ">
          {project.description || "No description provided"}
        </p>

        {/* Status */}

        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full
        ${status.bg} ${status.color}
        ${status.darkBg}
        font-medium`}>
          <StatusIcon size={12}/>
          {status.label}
        </span>

        <div className="border-t my-4
        border-zinc-200
        dark:border-zinc-800
        "/>

        {/* Footer */}

        <div className="flex justify-between items-end">

          <div className="space-y-1">

            <div className="flex items-center gap-1 text-xs
            text-zinc-600
            dark:text-zinc-400
            ">
              <Calendar size={12}/>
              {formatDate(project.start_date)}
            </div>

            <div className="flex items-center gap-1 text-xs
            text-zinc-600
            dark:text-zinc-400
            ">
              <User size={12}/>
              {project.created_by.first_name} {project.created_by.last_name}
            </div>

          </div>

          <div className="flex items-center gap-2">

            <div className="
            w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
            bg-gradient-to-br from-blue-500 to-purple-600 text-white
            shadow-sm
            ">
              {initials(project)}
            </div>

            <ArrowUpRight size={16} className="
            text-zinc-400 group-hover:text-blue-500
            dark:text-zinc-600 dark:group-hover:text-blue-400 transition-colors
            "/>

          </div>

        </div>

      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-2 flex flex-col items-center py-24">

      <Layers className="
      w-10 h-10 mb-4
      text-zinc-400
      dark:text-zinc-600
      "/>

      <p className="font-medium
      text-zinc-700
      dark:text-zinc-400
      ">
        No projects yet
      </p>

      <p className="
      text-sm
      text-zinc-500
      dark:text-zinc-600
      ">
        Projects assigned to you will appear here
      </p>

    </div>
  );
}

const Board = () => {

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {

    setLoading(true);
    setError(null);

    try {

      const res = await fetch(`${BASE_URL}/api/v1/projects/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      const json = await res.json();

      if (json.success) {
        setProjects(json.data.projects.data);
      } else {
        setError("Failed to load projects");
      }

    } catch {
      setError("Unable to reach server");
    }

    setLoading(false);

  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="
    min-h-screen
    bg-white text-zinc-900
    dark:bg-zinc-950 dark:text-zinc-100
    ">

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}

        <div className="flex justify-between mb-8">

          <div>

            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-purple-600" />
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                Workspace
              </span>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
              My Projects
            </h1>

            {!loading && !error && (
              <p className="
              text-sm
              text-zinc-500
              dark:text-zinc-600
              mt-1
              ">
                {projects.length} {projects.length === 1 ? "project" : "projects"} assigned to you
              </p>
            )}

          </div>

          <button
            onClick={fetchProjects}
            className="
            flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium
            border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300
            dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:hover:border-zinc-700
            transition-all duration-200
            "
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""}/>
            Refresh
          </button>

        </div>

        {error && (
          <Alert className="mb-6">
            <AlertTriangle className="w-4 h-4"/>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Grid */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i}/>
              ))
            : projects.length === 0
            ? <EmptyState/>
            : projects.map((p) => (
                <ProjectCard key={p.id} project={p}/>
              ))
          }

        </div>

      </div>

    </div>
  );
};

export default Board; 