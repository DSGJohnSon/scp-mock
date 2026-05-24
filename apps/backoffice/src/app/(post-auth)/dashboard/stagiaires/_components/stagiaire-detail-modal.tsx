"use client";

import { format, addDays, differenceInYears } from "date-fns";
import { fr } from "date-fns/locale";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { Badge } from "@/components/ui/badge";
import { MailIcon, PhoneIcon, CalendarIcon, CalendarCheckIcon } from "@/lib/icons";
import { AppStagiaire, StageType } from "../_types";

const STAGE_TYPE_LABELS: Record<StageType, string> = {
  INITIATION: "Initiation",
  PROGRESSION: "Progression",
  AUTONOMIE: "Autonomie",
  DOUBLE: "Double",
};

const STAGE_TYPE_CLASSES: Record<StageType, string> = {
  INITIATION: "bg-sky-100 text-sky-800 border-sky-200",
  PROGRESSION: "bg-blue-100 text-blue-800 border-blue-200",
  AUTONOMIE: "bg-blue-100 text-blue-900 border-blue-300",
  DOUBLE: "bg-violet-100 text-violet-800 border-violet-200",
};

interface StagiaireDetailModalProps {
  stagiaire: AppStagiaire | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StagiaireDetailModal({
  stagiaire,
  open,
  onOpenChange,
}: StagiaireDetailModalProps) {
  if (!stagiaire) return null;

  const age = stagiaire.birthDate
    ? differenceInYears(new Date(), new Date(stagiaire.birthDate))
    : null;

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={`${stagiaire.firstName} ${stagiaire.lastName}`}
    >
      {/* ── Header identité ──────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100 space-y-3">
        <div>
          <h2 className="text-lg font-semibold">
            {stagiaire.firstName} {stagiaire.lastName}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inscrit le{" "}
            {format(new Date(stagiaire.createdAt), "d MMMM yyyy", {
              locale: fr,
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MailIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{stagiaire.email || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <PhoneIcon className="h-4 w-4 shrink-0" />
            <span>{stagiaire.phone || "—"}</span>
          </div>

          {stagiaire.birthDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4 shrink-0" />
              <span>
                {format(new Date(stagiaire.birthDate), "dd/MM/yyyy", {
                  locale: fr,
                })}{" "}
                <span className="text-slate-400">· {age} ans</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">
                {stagiaire.weight}
              </span>{" "}
              kg
            </span>
            <span>
              <span className="font-medium text-foreground">
                {stagiaire.height}
              </span>{" "}
              cm
            </span>
          </div>
        </div>
      </div>

      {/* ── Réservations ─────────────────────────────────────────────────── */}
      <div className="px-6 py-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <CalendarCheckIcon className="h-4 w-4" />
          Réservations ({stagiaire.stageBookings.length})
        </h3>

        {stagiaire.stageBookings.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            Aucune réservation enregistrée
          </p>
        ) : (
          <div className="space-y-2">
            {stagiaire.stageBookings
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.stage.startDate).getTime() -
                  new Date(a.stage.startDate).getTime(),
              )
              .map((booking) => {
                const startDate = new Date(booking.stage.startDate);
                const endDate = addDays(startDate, booking.stage.duration - 1);
                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${STAGE_TYPE_CLASSES[booking.stage.type]}`}
                        >
                          {STAGE_TYPE_LABELS[booking.stage.type]}
                        </Badge>
                        {booking.shortCode && (
                          <span className="text-xs font-mono text-slate-500">
                            {booking.shortCode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {format(startDate, "d MMM", { locale: fr })} →{" "}
                        {format(endDate, "d MMM yyyy", { locale: fr })} ·{" "}
                        {booking.stage.duration}j
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize shrink-0">
                      {booking.type.toLowerCase()}
                    </Badge>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
}
