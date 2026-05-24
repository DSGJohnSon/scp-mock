"use client";

import { CalendarCheckIcon, CheckCircleIcon, ClockIcon } from "@/lib/icons";

interface ReservationsStatsProps {
  total: number;
  confirmed: number;
  cancelled: number;
}

export function ReservationsStats({ total, confirmed, cancelled }: ReservationsStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
        <div className="rounded-lg bg-primary/10 p-2">
          <CalendarCheckIcon className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
        <div className="rounded-lg bg-green-500/10 p-2">
          <CheckCircleIcon className="size-5 text-green-600" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Confirmées</p>
          <p className="text-2xl font-bold text-green-600">{confirmed}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
        <div className="rounded-lg bg-red-500/10 p-2">
          <ClockIcon className="size-5 text-red-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Annulées</p>
          <p className="text-2xl font-bold text-red-500">{cancelled}</p>
        </div>
      </div>
    </div>
  );
}
