"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import type { CartItem } from "@/lib/types/cart";

export function ReservationTimer({
  cartItems,
  compact = false,
}: {
  cartItems: CartItem[];
  compact?: boolean;
}) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tempItems = cartItems.filter(
      (item) => item.type === "STAGE" && item.expiresAt,
    );

    if (tempItems.length === 0) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const earliestExpiry = tempItems.reduce((earliest, item) => {
        const itemExpiry = new Date(item.expiresAt!).getTime();
        return itemExpiry < earliest ? itemExpiry : earliest;
      }, new Date(tempItems[0].expiresAt!).getTime());

      const remaining = earliestExpiry - now;
      setTimeRemaining(remaining > 0 ? remaining : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [cartItems]);

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (timeRemaining === null) return null;

  const isUrgent = timeRemaining < 300000;

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <Clock className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="font-bold text-orange-900 text-sm mb-1">
              Places temporairement bloquées
            </p>
            <p className="text-xs text-orange-800">
              Finalisez votre paiement rapidement. Temps restant :{" "}
              <span
                className={`font-bold ${
                  isUrgent ? "text-red-700" : "text-orange-900"
                }`}
              >
                {formatTimeRemaining(timeRemaining)}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-orange-100 rounded-full">
          <Clock className="w-8 h-8 text-orange-600 animate-pulse" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-orange-900 text-lg mb-2">
            Places temporairement bloquées
          </h3>
          <p className="text-sm text-orange-800 mb-2">
            Vos places sont réservées temporairement. Finalisez votre paiement
            rapidement pour confirmer vos réservations.
          </p>
          <div className="inline-flex items-center gap-2">
            <span className="text-sm text-orange-800 flex items-center gap-2 border-l-2 border-orange-400 pl-3">
              Temps restant :{" "}
              <span
                className={`font-bold text-lg ${
                  isUrgent ? "text-red-700" : "text-orange-900"
                }`}
              >
                {formatTimeRemaining(timeRemaining)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
