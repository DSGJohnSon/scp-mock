"use client";

import { UsersRoundIcon, GraduationIcon, UsersGroupIcon } from "@/lib/icons";

interface UsersStatsProps {
  total: number;
  admins: number;
  moniteurs: number;
}

export function UsersStats({ total, admins, moniteurs }: UsersStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2">
          <UsersGroupIcon className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground">Utilisateurs</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
        <div className="rounded-md bg-blue-500/10 p-2">
          <UsersRoundIcon className="size-5 text-blue-500" />
        </div>
        <div>
          <p className="text-2xl font-bold">{admins}</p>
          <p className="text-xs text-muted-foreground">Administrateurs</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
        <div className="rounded-md bg-emerald-500/10 p-2">
          <GraduationIcon className="size-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-2xl font-bold">{moniteurs}</p>
          <p className="text-xs text-muted-foreground">Moniteurs</p>
        </div>
      </div>
    </div>
  );
}
