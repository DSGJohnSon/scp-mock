"use client";

import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Loader2, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStageCalendar, TYPE_CONFIG, MONTH_NAMES } from "@/hooks/useStageCalendar";
import type { StageType } from "@/hooks/useStageCalendar";
import { MonthGrid } from "./MonthGrid";

export type { StageType };

export default function StageCalendarWidget({ stageType }: { stageType: StageType }) {
  const router = useRouter();
  const {
    viewDate,
    navigate,
    loadingStages,
    loadingAvail,
    filteredStages,
    weeksData,
    hasAnyStages,
    currentMonthHasStages,
    availabilityMap,
    hoveredStageId,
    mousePos,
    tooltipStage,
    dialogStage,
    setDialogStage,
    todayKey,
    handleStageHover,
    handleStageLeave,
    handleMouseMove,
  } = useStageCalendar(stageType);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[80vh]">

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-base text-slate-800 capitalize">
            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </h3>
          {(loadingStages || loadingAvail) && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <MonthGrid
        weeksData={weeksData}
        todayKey={todayKey}
        availabilityMap={availabilityMap}
        hoveredStageId={hoveredStageId}
        onStageHover={handleStageHover}
        onStageLeave={handleStageLeave}
        onStageMouseMove={handleMouseMove}
        onStageClick={setDialogStage}
      />

      {/* Legend */}
      {hasAnyStages && (() => {
        const usedTypes = [...new Set(filteredStages.map((s) => s.type))];
        return (
          <div className="flex flex-wrap gap-4 px-4 pt-2 pb-1">
            {usedTypes.map((type) => {
              const cfg = TYPE_CONFIG[type];
              return cfg ? (
                <div key={type} className="flex items-center gap-1.5">
                  <span className={cn("inline-block w-4 h-2.5 rounded-sm shrink-0", cfg.bgBar)} />
                  <span className="text-xs text-slate-500">{cfg.label}</span>
                </div>
              ) : null;
            })}
          </div>
        );
      })()}

      {/* Empty states */}
      {!hasAnyStages && (
        <div className="text-center py-10">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 text-sm">Aucun créneau disponible.</p>
        </div>
      )}
      {hasAnyStages && !currentMonthHasStages && (
        <p className="text-center text-sm text-slate-400 py-2 px-4">
          Aucun créneau ce mois — naviguez avec les flèches.
        </p>
      )}

      {/* Mouse-following tooltip portal */}
      {tooltipStage && mousePos && createPortal(
        <div
          style={{
            position: "fixed",
            left: mousePos.x + 14,
            top: mousePos.y - 10,
            transform: "translateY(-100%)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
          className="hidden sm:block bg-white border border-slate-200 shadow-xl rounded-xl max-w-[230px]"
        >
          <div className="p-3 space-y-2">
            {(() => {
              const s = tooltipStage.stage;
              const tcfg = TYPE_CONFIG[s.type];
              const thex = tcfg?.bgBarHex ?? "#94a3b8";
              const ta = tooltipStage.avail;
              const tPlaces = ta?.availablePlaces ?? s.places;
              const tAvail = ta?.available ?? true;
              const tPromo = s.promotionOriginalPrice && s.price < s.promotionOriginalPrice;
              const tStart = new Date(s.startDate);
              const tEnd = new Date(s.startDate);
              tEnd.setDate(tEnd.getDate() + s.duration - 1);
              return (
                <>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: thex }} />
                    <span className="font-semibold text-sm text-slate-800">{tcfg?.label}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {tStart.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    {" → "}
                    {tEnd.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <div className="flex items-center gap-2">
                    {tPromo && (
                      <span className="text-xs text-slate-400 line-through">{s.promotionOriginalPrice}€</span>
                    )}
                    <span className="font-bold text-sm" style={{ color: thex }}>{s.price}€</span>
                    {tPromo && (
                      <span className="text-xs font-semibold text-red-500 bg-red-50 px-1 rounded">PROMO</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {ta === undefined
                      ? "Chargement…"
                      : tAvail
                      ? `${tPlaces} place${tPlaces > 1 ? "s" : ""} disponible${tPlaces > 1 ? "s" : ""}`
                      : "Complet"}
                  </p>
                </>
              );
            })()}
          </div>
        </div>,
        document.body,
      )}

      {/* Stage detail dialog */}
      <Dialog open={!!dialogStage} onOpenChange={(open) => { if (!open) setDialogStage(null); }}>
        <DialogContent className="sm:max-w-sm">
          {dialogStage && (() => {
            const cfg = TYPE_CONFIG[dialogStage.type];
            const hex = cfg?.bgBarHex ?? "#94a3b8";
            const avail = availabilityMap[dialogStage.id];
            const places = avail?.availablePlaces ?? dialogStage.places;
            const isAvail = avail?.available ?? true;
            const isOnSale = !!(dialogStage.promotionOriginalPrice && dialogStage.price < dialogStage.promotionOriginalPrice);
            const endDate = new Date(dialogStage.startDate);
            endDate.setDate(endDate.getDate() + dialogStage.duration - 1);
            const availLoading = avail === undefined;

            const effectiveType = dialogStage.type === "DOUBLE" ? stageType : dialogStage.type;
            const params = new URLSearchParams({
              stageId: dialogStage.id,
              stageDate: dialogStage.startDate.split("T")[0],
              stageType: effectiveType,
            });

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    {cfg && <span className={cn("inline-block w-3 h-3 rounded-sm shrink-0", cfg.bgBar)} />}
                    {cfg?.label ?? dialogStage.type}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500">
                    {new Date(dialogStage.startDate).toLocaleDateString("fr-FR", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric",
                    })}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium uppercase mb-1">Fin du stage</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {endDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                      </p>
                      <p className="text-xs text-slate-400">{dialogStage.duration} jours</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-right">
                      <p className="text-xs text-slate-500 font-medium uppercase mb-1">Prix</p>
                      {isOnSale && (
                        <p className="text-xs text-slate-400 line-through">{dialogStage.promotionOriginalPrice}€</p>
                      )}
                      <p className="font-bold text-2xl text-blue-600">{dialogStage.price}€</p>
                      {isOnSale && <Badge variant="destructive" className="text-xs">PROMO</Badge>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                    {availLoading ? (
                      <span className="text-sm text-slate-400 flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Vérification des disponibilités…
                      </span>
                    ) : (
                      <Badge variant={isAvail ? "default" : "destructive"}>
                        {isAvail
                          ? `${places} place${places > 1 ? "s" : ""} disponible${places > 1 ? "s" : ""}`
                          : "Complet — aucune place disponible"}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setDialogStage(null)} className="flex-1">
                      Retour
                    </Button>
                    <Button
                      disabled={!isAvail || availLoading}
                      className="flex-1 gap-2"
                      onClick={() => router.push(`/reserver/stage?${params.toString()}`)}
                    >
                      Choisir ce créneau
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
