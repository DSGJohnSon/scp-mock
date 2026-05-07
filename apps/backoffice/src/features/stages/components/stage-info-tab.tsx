"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PlusIcon, MinusIcon, TagIcon } from "@/lib/icons";
import { EditedStageState, StageWithDetails, TypeConfig } from "./stage-types";

interface StageInfoTabProps {
  displayStage: StageWithDetails;
  isEditing: boolean;
  editedStage: EditedStageState | null;
  currentBookingsCount: number;
  currentPlaces: number;
  currentRestantes: number;
  hasActivePromotion: boolean;
  discountPct: number;
  cfg: TypeConfig;
  endDate: Date;
  onIncreasePlaces: () => void;
  onDecreasePlaces: () => void;
  onEditedStageChange: (updated: EditedStageState) => void;
}

export function StageInfoTab({
  displayStage,
  isEditing,
  editedStage,
  currentBookingsCount,
  currentPlaces,
  currentRestantes,
  hasActivePromotion,
  discountPct,
  cfg,
  endDate,
  onIncreasePlaces,
  onDecreasePlaces,
  onEditedStageChange,
}: StageInfoTabProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Carte Dates */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dates</h3>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Début</span>
            <span className="font-medium text-slate-800">
              {format(new Date(displayStage.startDate), "dd/MM/yyyy", { locale: fr })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fin</span>
            <span className="font-medium text-slate-800">
              {format(endDate, "dd/MM/yyyy", { locale: fr })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Durée</span>
            <span className="font-medium text-slate-800">
              {displayStage.duration} jour{displayStage.duration > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Carte Places */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Places</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Total</span>
            {isEditing && editedStage ? (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDecreasePlaces}
                  disabled={editedStage.places <= currentBookingsCount}
                  className="h-7 w-7 p-0"
                >
                  <MinusIcon className="h-3.5 w-3.5" />
                </Button>
                <span className="w-7 text-center font-semibold">{editedStage.places}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onIncreasePlaces}
                  className="h-7 w-7 p-0"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <span className="font-medium text-slate-800">{currentPlaces}</span>
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Réservées</span>
            <span className="font-medium text-slate-800">{currentBookingsCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Restantes</span>
            <span className={`font-semibold ${currentRestantes > 0 ? "text-green-600" : "text-red-600"}`}>
              {currentRestantes}
            </span>
          </div>
          <div className="pt-1">
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (currentBookingsCount / currentPlaces) * 100)}%`,
                  backgroundColor: currentRestantes <= 2 ? "#dc2626" : cfg.hex,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Carte Prix */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tarifs</h3>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Prix total</span>
            {isEditing && editedStage ? (
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={editedStage.price}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    const acomptePrice = Math.round(price * 0.4 * 100) / 100;
                    onEditedStageChange({ ...editedStage, price, acomptePrice });
                  }}
                  className="w-20 h-7 text-right"
                  min="0"
                  step="0.01"
                />
                <span className="text-slate-500">€</span>
              </div>
            ) : hasActivePromotion ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-600">{displayStage.price}€</span>
                <span className="line-through text-slate-400 text-xs">
                  {displayStage.promotionOriginalPrice}€
                </span>
                <Badge className="bg-red-100 text-red-700 text-[10px] px-1 py-0">
                  -{discountPct}%
                </Badge>
              </div>
            ) : (
              <span className="font-semibold text-slate-800">{displayStage.price}€</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Acompte (40%)</span>
            {isEditing && editedStage ? (
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={editedStage.acomptePrice}
                  onChange={(e) =>
                    onEditedStageChange({
                      ...editedStage,
                      acomptePrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-20 h-7 text-right"
                  min="0"
                  step="0.01"
                />
                <span className="text-slate-500">€</span>
              </div>
            ) : (
              <span className="font-medium text-slate-800">{displayStage.acomptePrice}€</span>
            )}
          </div>
        </div>
      </div>

      {/* Carte Promotion (si active) */}
      {hasActivePromotion && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
          <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wide flex items-center gap-1.5">
            <TagIcon className="h-3.5 w-3.5" />
            Promotion active
          </h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-red-400">Prix original</span>
              <span className="font-medium text-slate-700 line-through">
                {displayStage.promotionOriginalPrice}€
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-400">Réduction</span>
              <span className="font-bold text-red-600">-{discountPct}%</span>
            </div>
            {displayStage.promotionEndDate && (
              <div className="flex justify-between">
                <span className="text-red-400">Expire le</span>
                <span className="font-medium text-slate-700">
                  {format(new Date(displayStage.promotionEndDate), "dd/MM/yyyy", { locale: fr })}
                </span>
              </div>
            )}
            {displayStage.promotionReason && (
              <p className="text-xs text-red-500 italic mt-1">
                &ldquo;{displayStage.promotionReason}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
