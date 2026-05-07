"use client";

import { Badge } from "@/components/ui/badge";
import { BookingWithStagiaire } from "./stage-types";

interface StageParticipantsTabProps {
  bookings: BookingWithStagiaire[];
  currentBookingsCount: number;
  currentPlaces: number;
  isLoadingDetails: boolean;
}

export function StageParticipantsTab({
  bookings,
  currentBookingsCount,
  currentPlaces,
  isLoadingDetails,
}: StageParticipantsTabProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-800 mb-3">
        Réservations ({currentBookingsCount} / {currentPlaces})
      </h3>
      {isLoadingDetails ? (
        <p className="text-sm text-slate-400">Chargement des réservations…</p>
      ) : bookings.length > 0 ? (
        <div className="space-y-2">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3"
            >
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-slate-800">
                  {booking.stagiaire?.firstName} {booking.stagiaire?.lastName}
                </div>
                <div className="text-xs text-slate-500">{booking.stagiaire?.email}</div>
                <div className="text-xs text-slate-400">{booking.stagiaire?.phone}</div>
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                  {booking.stagiaire?.weight != null && (
                    <span>{booking.stagiaire.weight} kg</span>
                  )}
                  {booking.stagiaire?.height != null && (
                    <span>{booking.stagiaire.height} cm</span>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {booking.type}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <p className="text-sm">Aucune réservation pour ce stage</p>
          <p className="text-xs mt-1">Les clients pourront bientôt réserver ce stage</p>
        </div>
      )}
    </div>
  );
}
