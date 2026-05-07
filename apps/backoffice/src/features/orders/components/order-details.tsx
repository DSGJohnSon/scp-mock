"use client";

import { useGetOrderDetails } from "@/features/orders/api/use-get-order-details";
import { useUpdateOrderStatus } from "@/features/orders/api/use-update-order-status";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ChevronLeftIcon,
  CreditCardIcon2,
} from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrencyPrecise as formatCurrency } from "@/lib/formatting";
import { OrderClientCard } from "./order-client-card";
import { OrderPaymentSummary } from "./order-payment-summary";
import { OrderItemsSection, type OrderItemEntry } from "./order-items-section";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Acompte payé",
  PARTIALLY_PAID: "Acompte payé",
  FULLY_PAID: "Entièrement payée",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

const STATUS_VARIANT: Record<string, string> = {
  PAID: "bg-green-100 text-green-800 border-green-200",
  PARTIALLY_PAID: "bg-blue-100 text-blue-800 border-blue-200",
  FULLY_PAID: "bg-green-200 text-green-900 border-green-300",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CARD: "Carte bancaire",
  BANK_TRANSFER: "Virement",
  CASH: "Espèces",
  CHECK: "Chèque",
};

const editableStatuses = ["PENDING", "PAID", "CONFIRMED", "CANCELLED", "REFUNDED"] as const;
type EditableStatus = (typeof editableStatuses)[number];

// ─── Composant orchestrateur ──────────────────────────────────────────────────

interface OrderDetailsProps {
  id: string;
}

export function OrderDetails({ id }: OrderDetailsProps) {
  const router = useRouter();
  const { data: order, isLoading, error } = useGetOrderDetails(id);
  const updateStatus = useUpdateOrderStatus();

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<EditableStatus>("CONFIRMED");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="p-0 h-auto hover:bg-transparent">
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Retour aux commandes
        </Button>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            Commande introuvable
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Payment calculations ──────────────────────────────────────
  const totalOnlinePaid = order.payments
    .filter((p: any) => p.status === "SUCCEEDED" && !p.isManual && p.paymentType !== "GIFT_VOUCHER")
    .reduce((s: number, p: any) => s + p.amount, 0);

  const totalManualPaid = order.payments
    .filter((p: any) => p.status === "SUCCEEDED" && p.isManual)
    .reduce((s: number, p: any) => s + p.amount, 0);

  const totalGiftVoucherCovered = order.payments
    .filter((p: any) => p.status === "SUCCEEDED" && p.paymentType === "GIFT_VOUCHER")
    .reduce((s: number, p: any) => s + p.amount, 0);

  const promoDiscountAmount = order.promoDiscountAmount ?? 0;
  const promoCode = order.promoCode?.code as string | undefined;

  const totalRemaining = order.orderItems.reduce((sum: number, item: any) => {
    if (item.isFullyPaid) return sum;
    const itemAllocations: any[] = item.paymentAllocations ?? [];
    const itemPaid = itemAllocations
      .filter((a: any) => a.payment?.status === "SUCCEEDED")
      .reduce((s: number, a: any) => s + a.allocatedAmount, 0);
    const promoShare = (item.discountAmount as number) ?? 0;
    const finalDiscount = (item.finalDiscountAmount as number) ?? 0;
    return sum + Math.max(0, item.totalPrice - itemPaid - promoShare - finalDiscount);
  }, 0);

  const isFullyPaid = order.status === "FULLY_PAID" || totalRemaining === 0;

  const handleStatusUpdate = () => {
    updateStatus.mutate(
      { param: { id: order.id }, json: { status: newStatus } },
      { onSettled: () => setStatusDialogOpen(false) },
    );
  };

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
            <span className="text-sm">Retour aux commandes</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Commande #{order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            Créée le {format(new Date(order.createdAt), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${
              STATUS_VARIANT[order.status] ?? "bg-gray-100 text-gray-800"
            }`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewStatus(order.status as EditableStatus);
              setStatusDialogOpen(true);
            }}
          >
            Changer le statut
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <OrderClientCard client={order.client} />
        <OrderPaymentSummary
          subtotal={order.subtotal}
          promoDiscountAmount={promoDiscountAmount}
          promoCode={promoCode}
          totalGiftVoucherCovered={totalGiftVoucherCovered}
          totalOnlinePaid={totalOnlinePaid}
          totalManualPaid={totalManualPaid}
          totalRemaining={totalRemaining}
          isFullyPaid={isFullyPaid}
        />
      </div>

      <OrderItemsSection items={order.orderItems as OrderItemEntry[]} />

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCardIcon2 className="h-5 w-5" />
            Historique des paiements
          </CardTitle>
          <CardDescription>
            {order.payments.filter((p: any) => p.status === "SUCCEEDED").length} paiement(s) réussi(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {order.payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Aucun paiement enregistré</p>
          ) : (
            <div className="space-y-3">
              {order.payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          payment.status === "SUCCEEDED"
                            ? "default"
                            : payment.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {payment.status === "SUCCEEDED"
                          ? "Réussi"
                          : payment.status === "PENDING"
                            ? "En attente"
                            : "Échoué"}
                      </Badge>
                      {payment.isManual && (
                        <Badge variant="outline" className="text-xs">
                          {PAYMENT_METHOD_LABELS[payment.manualPaymentMethod] ?? payment.manualPaymentMethod}
                        </Badge>
                      )}
                      {!payment.isManual && (
                        <Badge variant="outline" className="text-xs">Stripe</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(payment.createdAt), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                      </span>
                    </div>
                    {payment.stripePaymentIntentId && (
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                        {payment.stripePaymentIntentId}
                      </p>
                    )}
                    {payment.isManual && payment.recordedByUser && (
                      <p className="text-xs text-muted-foreground">
                        Enregistré par {payment.recordedByUser.name}
                      </p>
                    )}
                    {payment.manualPaymentNote && (
                      <p className="text-xs text-muted-foreground italic">
                        {payment.manualPaymentNote}
                      </p>
                    )}
                  </div>
                  <p className="text-xl font-bold shrink-0">{formatCurrency(payment.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Changer le statut</DialogTitle>
            <DialogDescription>Commande #{order.orderNumber}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="status">Nouveau statut</Label>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as EditableStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {editableStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={updateStatus.isPending || newStatus === order.status}
            >
              {updateStatus.isPending ? "Enregistrement..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
