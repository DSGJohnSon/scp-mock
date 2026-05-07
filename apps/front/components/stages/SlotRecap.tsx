"use client";

import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Stage {
  id: string;
  startDate: string;
  duration: number;
  places: number;
  price: number;
  acomptePrice?: number | null;
  type: string;
  promotionOriginalPrice?: number | null;
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface SlotRecapProps {
  slot: Stage;
  categoryLabel: string;
}

export function SlotRecap({ slot, categoryLabel }: SlotRecapProps) {
  const end = new Date(slot.startDate);
  end.setDate(end.getDate() + slot.duration - 1);
  const isPromo = !!(slot.promotionOriginalPrice && slot.price < slot.promotionOriginalPrice);

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <p className="text-base font-semibold text-blue-600 flex items-center gap-1 mb-2">
            <Check className="w-3.5 h-3.5" /> Créneau sélectionné
          </p>
          <p className="font-bold text-sm">Stage {categoryLabel}</p>
          <p className="font-semibold text-slate-800 text-sm mt-0.5">
            Du {formatDateShort(new Date(slot.startDate))} au {formatDateShort(end)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-3">
            {isPromo && (
              <p className="text-sm text-slate-400 line-through">
                {slot.promotionOriginalPrice}€
              </p>
            )}
            <p className="font-bold text-2xl text-blue-600">{slot.price}€</p>
          </div>
          {slot.acomptePrice && (
            <p className="text-xs text-slate-500">
              Acompte aujourd&apos;hui :{" "}
              <span className="font-semibold text-slate-700">{slot.acomptePrice}€</span>
              {" · "}solde sur place :{" "}
              <span className="font-semibold text-slate-700">
                {slot.price - slot.acomptePrice}€
              </span>
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
