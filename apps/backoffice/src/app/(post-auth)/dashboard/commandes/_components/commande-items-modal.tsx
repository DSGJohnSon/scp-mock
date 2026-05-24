"use client";

import { Badge } from "@/components/ui/badge";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrencyPrecise as formatCurrency } from "@/lib/formatting";
import type { AppOrder, AppOrderItem } from "../_types";
import { ITEM_TYPE_LABELS } from "../_types";

interface CommandeItemsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: AppOrder | null;
}

function itemDescription(item: AppOrderItem): string {
  if (item.type === "STAGE" && item.stage) {
    return `Stage ${item.stage.type} — ${format(item.stage.startDate, "dd MMM yyyy", { locale: fr })}`;
  }
  if (item.type === "BAPTEME") return "Baptême";
  if (item.type === "GIFT_VOUCHER") return "Bon cadeau";
  return item.type;
}

export function CommandeItemsModal({ open, onOpenChange, order }: CommandeItemsModalProps) {
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={order ? `Produits · #${order.orderNumber}` : "Produits"}
    >
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Produits</h2>
          {order && (
            <p className="text-sm text-muted-foreground">Commande #{order.orderNumber}</p>
          )}
        </div>

        {!order || order.orderItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucun produit dans cette commande
          </p>
        ) : (
          <div className="space-y-3">
            {order.orderItems.map((item) => {
              const participant = item.stageBooking?.stagiaire;
              const remaining = item.isFullyPaid
                ? 0
                : Math.max(0, item.totalPrice - (item.discountAmount ?? 0) - (item.finalDiscountAmount ?? 0));

              return (
                <div key={item.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {ITEM_TYPE_LABELS[item.type] ?? item.type}
                        </Badge>
                        <span className="text-sm font-medium">{itemDescription(item)}</span>
                      </div>
                      {participant && (
                        <p className="text-xs text-muted-foreground">
                          {participant.firstName} {participant.lastName}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-sm shrink-0">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>

                  <div className="flex items-center justify-end">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        item.isFullyPaid
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {item.isFullyPaid ? "Soldé" : `Reste : ${formatCurrency(remaining)}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
}
