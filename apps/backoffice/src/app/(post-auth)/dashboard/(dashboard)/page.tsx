"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetDashboardAnnual } from "@/features/dashboard/api/use-get-dashboard-annual";
import { useGetDashboardMonthly } from "@/features/dashboard/api/use-get-dashboard-monthly";
import { useDashboardPage } from "./_hooks/use-dashboard-page";
import { DashboardSeasonCard } from "./_components/dashboard-season-card";
import { DashboardRevenueChart } from "./_components/dashboard-revenue-chart";
import { DashboardMonthRecap } from "./_components/dashboard-month-recap";
import type { PeriodStats, ChartDataPoint } from "./_types";

export default function DashboardPage() {
  const { data: user } = useCurrent();
  const isAdmin = user?.role === "ADMIN";

  const { selectedMonth, smLabel, isCurrentMonth, navigatePrev, navigateNext, goToCurrentMonth } =
    useDashboardPage();

  const { data: annualData, isLoading: isAnnualLoading } = useGetDashboardAnnual(isAdmin);
  const { data: monthlyData, isLoading: isMonthlyLoading } = useGetDashboardMonthly(
    selectedMonth,
    isAdmin,
  );

  if (!isAdmin) {
    return (
      <main className="flex flex-col gap-6 p-6">
        <p className="text-sm text-muted-foreground">
          Tableau de bord disponible pour les administrateurs uniquement.
        </p>
      </main>
    );
  }

  const annualStats = (annualData as { annualStats?: PeriodStats } | undefined)?.annualStats;
  const byMonth =
    (annualData as { chart?: { byMonth?: ChartDataPoint[] } } | undefined)?.chart?.byMonth ?? [];
  const monthlyStats = (
    monthlyData as { selectedMonthStats?: PeriodStats } | undefined
  )?.selectedMonthStats;

  return (
    <main className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        {user?.name && (
          <p className="text-sm text-muted-foreground mt-1">Bienvenue, {user.name}</p>
        )}
      </div>

      {isAnnualLoading ? (
        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <DashboardSeasonCard annualStats={annualStats} />
          <DashboardRevenueChart byMonth={byMonth} />
        </div>
      )}

      <DashboardMonthRecap
        stats={monthlyStats}
        smLabel={smLabel}
        isCurrentMonth={isCurrentMonth}
        onPrev={navigatePrev}
        onNext={navigateNext}
        onGoToCurrentMonth={goToCurrentMonth}
        isLoading={isMonthlyLoading}
      />
    </main>
  );
}

export const fetchCache = "force-no-store";
