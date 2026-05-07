"use client";

import CopyTextComponent from "@/components/copy-text-component";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from "@/lib/icons";

const stageTypeLabels: Record<string, string> = {
  NONE: "Non défini",
  INITIATION: "Initiation",
  PROGRESSION: "Progression",
  AUTONOMIE: "Autonomie",
  DOUBLE: "Double",
};

interface StageHeaderCardProps {
  stage: {
    id: string;
    type: string;
    startDate: Date | string;
    duration: number;
    places: number;
    createdAt: Date | string;
    updatedAt: Date | string;
    bookingsCount: number;
  };
}

export function StageHeaderCard({ stage }: StageHeaderCardProps) {
  const availablePlaces = stage.places - stage.bookingsCount;
  const isFullyBooked = availablePlaces <= 0;

  const endDate = new Date(stage.startDate);
  endDate.setDate(endDate.getDate() + stage.duration);

  return (
    <Card className="bg-slate-950 text-white">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Stage de Parapente</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-slate-950 bg-white hover:bg-white">
                {stageTypeLabels[stage.type] ?? stage.type}
              </Badge>
              <Badge variant="outline" className="text-white">
                {new Date(stage.startDate).getFullYear()}
              </Badge>
              <div className="flex items-center text-slate-50/50">
                <span className="text-xs text-slate-50/50">ID : {stage.id}</span>
                <CopyTextComponent text={stage.id} className="ml-2" />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <UsersIcon className="h-4 w-4" />
              <span className="font-medium">
                {stage.bookingsCount}/{stage.places} places
              </span>
            </div>
            {isFullyBooked ? (
              <Badge variant="destructive">
                <AlertTriangleIcon className="h-3 w-3 mr-1" />
                Complet
              </Badge>
            ) : (
              <Badge variant="outline" className="text-white">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                {availablePlaces} place{availablePlaces > 1 ? "s" : ""}{" "}
                disponible{availablePlaces > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Début:</span>
            <span>{formatDate(new Date(stage.startDate))}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Créé le:</span>
            <span>{formatDate(new Date(stage.createdAt))}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Fin:</span>
            <span>{formatDate(endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Modifié le:</span>
            <span>{formatDate(new Date(stage.updatedAt))}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
