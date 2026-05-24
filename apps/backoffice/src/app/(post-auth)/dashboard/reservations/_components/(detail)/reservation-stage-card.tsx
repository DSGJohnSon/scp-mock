"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  ExternalLinkIcon,
  ShoppingCartIcon,
} from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const STAGE_TYPE_LABELS: Record<string, string> = {
  INITIATION: "Initiation",
  PROGRESSION: "Progression",
  AUTONOMIE: "Autonomie",
};

interface MoniteurEntry {
  id: string;
  moniteur: { name: string };
}

interface StageInfo {
  id: string;
  startDate: string;
  type: string;
  duration: number;
  places: number;
  moniteurs: MoniteurEntry[];
}

interface AvailablePlaces {
  total: number;
  confirmed: number;
  remaining: number;
}

interface ReservationStageCardProps {
  stage: StageInfo;
  bookingType: string;
  availablePlaces: AvailablePlaces | null;
  orderNumber: string | undefined;
  orderId: string | undefined;
}

export function ReservationStageCard({
  stage,
  bookingType,
  availablePlaces,
  orderNumber,
  orderId,
}: ReservationStageCardProps) {
  const stageLink = `/dashboard/stages?stageId=${stage.id}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarIcon className="size-4" />
          Stage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <CalendarIcon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Date de début</p>
            <p className="font-medium text-lg">
              {format(new Date(stage.startDate), "dd MMMM yyyy", { locale: fr })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ClockIcon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Durée</p>
            <p className="font-medium">{stage.duration} jour{stage.duration > 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CalendarIcon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Type de stage</p>
            <Badge variant="outline">{STAGE_TYPE_LABELS[bookingType] ?? bookingType}</Badge>
          </div>
        </div>

        <Separator />

        {availablePlaces && (
          <div className="flex items-start gap-3">
            <UsersIcon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Places</p>
              <p className="font-medium">
                {availablePlaces.remaining} restante{availablePlaces.remaining > 1 ? "s" : ""} sur {availablePlaces.total}
              </p>
              <p className="text-xs text-muted-foreground">
                {availablePlaces.confirmed} réservation{availablePlaces.confirmed > 1 ? "s" : ""} confirmée{availablePlaces.confirmed > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {stage.moniteurs.length > 0 && (
          <div className="flex items-start gap-3">
            <UsersIcon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Moniteurs assignés</p>
              <div className="flex flex-wrap gap-1.5">
                {stage.moniteurs.map((m) => (
                  <Badge key={m.id} variant="secondary">
                    {m.moniteur.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        <Separator />

        <div className="flex flex-col gap-2 pt-1">
          <Link
            href={stageLink}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon className="size-3.5" />
            Voir ce stage dans le planning
          </Link>

          {orderNumber && orderId && (
            <Link
              href={`/dashboard/commandes/${orderId}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ShoppingCartIcon className="size-3.5" />
              Commande #{orderNumber}
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
