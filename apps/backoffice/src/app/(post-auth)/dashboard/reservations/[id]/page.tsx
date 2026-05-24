"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshIcon, ChevronLeftIcon, XCircleIcon } from "@/lib/icons";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { useGetReservationDetails } from "@/features/reservations/api/use-get-reservation-details";
import { ReservationStagiaireCard } from "../_components/(detail)/reservation-stagiaire-card";
import { ReservationStageCard } from "../_components/(detail)/reservation-stage-card";
import { ReservationPaymentSection } from "../_components/(detail)/reservation-payment-section";
import { ReservationCancelDialog } from "../_components/(detail)/reservation-cancel-dialog";
import { ReservationPaymentForm } from "../_components/(forms)/reservation-payment-form";
import type { PaymentEntry } from "../_components/(detail)/reservation-payment-section";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PAID: "Payé",
  PARTIALLY_PAID: "Acompte payé",
  FULLY_PAID: "Entièrement payé",
  CONFIRMED: "Confirmé",
  PENDING: "En attente",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

const ORDER_STATUS_CLASSES: Record<string, string> = {
  FULLY_PAID: "bg-green-700 text-white border-transparent",
  PAID: "bg-green-500 text-white border-transparent",
  PARTIALLY_PAID: "bg-orange-500 text-white border-transparent",
  CONFIRMED: "bg-blue-500 text-white border-transparent",
  PENDING: "bg-yellow-500 text-white border-transparent",
  CANCELLED: "bg-red-500 text-white border-transparent",
  REFUNDED: "bg-gray-500 text-white border-transparent",
};

export default function ReservationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGetReservationDetails(params.id);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <p className="text-sm text-muted-foreground animate-pulse">
          Chargement de la réservation…
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-32">
        <p className="text-sm text-muted-foreground">
          Impossible de charger cette réservation.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshIcon className="size-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  const { booking, availablePlaces } = data;
  const { stagiaire, stage, orderItem } = booking;
  const order = orderItem?.order;
  const client = order?.client;
  const isCancelled = booking.status === "CANCELLED";

  const paymentAllocations = orderItem?.paymentAllocations ?? [];

  const totalOnlinePaid = paymentAllocations.reduce((sum, a) => {
    if (a.payment.status === "SUCCEEDED" && !a.payment.isManual) {
      return sum + a.allocatedAmount;
    }
    return sum;
  }, 0);

  const totalManualPaid = paymentAllocations.reduce((sum, a) => {
    if (a.payment.status === "SUCCEEDED" && a.payment.isManual) {
      return sum + a.allocatedAmount;
    }
    return sum;
  }, 0);

  const totalPaid = totalOnlinePaid + totalManualPaid;
  const promoDiscount = orderItem?.discountAmount ?? 0;
  const remainingAmount = Math.max(
    0,
    (orderItem?.totalPrice ?? 0) - promoDiscount - totalPaid,
  );

  const payments: PaymentEntry[] = paymentAllocations.map((a) => ({
    id: a.payment.id,
    status: a.payment.status,
    isManual: a.payment.isManual,
    amount: a.payment.amount,
    currency: a.payment.currency,
    createdAt: a.payment.createdAt,
    allocatedAmount: a.allocatedAmount,
    stripePaymentIntentId: a.payment.stripePaymentIntentId,
    manualPaymentMethod: a.payment.manualPaymentMethod,
    manualPaymentNote: a.payment.manualPaymentNote,
    recordedByUser: a.payment.recordedByUser,
  }));

  const statusKey = isCancelled ? "CANCELLED" : (order?.status ?? "");

  return (
    <main className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/reservations")}
            className="p-0 h-auto hover:bg-transparent -ml-1 mb-1"
          >
            <ChevronLeftIcon className="size-4 mr-1" />
            <span className="text-sm">Retour aux réservations</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Réservation de {stagiaire.firstName} {stagiaire.lastName}
          </h1>
          {order && (
            <p className="text-sm text-muted-foreground">Commande #{order.orderNumber}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            className={`text-sm px-3 py-1 ${ORDER_STATUS_CLASSES[statusKey] ?? ""}`}
          >
            {ORDER_STATUS_LABELS[statusKey] ?? statusKey}
          </Badge>
          {!isCancelled && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelOpen(true)}
              className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
            >
              <XCircleIcon className="size-4 mr-1.5" />
              Annuler
            </Button>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ReservationStagiaireCard stagiaire={stagiaire} client={client} />
        <ReservationStageCard
          stage={stage}
          bookingType={booking.type}
          availablePlaces={availablePlaces}
          orderNumber={order?.orderNumber}
          orderId={order?.id}
        />
      </div>

      {orderItem && !isCancelled && (
        <ReservationPaymentSection
          totalPrice={orderItem.totalPrice}
          promoDiscount={promoDiscount}
          promoCode={order?.promoCode?.code}
          giftVoucher={orderItem.usedGiftVoucher}
          totalOnlinePaid={totalOnlinePaid}
          totalManualPaid={totalManualPaid}
          remainingAmount={remainingAmount}
          isFullyPaid={orderItem.isFullyPaid}
          payments={payments}
          orderItemId={orderItem.id}
          onAddPayment={() => setIsPaymentOpen(true)}
        />
      )}

      {/* Modals */}
      <ResponsiveModal
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        title="Enregistrer un paiement"
        description={`Solde restant : ${remainingAmount.toFixed(2)} €`}
      >
        {orderItem && (
          <ReservationPaymentForm
            orderItemId={orderItem.id}
            remainingAmount={remainingAmount}
            onSuccess={() => {
              setIsPaymentOpen(false);
              refetch();
            }}
          />
        )}
      </ResponsiveModal>

      <ReservationCancelDialog
        reservationId={params.id}
        stagiaireName={`${stagiaire.firstName} ${stagiaire.lastName}`}
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        onCancelled={() => refetch()}
      />
    </main>
  );
}

export const fetchCache = "force-no-store";
