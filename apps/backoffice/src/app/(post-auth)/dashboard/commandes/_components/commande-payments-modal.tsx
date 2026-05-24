"use client";

import { Badge } from "@/components/ui/badge";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrencyPrecise as formatCurrency } from "@/lib/formatting";
import type { AppOrder } from "../_types";
import { PAYMENT_METHOD_LABELS } from "../_types";

interface CommandePaymentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: AppOrder | null;
}

export function CommandePaymentsModal({ open, onOpenChange, order }: CommandePaymentsModalProps) {
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={order ? `Paiements · #${order.orderNumber}` : "Paiements"}
    >
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Paiements</h2>
          {order && (
            <p className="text-sm text-muted-foreground">Commande #{order.orderNumber}</p>
          )}
        </div>

        {!order || order.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucun paiement enregistré
          </p>
        ) : (
          <div className="space-y-3">
            {order.payments.map((payment) => (
              <div
                key={payment.id}
                className="border rounded-lg p-4 flex items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
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

                    <Badge variant="outline" className="text-xs">
                      {payment.isManual
                        ? (PAYMENT_METHOD_LABELS[payment.manualPaymentMethod ?? ""] ?? payment.manualPaymentMethod ?? "Manuel")
                        : "Stripe"}
                    </Badge>

                    <span className="text-xs text-muted-foreground">
                      {format(payment.createdAt, "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                    </span>
                  </div>

                  {payment.manualPaymentNote && (
                    <p className="text-xs text-muted-foreground italic">
                      {payment.manualPaymentNote}
                    </p>
                  )}
                </div>

                <span className="font-bold text-base shrink-0">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
}
