"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { Badge } from "@/components/ui/badge";
import { MailIcon, PhoneIcon, MapPinIcon2, ShoppingCartIcon } from "@/lib/icons";
import { AppClient, OrderStatus } from "../_types";

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  PAID: "Payé",
  PARTIALLY_PAID: "Partiellement payé",
  FULLY_PAID: "Payé intégralement",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  REFUNDED: "Remboursé",
};

const ORDER_STATUS_CLASSES: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PAID: "bg-green-100 text-green-800 border-green-200",
  PARTIALLY_PAID: "bg-blue-100 text-blue-800 border-blue-200",
  FULLY_PAID: "bg-green-100 text-green-800 border-green-200",
  CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  REFUNDED: "bg-slate-100 text-slate-700 border-slate-200",
};

interface ClientDetailModalProps {
  client: AppClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientDetailModal({
  client,
  open,
  onOpenChange,
}: ClientDetailModalProps) {
  if (!client) return null;

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={`${client.firstName} ${client.lastName}`}
    >
      {/* ── Header identité ──────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100 space-y-3">
        <div>
          <h2 className="text-lg font-semibold">
            {client.firstName} {client.lastName}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Client depuis le{" "}
            {format(new Date(client.createdAt), "d MMMM yyyy", { locale: fr })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MailIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{client.email || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <PhoneIcon className="h-4 w-4 shrink-0" />
            <span>{client.phone || "—"}</span>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
            <MapPinIcon2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              {client.address}, {client.postalCode} {client.city},{" "}
              {client.country}
            </span>
          </div>
        </div>
      </div>

      {/* ── Commandes ────────────────────────────────────────────────────── */}
      <div className="px-6 py-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <ShoppingCartIcon className="h-4 w-4" />
          Commandes ({client.orders.length})
        </h3>

        {client.orders.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            Aucune commande enregistrée
          </p>
        ) : (
          <div className="space-y-2">
            {client.orders
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-800">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(order.createdAt), "d MMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {order.totalAmount.toFixed(2)} €
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${ORDER_STATUS_CLASSES[order.status]}`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
}
