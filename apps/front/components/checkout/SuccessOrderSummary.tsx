"use client";

import { CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getStageDeposit } from "@/lib/pricing";
import type { ConfirmedOrder, OrderItem } from "@/hooks/useOrderConfirmation";

interface SuccessOrderSummaryProps {
  order: ConfirmedOrder;
  totals: {
    depositTotal: number;
    remainingTotal: number;
    futurePayments: { amount: number; date: string; description: string; participantName: string }[];
  };
  formatDate: (d: string) => string;
  formatTime: (d: string) => string;
  formatDateTime: (d: string) => string;
}

export function SuccessOrderSummary({
  order,
  totals,
  formatDate,
  formatTime,
  formatDateTime,
}: SuccessOrderSummaryProps) {
  return (
    <>
      {/* Header succès */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Réservation confirmée !
        </h1>
        <p className="text-gray-500 text-sm">
          {totals.depositTotal === 0
            ? "Votre réservation a été validée grâce à votre bon cadeau"
            : "Votre paiement a été traité avec succès"}
        </p>
      </div>

      {/* Informations commande */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Commande {order.orderNumber}
          </h2>
          <span className="text-xs font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">
            ✓ Confirmée
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Date</p>
            <p className="font-medium">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Heure</p>
            <p className="font-medium">{formatTime(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Email de confirmation</p>
            <p className="font-medium truncate">{order.customerEmail}</p>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-3">
            Informations client
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Nom complet</p>
              <p className="font-medium">
                {order.orderItems?.[0]?.participantData?.firstName || "Non spécifié"}{" "}
                {order.orderItems?.[0]?.participantData?.lastName || ""}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Téléphone</p>
              <p className="font-medium">
                {order.orderItems?.[0]?.participantData?.phone || "Non spécifié"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500 text-xs mb-0.5">Email</p>
              <p className="font-medium">
                {order.orderItems?.[0]?.participantData?.email ||
                  order.customerEmail ||
                  "Non spécifié"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Détail des réservations */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Détail de votre commande</h2>
        <div className="space-y-3">
          {order.orderItems?.map((item: OrderItem) => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-3"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 items-start mb-1">
                    <h4 className="font-semibold text-sm text-gray-900">
                      {item.type === "STAGE"
                        ? `Stage ${item.stage?.type ?? ""} — ${item.stage?.startDate ? formatDate(item.stage.startDate) : "Date non précisée"}`
                        : "Article"}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500">
                    Participant : {item.participantData?.firstName ?? ""}{" "}
                    {item.participantData?.lastName ?? ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400 mb-0.5">Prix total</p>
                  <p className="font-bold text-gray-900">{item.totalPrice}€</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Récapitulatif des paiements */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">
          Récapitulatif des paiements
        </h2>

        {/* Montant payé aujourd'hui */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-green-700 uppercase font-semibold tracking-wide mb-0.5">
                Payé aujourd&apos;hui
              </p>
              {(order.discountAmount ?? 0) > 0 && (
                <p className="text-xs text-green-600 mb-0.5">
                  Code promo appliqué :{" "}
                  <strong>-{(order.discountAmount ?? 0).toFixed(2)}€</strong>
                </p>
              )}
              <p className="text-2xl font-bold text-green-600">
                {totals.depositTotal.toFixed(2)}€
              </p>
              <p className="text-xs text-green-600 mt-1">
                Transaction le {formatDateTime(order.createdAt)}
              </p>
            </div>
            <span className="text-xs font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">
              ✓ Payé
            </span>
          </div>

          {order.orderItems?.some((item: any) => item.type === "STAGE") && (
            <div className="pt-3 border-t border-green-200 space-y-1.5">
              <p className="text-xs font-semibold text-green-800 mb-1">
                Détail des acomptes :
              </p>
              {order.orderItems
                ?.filter((item: OrderItem) => item.type === "STAGE")
                ?.map((item: OrderItem) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-green-700">
                      Acompte stage {item.stage?.type ?? ""} —{" "}
                      {item.participantData?.firstName ?? ""}{" "}
                      {item.participantData?.lastName ?? ""}
                      <span className="block text-green-600">
                        {formatDate(item.stage?.startDate ?? "")}
                      </span>
                    </span>
                    <span className="font-semibold text-green-900">
                      {getStageDeposit(item.stage)}€
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Total général */}
        <div className="flex justify-between items-center pt-1">
          <p className="text-sm font-bold text-gray-900">
            Montant payé aujourd&apos;hui
          </p>
          <span className="text-xl font-bold text-green-600">
            {totals.depositTotal.toFixed(2)}€
          </span>
        </div>
      </div>
    </>
  );
}
