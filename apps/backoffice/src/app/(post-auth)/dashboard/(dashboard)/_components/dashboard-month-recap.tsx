"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeftIcon, ChevronRightIcon } from "@/lib/icons";
import { formatCurrency, formatPct } from "@/lib/formatting";
import type { PeriodStats } from "../_types";

interface DashboardMonthRecapProps {
  stats: PeriodStats | null | undefined;
  smLabel: string;
  isCurrentMonth: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoToCurrentMonth: () => void;
  isLoading: boolean;
}

export function DashboardMonthRecap({
  stats,
  smLabel,
  isCurrentMonth,
  onPrev,
  onNext,
  onGoToCurrentMonth,
  isLoading,
}: DashboardMonthRecapProps) {
  return (
    <div className="space-y-3">
      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-lg font-semibold capitalize">{smLabel}</h3>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={onPrev}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          {!isCurrentMonth && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={onGoToCurrentMonth}
            >
              Aujourd&apos;hui
            </Button>
          )}
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={onNext}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 4 cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border-blue-200 bg-blue-50/40">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">CA total du mois</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalCA ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">encaissé + soldes en attente</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Encaissé</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalCollected ?? 0)}</p>
                <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                  <span>En ligne : {formatCurrency(stats?.onlineCollected ?? 0)}</span>
                  <span>·</span>
                  <span>Manuel : {formatCurrency(stats?.manualCollected ?? 0)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Soldes en attente</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(stats?.totalPending ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPct(stats?.totalPending ?? 0, stats?.totalCA ?? 0)} du CA du mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Réservations</p>
                <p className="text-2xl font-bold">{stats?.totalReservations ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.uniqueStagiaires ?? 0} stagiaires uniques
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
