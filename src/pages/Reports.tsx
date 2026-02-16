import { useMemo } from "react";
import { useAppState } from "@/context/AppContext";
import { velocityData } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function Reports() {
  const { tickets, sprints } = useAppState();

  const sprintSummary = useMemo(() => {
    return sprints.map((s) => {
      const st = tickets.filter((t) => t.sprintId === s.id);
      const committed = st.reduce((a, t) => a + (t.storyPoints || 0), 0);
      const completed = st.filter((t) => t.status === "done").reduce((a, t) => a + (t.storyPoints || 0), 0);
      const pct = committed ? Math.round((completed / committed) * 100) : 0;
      return { name: s.name, dates: `${s.startDate} – ${s.endDate}`, committed, completed, pct, carryOver: committed - completed, status: s.status };
    });
  }, [tickets, sprints]);

  const cycleTimeData = sprints.map((s, i) => ({ sprint: s.name.replace("Sprint ", "S"), avgDays: [3.2, 2.8, 2.5, 3.1, 0][i] || 0 }));

  const chartTooltipStyle = { backgroundColor: "hsl(240, 8%, 12%)", border: "1px solid hsl(240, 6%, 20%)", borderRadius: 8, color: "hsl(240, 10%, 96%)" };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Sprint analytics and team performance</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Velocity */}
        <div className="rounded-lg bg-surface border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Velocity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 20%)" />
              <XAxis dataKey="sprint" tick={{ fill: "hsl(240, 6%, 56%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(240, 6%, 56%)", fontSize: 11 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="committed" fill="hsl(240, 6%, 30%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="hsl(242, 100%, 71%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2 w-2 rounded bg-muted-foreground/40" /> Committed</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2 w-2 rounded bg-primary" /> Completed</div>
          </div>
        </div>

        {/* Cycle Time */}
        <div className="rounded-lg bg-surface border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Cycle Time (Avg Days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={cycleTimeData.filter((d) => d.avgDays > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 20%)" />
              <XAxis dataKey="sprint" tick={{ fill: "hsl(240, 6%, 56%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(240, 6%, 56%)", fontSize: 11 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line type="monotone" dataKey="avgDays" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ fill: "hsl(142, 71%, 45%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sprint Summary Table */}
      <div className="rounded-lg bg-surface border border-border overflow-hidden">
        <h3 className="text-sm font-semibold text-foreground px-4 py-3 border-b border-border">Sprint Summary</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="text-left px-4 py-2.5">Sprint</th>
              <th className="text-left px-4 py-2.5">Dates</th>
              <th className="text-right px-4 py-2.5">Committed</th>
              <th className="text-right px-4 py-2.5">Completed</th>
              <th className="text-right px-4 py-2.5">% Done</th>
              <th className="text-right px-4 py-2.5">Carry-over</th>
            </tr>
          </thead>
          <tbody>
            {sprintSummary.map((s) => (
              <tr key={s.name} className="border-b border-border/50 last:border-b-0 hover:bg-accent/20 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{s.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{s.dates}</td>
                <td className="px-4 py-3 text-sm text-foreground text-right">{s.committed}</td>
                <td className="px-4 py-3 text-sm text-foreground text-right">{s.completed}</td>
                <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: s.pct >= 80 ? "hsl(142, 71%, 45%)" : s.pct >= 50 ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)" }}>{s.pct}%</td>
                <td className="px-4 py-3 text-sm text-muted-foreground text-right">{s.carryOver}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
