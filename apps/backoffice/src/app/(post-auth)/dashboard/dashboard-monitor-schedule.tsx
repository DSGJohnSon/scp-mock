"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MountainIcon2, UsersIcon, ExternalLinkIcon } from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface Participant {
  id: string;
  name: string;
}

interface StageEntry {
  id: string;
  type: string;
  bookingsCount: number;
  duration: number;
  startDate: string | Date;
  participants: Participant[];
}

interface NextStageEntry {
  type: string;
  bookingsCount: number;
  duration: number;
  startDate: string | Date;
}

interface ScheduleData {
  stages: StageEntry[];
  upcoming?: {
    nextStage?: NextStageEntry | null;
  } | null;
}

interface DashboardMonitorScheduleProps {
  scheduleData: ScheduleData | null | undefined;
  isLoadingSchedule: boolean;
}

export function DashboardMonitorSchedule({
  scheduleData,
  isLoadingSchedule,
}: DashboardMonitorScheduleProps) {
  const router = useRouter();

  return (
    <>
      {scheduleData && scheduleData.stages.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <CardTitle>Mes activités du jour</CardTitle>
              </div>
              <Badge variant="default" className="text-sm">
                {format(new Date(), "d MMMM yyyy", { locale: fr })}
              </Badge>
            </div>
            <CardDescription>Vos stages programmés aujourd&apos;hui</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <MountainIcon2 className="h-4 w-4" />
                <span>Stages ({scheduleData.stages.length})</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {scheduleData.stages.map((stage) => (
                  <Card key={stage.id} className="bg-background">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Stage {stage.type}</CardTitle>
                        <Badge variant="secondary">
                          <UsersIcon className="h-3 w-3 mr-1" />
                          {stage.bookingsCount}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {stage.duration} jours • Début :{" "}
                        {format(new Date(stage.startDate), "HH:mm", { locale: fr })}
                      </CardDescription>
                    </CardHeader>
                    {stage.participants.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="text-xs space-y-1">
                          <p className="font-medium">Participants :</p>
                          {stage.participants.map((participant, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2">
                              <p className="text-muted-foreground truncate">• {participant.name}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  router.push(`/dashboard/reservations/${participant.id}`)
                                }
                              >
                                <ExternalLinkIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoadingSchedule && scheduleData && scheduleData.stages.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <CalendarIcon className="h-10 w-10 text-muted-foreground mb-4" />
            <CardTitle className="text-lg">Pas de stage aujourd&apos;hui !</CardTitle>
            <CardDescription>Profitez de votre journée libre</CardDescription>
          </CardContent>
        </Card>
      )}

      {scheduleData?.upcoming?.nextStage && (
        <Card className="border-blue-500/50 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <CardTitle>À venir</CardTitle>
            </div>
            <CardDescription>Vos prochaines activités programmées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <MountainIcon2 className="h-4 w-4" />
                <span>Prochain stage</span>
              </div>
              <Card className="bg-background">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      Stage {scheduleData.upcoming.nextStage.type}
                    </CardTitle>
                    <Badge variant="secondary">
                      <UsersIcon className="h-3 w-3 mr-1" />
                      {scheduleData.upcoming.nextStage.bookingsCount}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {scheduleData.upcoming.nextStage.duration} jours •{" "}
                    {format(
                      new Date(scheduleData.upcoming.nextStage.startDate),
                      "d MMMM yyyy",
                      { locale: fr },
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
