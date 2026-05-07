"use client";

import { Separator } from "@/components/ui/separator";
import { ShoppingCart } from "lucide-react";
import type { PaymentOrder } from "@/hooks/usePaymentOrder";

interface OrderRecapProps {
  order: PaymentOrder;
  todayAmount: number;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function OrderRecap({ order, todayAmount }: OrderRecapProps) {
  return (
    <div className="space-y-4 lg:sticky lg:top-6 h-fit">
      {/* Résumé commande */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
        <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-gray-400" />
          Récapitulatif
        </h3>

        {/* Lignes articles */}
        <div className="space-y-2">
          {order.orderItems
            ?.filter((item: any) => !item.participantData?.usedGiftVoucherCode)
            .map((item: any, index: number) => {
              const name = `${item.participantData?.firstName || ""} ${item.participantData?.lastName || ""}`.trim();
              const promoShare = item.discountAmount ?? 0;
              let label = "";
              let amount = 0;

              if (item.type === "STAGE" && item.stage) {
                label = `Acompte — Stage ${item.stage.type} · ${formatDate(item.stage.startDate)}`;
                amount =
                  item.effectiveDepositAmount ??
                  item.stage.acomptePrice ??
                  Math.round(item.stage.price * 0.33);
              }

              return (
                <div key={index} className="space-y-0.5">
                  <div className="flex justify-between text-xs text-gray-600">
                    <div className="truncate mr-2">
                      <p className="leading-tight">{label}</p>
                      <p className="text-gray-400">{name}</p>
                    </div>
                    <span className="font-medium whitespace-nowrap">
                      {amount.toFixed(2)}€
                    </span>
                  </div>
                  {promoShare > 0 && (
                    <div className="flex justify-between text-xs text-green-600 pl-2">
                      <span>Réduction code promo</span>
                      <span>-{promoShare.toFixed(2)}€</span>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        <Separator />

        <div className="flex justify-between items-baseline">
          <p className="font-bold text-gray-900 text-sm">
            À payer aujourd&apos;hui
          </p>
          <span className="text-xl font-bold text-blue-600">
            {todayAmount.toFixed(2)}€
          </span>
        </div>
      </div>

      {/* Bloc info acompte / solde */}
      {order.remainingAmount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <span className="text-amber-500 text-base leading-none mt-0.5">
              ℹ️
            </span>
            <div className="space-y-1.5 text-xs text-amber-900">
              <p>
                <strong>Acompte de {todayAmount.toFixed(2)}€</strong> à régler
                maintenant pour confirmer votre réservation.
              </p>
              <p>
                Le solde de{" "}
                <strong>{order.remainingAmount.toFixed(2)}€</strong> sera
                réglé directement sur place le jour de votre activité.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Signaux de confiance */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <span>🔒 Paiement sécurisé SSL</span>
        <span>•</span>
        <span>Stripe</span>
      </div>
    </div>
  );
}
