"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ExternalLinkIcon } from "@/lib/icons";

interface DashboardTodayCardProps {
  todayStagesCount: number;
  todayParticipants: number;
  onViewDetail: () => void;
}

export function DashboardTodayCard({
  todayStagesCount,
  todayParticipants,
  onViewDetail,
}: DashboardTodayCardProps) {
  return (
    <Card className="border-blue-300 bg-gradient-to-r from-blue-50 to-sky-50">
      <CardContent className="p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-blue-900">
              {todayStagesCount} stage{todayStagesCount !== 1 ? "s" : ""} aujourd&apos;hui
            </p>
            <p className="text-sm text-blue-700">
              {todayParticipants} participant{todayParticipants !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
          onClick={onViewDetail}
        >
          Voir le détail
          <ExternalLinkIcon className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
