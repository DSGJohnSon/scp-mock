"use client";

import { useState } from "react";

type ProductStats = { totalCA: number; collected: number; pending: number };
import { useGetDashboardStats } from "@/features/dashboard/api/use-get-dashboard-stats";
import { useGetMonitorSchedule } from "@/features/dashboard/api/use-get-monitor-schedule";
import { useGetToday } from "@/features/dashboard/api/use-get-today";
import { useCurrent } from "@/features/auth/api/use-current";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  EuroSignIcon,
  MountainIcon2,
  AirplaneIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/lib/icons";
import { formatCurrency, formatPct } from "@/lib/formatting";
import { DashboardTodayCard } from "./dashboard-today-card";
import { DashboardRevenueChart, type Period } from "./dashboard-revenue-chart";
import { DashboardStagesFill } from "./dashboard-stages-fill";
import { DashboardMonitorSchedule } from "./dashboard-monitor-schedule";

function getMonthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

function navigateMonth(ym: string, direction: -1 | 1): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + direction, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth);
  const [period, setPeriod] = useState<Period>(12);

  const { data, isLoading } = useGetDashboardStats(selectedMonth);
  const { data: scheduleData, isLoading: isLoadingSchedule } = useGetMonitorSchedule();
  const { data: todayData } = useGetToday();
  const { data: user } = useCurrent();
  const router = useRouter();

  const isAdmin = user?.role === "ADMIN";

  const annualStats = data?.annualStats;
  const smStats = data?.selectedMonthStats;
  const smActivities = data?.selectedMonthActivities;

  const periodData = data?.chart?.byMonth?.slice(-period) ?? [];

  const todayStagesCount = todayData?.stages?.length ?? 0;
  const todayParticipants =
    todayData?.stages?.reduce(
      (s: number, st: { participants: unknown[] }) => s + st.participants.length,
      0
    ) ?? 0;
  const hasTodayActivities = todayStagesCount > 0;

  const [smYear, smMonth] = selectedMonth.split("-").map(Number);
  const smLabel = getMonthLabel(smYear, smMonth);
  const isCurrentMonth = selectedMonth === currentYearMonth();

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Page title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Bienvenue{user?.name ? `, ${user.name}` : ""} — vue d&apos;ensemble de votre école
        </p>
      </div>

      {hasTodayActivities && (
        <DashboardTodayCard
          todayStagesCount={todayStagesCount}
          todayParticipants={todayParticipants}
          onViewDetail={() => router.push("/dashboard/today")}
        />
      )}

      {/* ── Saison + Graphique côte à côte (Admin only) ─────────────────────── */}
      {isAdmin && annualStats && data?.chart?.byMonth && (
        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">

          {/* ── Carte Saison ── */}
          <Card className="bg-sidebar text-sidebar-foreground flex flex-col">
            <CardHeader className="pb-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-white">
                  Saison {annualStats.year}
                </CardTitle>
                <Badge className="bg-white/15 text-white/90 text-xs border-0">
                  {annualStats.totalReservations} résa
                  <span className="opacity-60 ml-1">
                    · {annualStats.uniqueStagiaires} stagiaires
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4 flex-1">
              <div>
                <p className="text-xs text-white/50 font-medium uppercase tracking-wide mb-0.5">
                  Chiffre d&apos;affaires total
                </p>
                <p className="text-4xl font-extrabold text-white tabular-nums">
                  {formatCurrency(annualStats.totalCA)}
                </p>
                <p className="text-xs text-white/40 mt-1">encaissé + soldes en attente</p>
              </div>

              {annualStats.totalCA > 0 && (
                <div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-white/10">
                    <div
                      className="bg-blue-400"
                      style={{ width: formatPct(annualStats.totalCollected, annualStats.totalCA) }}
                    />
                    <div
                      className="bg-amber-400"
                      style={{ width: formatPct(annualStats.totalPending, annualStats.totalCA) }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/50 mt-1">
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
                      Encaissé {formatCurrency(annualStats.totalCollected)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                      En attente {formatCurrency(annualStats.totalPending)}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                {(
                  [
                    {
                      key: "stages" as const,
                      label: "Stages",
                      icon: <MountainIcon2 className="h-3.5 w-3.5" />,
                      barColor: "bg-blue-400",
                      pendingColor: "bg-blue-900",
                    },
                    {
                      key: "baptemes" as const,
                      label: "Baptêmes",
                      icon: <AirplaneIcon className="h-3.5 w-3.5" />,
                      barColor: "bg-sky-400",
                      pendingColor: "bg-sky-900",
                    },
                    {
                      key: "giftVouchers" as const,
                      label: "Bons cadeaux",
                      icon: <EuroSignIcon className="h-3.5 w-3.5" />,
                      barColor: "bg-emerald-400",
                      pendingColor: "bg-emerald-900",
                    },
                  ] as const
                ).map(({ key, label, icon, barColor, pendingColor }) => {
                  const p = (annualStats.byProduct as Record<string, ProductStats>)[key] ?? { totalCA: 0, collected: 0, pending: 0 };
                  if (p.totalCA === 0) return null;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-white/60">
                          {icon} {label}
                        </span>
                        <span className="font-semibold tabular-nums text-white">
                          {formatCurrency(p.totalCA)}{" "}
                          <span className="font-normal text-white/40">
                            ({formatPct(p.totalCA, annualStats.totalCA)})
                          </span>
                        </span>
                      </div>
                      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/10">
                        <div className={barColor} style={{ width: formatPct(p.collected, p.totalCA) }} />
                        {p.pending > 0 && (
                          <div className={pendingColor} style={{ width: formatPct(p.pending, p.totalCA) }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-white/10">
                <div>
                  <p className="text-[10px] text-white/50 leading-tight">Acomptes</p>
                  <p className="text-sm font-bold tabular-nums text-white mt-0.5">
                    {formatCurrency(annualStats.depositsPaid)}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {formatPct(annualStats.depositsPaid, annualStats.totalCollected)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-white/50 leading-tight">Soldes versés</p>
                  <p className="text-sm font-bold tabular-nums text-white mt-0.5">
                    {formatCurrency(Math.max(0, annualStats.balancesPaid))}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {formatPct(Math.max(0, annualStats.balancesPaid), annualStats.totalCollected)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-white/50 leading-tight">En attente</p>
                  <p className="text-sm font-bold tabular-nums text-amber-400 mt-0.5">
                    {formatCurrency(annualStats.totalPending)}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {formatPct(annualStats.totalPending, annualStats.totalCA)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <DashboardRevenueChart
            periodData={periodData}
            period={period}
            onPeriodChange={setPeriod}
          />
        </div>
      )}

      {/* ── Section mensuelle CA (Admin only) ───────────────────────────────── */}
      {isAdmin && smStats && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-lg font-semibold capitalize">{smLabel}</h3>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSelectedMonth((m) => navigateMonth(m, -1))}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              {!isCurrentMonth && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setSelectedMonth(currentYearMonth())}
                >
                  Aujourd&apos;hui
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSelectedMonth((m) => navigateMonth(m, 1))}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-200 bg-blue-50/40">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">CA total du mois</p>
                <p className="text-2xl font-bold">{formatCurrency(smStats.totalCA)}</p>
                <p className="text-xs text-muted-foreground mt-1">encaissé + soldes en attente</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Encaissé</p>
                <p className="text-2xl font-bold">{formatCurrency(smStats.totalCollected)}</p>
                <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                  <span>En ligne : {formatCurrency(smStats.onlineCollected)}</span>
                  <span>·</span>
                  <span>Manuel : {formatCurrency(smStats.manualCollected)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Soldes en attente</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(smStats.totalPending)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPct(smStats.totalPending, smStats.totalCA)} du CA du mois
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Réservations</p>
                <p className="text-2xl font-bold">{smStats.totalReservations}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {smStats.uniqueStagiaires} stagiaires uniques
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                {
                  key: "stages" as const,
                  label: "Stages",
                  icon: <MountainIcon2 className="h-4 w-4" />,
                  color: "text-blue-600",
                  bg: "bg-blue-100",
                },
                {
                  key: "baptemes" as const,
                  label: "Baptêmes",
                  icon: <AirplaneIcon className="h-4 w-4" />,
                  color: "text-sky-600",
                  bg: "bg-sky-100",
                },
                {
                  key: "giftVouchers" as const,
                  label: "Bons cadeaux",
                  icon: <EuroSignIcon className="h-3.5 w-3.5" />,
                  color: "text-emerald-600",
                  bg: "bg-emerald-100",
                },
              ] as const
            ).map(({ key, label, icon, color, bg }) => {
              const p = (smStats.byProduct as Record<string, ProductStats>)[key] ?? { totalCA: 0, collected: 0, pending: 0 };
              if (p.totalCA === 0) return null;
              return (
                <Card key={key}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg} ${color}`}>
                        {icon}
                      </div>
                      <p className="text-sm font-medium">{label}</p>
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(p.totalCA)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatPct(p.totalCA, smStats.totalCA)} du total mensuel
                    </p>
                    {p.pending > 0 && (
                      <p className="text-xs text-amber-600 mt-0.5">
                        {formatCurrency(p.pending)} en attente
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Section remplissage mensuel (Admin only) ──────────────────────── */}
      {isAdmin && smActivities && (
        <DashboardStagesFill smActivities={smActivities} />
      )}

      {/* ── Vue moniteur ──────────────────────────────────────────────────── */}
      {!isAdmin && (
        <DashboardMonitorSchedule
          scheduleData={scheduleData}
          isLoadingSchedule={isLoadingSchedule}
        />
      )}
    </div>
  );
}
