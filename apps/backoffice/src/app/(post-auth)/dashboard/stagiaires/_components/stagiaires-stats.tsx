import { UserCheckIcon, CalendarCheckIcon } from "@/lib/icons";

interface StagiairesStatsProps {
  totalCount: number;
  totalBookings: number;
}

export function StagiairesStats({
  totalCount,
  totalBookings,
}: StagiairesStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2">
          <UserCheckIcon className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{totalCount}</p>
          <p className="text-xs text-muted-foreground">Stagiaires</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
        <div className="rounded-md bg-sky-500/10 p-2">
          <CalendarCheckIcon className="size-5 text-sky-500" />
        </div>
        <div>
          <p className="text-2xl font-bold">{totalBookings}</p>
          <p className="text-xs text-muted-foreground">Réservations (page)</p>
        </div>
      </div>
    </div>
  );
}
