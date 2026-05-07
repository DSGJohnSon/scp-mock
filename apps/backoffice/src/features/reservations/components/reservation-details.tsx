"use client";

import { useState } from "react";
import { useGetReservationDetails } from "@/features/reservations/api/use-get-reservation-details";
import { PaymentDialog } from "@/features/reservations/components/payment-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeftIcon } from "@/lib/icons";
import { useRouter } from "next/navigation";
import { getBadgeVariant, getStatusLabel } from "./reservation-utils";
import { ReservationPaymentHistory, type PaymentEntry } from "./reservation-payment-history";
import { ReservationBookingInfo } from "./reservation-booking-info";

interface ReservationDetailsProps {
  id: string;
}

export function ReservationDetails({ id }: ReservationDetailsProps) {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useGetReservationDetails(id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              Erreur lors du chargement de la réservation
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { type, booking, availablePlaces } = data;
  const isStage = type === "STAGE";
  const stagiaire = booking.stagiaire;
  const orderItem = booking.orderItem;

  const order = orderItem?.order;
  const client = order?.client;

  const paymentAllocations = orderItem?.paymentAllocations ?? [];

  const activity = isStage ? booking.stage : (booking.bapteme ?? booking.stage);
  const activityDate = (isStage ? activity.startDate : activity.date) ?? "";
  const moniteurs = activity.moniteurs || [];
  const bookingCategory = isStage ? booking.type : (booking.category ?? "");
  const hasVideo = !isStage && (booking.hasVideo ?? false);

  const totalPrice = orderItem?.totalPrice || 0;
  const depositAmount = orderItem?.depositAmount || 0;
  const isFullyPaid = orderItem?.isFullyPaid || false;
  const hasDeposit = depositAmount > 0;
  void hasDeposit;
  const promoCodeUsed = order?.promoCode?.code as string | undefined;
  const usedGiftVoucher = orderItem?.usedGiftVoucher as { code: string } | null | undefined;
  const itemPromoDiscount = (orderItem?.discountAmount as number) ?? 0;
  const finalDiscountAmount = (orderItem?.finalDiscountAmount as number) ?? 0;
  const finalDiscountNote = (orderItem?.finalDiscountNote as string | undefined) ?? undefined;
  const finalDiscountDate = orderItem?.finalDiscountDate
    ? new Date(orderItem.finalDiscountDate as string)
    : null;

  const totalOnlinePaid = paymentAllocations.reduce((sum: number, allocation) => {
    if (allocation.payment?.status === "SUCCEEDED" && !allocation.payment?.isManual) {
      return sum + allocation.allocatedAmount;
    }
    return sum;
  }, 0);

  const totalManualPaid = paymentAllocations.reduce((sum: number, allocation) => {
    if (allocation.payment?.status === "SUCCEEDED" && allocation.payment?.isManual) {
      return sum + allocation.allocatedAmount;
    }
    return sum;
  }, 0);

  const totalPaidAmount = totalOnlinePaid + totalManualPaid;

  const dynamicRemainingAmount = Math.max(
    0,
    totalPrice - itemPromoDiscount - totalPaidAmount - finalDiscountAmount,
  );

  const depositAllocation = paymentAllocations.find((a) => a.payment?.status === "SUCCEEDED");
  const depositDate = depositAllocation?.payment
    ? new Date(depositAllocation.payment.createdAt as string)
    : null;

  const payments = paymentAllocations.map((allocation) => ({
    ...allocation.payment,
    allocatedAmount: allocation.allocatedAmount,
    allocationId: allocation.id,
  })) as PaymentEntry[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2 p-0 h-auto hover:bg-transparent -ml-1"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">Retour aux réservations</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Détails de la réservation
          </h1>
          <p className="text-sm text-muted-foreground">
            {isStage ? "Stage" : "Baptême"} - Commande #{order?.orderNumber}
          </p>
        </div>
        <Badge
          variant={getBadgeVariant(order?.status || "")}
          className="text-base sm:text-lg px-4 py-2 w-fit"
        >
          {getStatusLabel(order?.status || "")}
        </Badge>
      </div>

      <ReservationPaymentHistory
        isFullyPaid={isFullyPaid}
        dynamicRemainingAmount={dynamicRemainingAmount}
        totalPrice={totalPrice}
        hasVideo={hasVideo}
        isStage={isStage}
        itemPromoDiscount={itemPromoDiscount}
        usedGiftVoucher={usedGiftVoucher}
        promoCodeUsed={promoCodeUsed}
        totalOnlinePaid={totalOnlinePaid}
        depositDate={depositDate}
        finalDiscountAmount={finalDiscountAmount}
        finalDiscountNote={finalDiscountNote}
        finalDiscountDate={finalDiscountDate}
        totalManualPaid={totalManualPaid}
        finalPaymentDate={orderItem?.finalPaymentDate as string | null | undefined}
        finalPaymentNote={orderItem?.finalPaymentNote as string | null | undefined}
        payments={payments}
        onRegisterPayment={() => setIsDialogOpen(true)}
      />

      <ReservationBookingInfo
        stagiaire={stagiaire}
        client={client}
        isStage={isStage}
        activityDate={activityDate}
        activity={activity}
        bookingCategory={bookingCategory}
        hasVideo={hasVideo}
        availablePlaces={availablePlaces}
        moniteurs={moniteurs}
      />

      {orderItem?.id && (
        <PaymentDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          orderItemId={orderItem.id as string}
          remainingAmount={dynamicRemainingAmount}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
