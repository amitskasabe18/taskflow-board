import { useState, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { team } from "@/data/mockData";
import { useAppState } from "@/context/AppContext";
import { statusConfig } from "@/lib/ticketUtils";
import { TeamMember } from "@/types";
import { cn } from "@/lib/utils";

export default function Team() {
  const { tickets } = useAppState();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const memberStats = useMemo(() => {
    return team.map((m) => {
      const assigned = tickets.filter((t) => t.assigneeId === m.id && t.sprintId === "s4");
      const done = assigned.filter((t) => t.status === "done");
      const totalPts = assigned.reduce((a, t) => a + (t.storyPoints || 0), 0);
      const donePts = done.reduce((a, t) => a + (t.storyPoints || 0), 0);
      return { member: m, ticketCount: assigned.length, totalPts, donePts, progress: totalPts ? Math.round((donePts / totalPts) * 100) : 0 };
    });
  }, [tickets]);

  const statusDot: Record<string, string> = { available: "bg-success", busy: "bg-warning", away: "bg-muted-foreground" };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Team</h1>
        <p className="text-sm text-muted-foreground mt-1">{team.length} members</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {memberStats.map(({ member, ticketCount, totalPts, donePts, progress }) => (
          <button
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="rounded-lg bg-surface border border-border p-5 text-left hover:border-primary/50 transition-all hover-lift"
          >
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg font-semibold" style={{ backgroundColor: member.avatarColor, color: "white" }}>{member.initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{member.name}</h3>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Active Sprint: {ticketCount} tickets</span>
                <span>Points: {donePts} / {totalPts}</span>
              </div>
              <Progress value={progress} className="h-1.5 bg-accent" />
              <div className="flex items-center gap-1.5 text-xs">
                <span className={cn("h-2 w-2 rounded-full", statusDot[member.status])} />
                <span className="text-muted-foreground capitalize">{member.status}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Member Detail Sheet */}
      <Sheet open={!!selectedMember} onOpenChange={(o) => !o && setSelectedMember(null)}>
        <SheetContent className="w-[500px] sm:max-w-[500px] bg-surface border-border overflow-y-auto">
          {selectedMember && <MemberDetail member={selectedMember} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MemberDetail({ member }: { member: TeamMember }) {
  const { tickets } = useAppState();
  const memberTickets = useMemo(() => tickets.filter((t) => t.assigneeId === member.id), [tickets, member]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-2xl font-semibold" style={{ backgroundColor: member.avatarColor, color: "white" }}>{member.initials}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold text-foreground">{member.name}</h2>
          <p className="text-sm text-muted-foreground">{member.role}</p>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-3">Assigned Tickets ({memberTickets.length})</h3>
      <div className="space-y-1">
        {memberTickets.map((t) => {
          const sc = statusConfig[t.status];
          return (
            <div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/30 transition-colors text-sm">
              <span className="text-xs font-mono text-muted-foreground w-14">{t.key}</span>
              <span className="flex-1 truncate text-foreground">{t.title}</span>
              <Badge variant="outline" className={cn("text-[10px]", sc.color)}>{sc.label}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
