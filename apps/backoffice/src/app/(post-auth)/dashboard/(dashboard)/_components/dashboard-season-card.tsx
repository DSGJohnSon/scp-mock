"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPct } from "@/lib/formatting";
import type { PeriodStats } from "../_types";

interface DashboardSeasonCardProps {
  annualStats: PeriodStats | null | undefined;
}

export function DashboardSeasonCard({ annualStats }: DashboardSeasonCardProps) {
  if (!annualStats) return null;

  const { year, totalCA, totalCollected, totalPending, depositsPaid, balancesPaid, totalReservations, uniqueStagiaires } = annualStats;

  return (
    <Card className="bg-sidebar text-sidebar-foreground flex flex-col">
      <CardHeader className="pb-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-white">
            Saison {year}
          </CardTitle>
          <Badge className="bg-white/15 text-white/90 text-xs border-0">
            {totalReservations} résa
            <span className="opacity-60 ml-1">· {uniqueStagiaires} stagiaires</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex flex-col gap-4 flex-1">
        <div>
          <p className="text-xs text-white/50 font-medium uppercase tracking-wide mb-0.5">
            Chiffre d&apos;affaires total
          </p>
          <p className="text-4xl font-extrabold text-white tabular-nums">
            {formatCurrency(totalCA)}
          </p>
          <p className="text-xs text-white/40 mt-1">encaissé + soldes en attente</p>
        </div>

        {totalCA > 0 && (
          <div>
            <div className="flex h-3 rounded-full overflow-hidden bg-white/10">
              <div className="bg-blue-400" style={{ width: formatPct(totalCollected, totalCA) }} />
              <div className="bg-amber-400" style={{ width: formatPct(totalPending, totalCA) }} />
            </div>
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
                Encaissé {formatCurrency(totalCollected)}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                En attente {formatCurrency(totalPending)}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-white/10">
          <div>
            <p className="text-[10px] text-white/50 leading-tight">Acomptes</p>
            <p className="text-sm font-bold tabular-nums text-white mt-0.5">
              {formatCurrency(depositsPaid)}
            </p>
            <p className="text-[10px] text-white/40">
              {formatPct(depositsPaid, totalCollected)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/50 leading-tight">Soldes versés</p>
            <p className="text-sm font-bold tabular-nums text-white mt-0.5">
              {formatCurrency(Math.max(0, balancesPaid))}
            </p>
            <p className="text-[10px] text-white/40">
              {formatPct(Math.max(0, balancesPaid), totalCollected)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/50 leading-tight">En attente</p>
            <p className="text-sm font-bold tabular-nums text-amber-400 mt-0.5">
              {formatCurrency(totalPending)}
            </p>
            <p className="text-[10px] text-white/40">
              {formatPct(totalPending, totalCA)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
