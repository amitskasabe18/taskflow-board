import { useMemo } from "react";
import { useAppState } from "@/context/AppContext";
import { team, burndownData } from "@/data/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { statusConfig } from "@/lib/ticketUtils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

export default function Sprints() {
  const { tickets, sprints } = useAppState();
  const activeSprint = sprints.find((s) => s.status === "active")!;
  const sprintTickets = useMemo(() => tickets.filter((t) => t.sprintId === activeSprint.id), [tickets, activeSprint]);

  const totalPoints = sprintTickets.reduce((a, t) => a + (t.storyPoints || 0), 0);
  const donePoints = sprintTickets.filter((t) => t.status === "done").reduce((a, t) => a + (t.storyPoints || 0), 0);
  const progress = totalPoints ? Math.round((donePoints / totalPoints) * 100) : 0;

  const statusDist = useMemo(() => {
    const counts: Record<string, number> = { todo: 0, in_progress: 0, in_review: 0, done: 0 };
    sprintTickets.forEach((t) => counts[t.status]++);
    return Object.entries(counts).map(([k, v]) => ({ name: statusConfig[k as keyof typeof statusConfig].label, value: v }));
  }, [sprintTickets]);

  const teamWorkload = useMemo(() => {
    const map: Record<string, number> = {};
    sprintTickets.forEach((t) => {
      if (t.assigneeId) map[t.assigneeId] = (map[t.assigneeId] || 0) + (t.storyPoints || 0);
    });
    return Object.entries(map).map(([id, pts]) => ({ name: team.find((m) => m.id === id)?.name.split(" ")[0] || id, points: pts }));
  }, [sprintTickets]);

  const PIE_COLORS = ["hsl(240, 6%, 56%)", "hsl(199, 89%, 60%)", "hsl(38, 92%, 50%)", "hsl(142, 71%, 45%)"];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{activeSprint.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{activeSprint.goal}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Points", value: totalPoints },
          { label: "Completed", value: donePoints },
          { label: "Remaining", value: totalPoints - donePoints },
          { label: "Progress", value: `${progress}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-surface border border-border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <Progress value={progress} className="h-2 bg-accent" />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">{activeSprint.startDate}</span>
          <span className="text-xs text-muted-foreground">{activeSprint.endDate}</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Burndown */}
        <div className="col-span-2 rounded-lg bg-surface border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Burndown Chart</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={burndownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 20%)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(240, 6%, 56%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(240, 6%, 56%)", fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(240, 8%, 12%)", border: "1px solid hsl(240, 6%, 20%)", borderRadius: 8, color: "hsl(240, 10%, 96%)" }} />
              <Line type="monotone" dataKey="ideal" stroke="hsl(240, 6%, 40%)" strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="actual" stroke="hsl(242, 100%, 71%)" strokeWidth={2} dot={{ fill: "hsl(242, 100%, 71%)", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Dist */}
        <div className="rounded-lg bg-surface border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                {statusDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(240, 8%, 12%)", border: "1px solid hsl(240, 6%, 20%)", borderRadius: 8, color: "hsl(240, 10%, 96%)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {statusDist.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Workload */}
      <div className="rounded-lg bg-surface border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Team Workload</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={teamWorkload}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 20%)" />
            <XAxis dataKey="name" tick={{ fill: "hsl(240, 6%, 56%)", fontSize: 11 }} />
            <YAxis tick={{ fill: "hsl(240, 6%, 56%)", fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(240, 8%, 12%)", border: "1px solid hsl(240, 6%, 20%)", borderRadius: 8, color: "hsl(240, 10%, 96%)" }} />
            <Bar dataKey="points" fill="hsl(242, 100%, 71%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
