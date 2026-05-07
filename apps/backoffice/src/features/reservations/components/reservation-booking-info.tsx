"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon2,
  ClockIcon,
  FileTextIcon,
  VideoIcon,
  UsersIcon,
  WeightIcon2,
  RulerIcon2,
  CakeIcon,
  CreditCardIcon2,
} from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getCategoryLabel } from "./reservation-utils";

interface StagiaireInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  weight: number;
  height: number;
  birthDate?: string | Date | null;
}

interface ClientInfo {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
}

interface ActivityInfo {
  duration: number | string;
  places: number;
}

interface MoniteurEntry {
  id: string;
  moniteur: { name: string };
}

interface AvailablePlaces {
  remaining: number;
  total: number;
  confirmed: number;
}

interface ReservationBookingInfoProps {
  stagiaire: StagiaireInfo;
  client?: ClientInfo | null;
  isStage: boolean;
  activityDate: string | Date;
  activity: ActivityInfo;
  bookingCategory: string;
  hasVideo: boolean;
  availablePlaces?: AvailablePlaces | null;
  moniteurs: MoniteurEntry[];
}

export function ReservationBookingInfo({
  stagiaire,
  client,
  isStage,
  activityDate,
  activity,
  bookingCategory,
  hasVideo,
  availablePlaces,
  moniteurs,
}: ReservationBookingInfoProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Participant Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Informations du stagiaire
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium text-lg">
                  {stagiaire.firstName} {stagiaire.lastName}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <MailIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{stagiaire.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <PhoneIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{stagiaire.phone}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <WeightIcon2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Poids</p>
                <p className="font-medium">{stagiaire.weight} kg</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RulerIcon2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Taille</p>
                <p className="font-medium">{stagiaire.height} cm</p>
              </div>
            </div>

            {stagiaire.birthDate && (
              <div className="flex items-start gap-3">
                <CakeIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date de naissance</p>
                  <p className="font-medium">
                    {format(new Date(stagiaire.birthDate), "dd MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {client && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCardIcon2 className="h-4 w-4" />
                  Client payeur
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Nom:</span>{" "}
                    {client.firstName} {client.lastName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span> {client.email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Téléphone:</span> {client.phone}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Adresse:</span> {client.address}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Ville:</span> {client.postalCode}{" "}
                    {client.city}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Pays:</span> {client.country}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Activity Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isStage ? (
              <CalendarIcon className="h-5 w-5" />
            ) : (
              <VideoIcon className="h-5 w-5" />
            )}
            Détails du {isStage ? "stage" : "baptême"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium text-lg">
                  {format(
                    new Date(activityDate),
                    isStage ? "dd MMMM yyyy" : "dd MMMM yyyy 'à' HH:mm",
                    { locale: fr },
                  )}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <ClockIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Durée</p>
                <p className="font-medium">
                  {isStage ? `${activity.duration} jours` : `${activity.duration} minutes`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileTextIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Type/Catégorie</p>
                <p className="font-medium">{getCategoryLabel(bookingCategory)}</p>
              </div>
            </div>

            {hasVideo && (
              <div className="flex items-start gap-3">
                <VideoIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Option vidéo</p>
                  <Badge variant="secondary" className="mt-1">
                    <VideoIcon className="h-3 w-3 mr-1" />
                    Vidéo incluse
                  </Badge>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <UsersIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Places</p>
                <p className="font-medium">
                  {availablePlaces?.remaining ?? 0} restantes sur{" "}
                  {availablePlaces?.total ?? activity.places}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {availablePlaces?.confirmed ?? 0} réservation(s) confirmée(s)
                </p>
              </div>
            </div>

            {moniteurs.length > 0 && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <UsersIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Moniteurs assignés</p>
                    <div className="space-y-1">
                      {moniteurs.map((m) => (
                        <div key={m.id} className="flex items-center gap-2">
                          <Badge variant="outline">{m.moniteur.name}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
