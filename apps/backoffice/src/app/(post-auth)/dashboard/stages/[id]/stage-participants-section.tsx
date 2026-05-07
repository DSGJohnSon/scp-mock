"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { calculateAge, formatDate } from "@/lib/utils";
import {
  MailIcon,
  PhoneIcon,
  RulerIcon2,
  UserIcon,
  UsersIcon,
  WeightIcon2,
} from "@/lib/icons";

const bookingTypeLabels: Record<string, string> = {
  INITIATION: "Initiation",
  PROGRESSION: "Progression",
  AUTONOMIE: "Autonomie",
};

interface Stagiaire {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  birthDate?: Date | string | null;
  weight?: number | null;
  height?: number | null;
}

interface BookingEntry {
  id: string;
  type: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  stagiaire: Stagiaire;
}

interface StageParticipantsSectionProps {
  bookings: BookingEntry[];
}

export function StageParticipantsSection({ bookings }: StageParticipantsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5" />
          Réservations ({bookings.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune réservation pour ce stage</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <div key={booking.id}>
                <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {booking.stagiaire.firstName.charAt(0)}
                      {booking.stagiaire.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {booking.stagiaire.firstName} {booking.stagiaire.lastName}
                        </h4>
                        <Badge variant="default" className="mt-1">
                          {bookingTypeLabels[booking.type] ?? booking.type}
                        </Badge>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Réservé le {formatDate(new Date(booking.createdAt))}</p>
                        {booking.updatedAt !== booking.createdAt && (
                          <p>Modifié le {formatDate(new Date(booking.updatedAt))}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MailIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.stagiaire.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.stagiaire.phone}</span>
                        </div>
                        {booking.stagiaire.birthDate && (
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {calculateAge(new Date(booking.stagiaire.birthDate))} ans
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <WeightIcon2 className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.stagiaire.weight} kg</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RulerIcon2 className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.stagiaire.height} cm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {index < bookings.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
