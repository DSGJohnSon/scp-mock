"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MountainIcon2, AirplaneIcon } from "@/lib/icons";

function FillRateBar({ rate }: { rate: number }) {
  const color =
    rate >= 80 ? "bg-green-500" : rate >= 50 ? "bg-amber-400" : "bg-slate-300";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums w-8 text-right">{rate}%</span>
    </div>
  );
}

interface ActivityEntry {
  places: number;
  bookingsCount: number;
}

interface SeasonFillRate {
  stages: { rate: number; reservedPlaces: number; totalPlaces: number };
}

interface SmActivities {
  year: number;
  month: number;
  stages?: ActivityEntry[];
  baptemes?: ActivityEntry[];
  seasonFillRate: SeasonFillRate;
}

interface DashboardStagesFillProps {
  smActivities: SmActivities;
}

function getMonthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

export function DashboardStagesFill({ smActivities }: DashboardStagesFillProps) {
  const mStages = (smActivities.stages ?? []) as ActivityEntry[];
  const mBaptemes = (smActivities.baptemes ?? []) as ActivityEntry[];
  const mStagesTotalPlaces = mStages.reduce((s, st) => s + st.places, 0);
  const mStagesReserved = mStages.reduce((s, st) => s + st.bookingsCount, 0);
  const mStagesRate = mStagesTotalPlaces > 0 ? Math.round((mStagesReserved / mStagesTotalPlaces) * 100) : 0;
  const mBaptTotalPlaces = mBaptemes.reduce((s, b) => s + b.places, 0);
  const mBaptReserved = mBaptemes.reduce((s, b) => s + b.bookingsCount, 0);
  const mBaptRate = mBaptTotalPlaces > 0 ? Math.round((mBaptReserved / mBaptTotalPlaces) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-lg font-semibold">
          Remplissage —{" "}
          <span className="capitalize">
            {getMonthLabel(smActivities.year, smActivities.month)}
          </span>
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <MountainIcon2 className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium">Stages — mois</p>
            </div>
            <p className="text-2xl font-bold">{mStagesRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {mStagesReserved}/{mStagesTotalPlaces} places · {mStages.length} créneau{mStages.length !== 1 ? "x" : ""}
            </p>
            <div className="mt-2">
              <FillRateBar rate={mStagesRate} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                <AirplaneIcon className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium">Baptêmes — mois</p>
            </div>
            <p className="text-2xl font-bold">{mBaptRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {mBaptReserved}/{mBaptTotalPlaces} places · {mBaptemes.length} créneau{mBaptemes.length !== 1 ? "x" : ""}
            </p>
            <div className="mt-2">
              <FillRateBar rate={mBaptRate} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-400">
                <MountainIcon2 className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Stages — saison</p>
            </div>
            <p className="text-2xl font-bold">{smActivities.seasonFillRate.stages.rate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {smActivities.seasonFillRate.stages.reservedPlaces}/
              {smActivities.seasonFillRate.stages.totalPlaces} places
            </p>
            <div className="mt-2">
              <FillRateBar rate={smActivities.seasonFillRate.stages.rate} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
