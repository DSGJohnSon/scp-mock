"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ExternalLinkIcon } from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrencyPrecise } from "@/lib/formatting";
import type { AppReservationListItem } from "../_types";

const STAGE_TYPE_LABELS: Record<string, string> = {
  INITIATION: "Initiation",
  PROGRESSION: "Progression",
  AUTONOMIE: "Autonomie",
};

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
  FULLY_PAID: "bg-green-700 text-white border-transparent hover:bg-green-700",
  PAID: "bg-green-500 text-white border-transparent hover:bg-green-500",
  PARTIALLY_PAID: "bg-orange-500 text-white border-transparent hover:bg-orange-500",
  CONFIRMED: "bg-blue-500 text-white border-transparent hover:bg-blue-500",
  PENDING: "bg-yellow-500 text-white border-transparent hover:bg-yellow-500",
  CANCELLED: "bg-red-500 text-white border-transparent hover:bg-red-500",
  REFUNDED: "bg-gray-500 text-white border-transparent hover:bg-gray-500",
};

interface ReservationsTableRowProps {
  reservation: AppReservationListItem;
  onClick: () => void;
}

export function ReservationsTableRow({ reservation, onClick }: ReservationsTableRowProps) {
  const { stagiaire, stage, orderItem, status, createdAt } = reservation;
  const order = orderItem?.order;

  const isCancelled = status === "CANCELLED";
  const isNew =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60) < 12;

  const effectiveTotal = (orderItem?.totalPrice ?? 0) - (orderItem?.discountAmount ?? 0);
  const paid = effectiveTotal - (orderItem?.remainingAmount ?? 0);

  return (
    <TableRow
      onClick={onClick}
      className={`cursor-pointer hover:bg-muted/50 ${isCancelled ? "opacity-60" : ""}`}
    >
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm">{format(new Date(createdAt), "dd/MM/yyyy", { locale: fr })}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(createdAt), "HH'h'mm", { locale: fr })}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-medium">
              {stagiaire.firstName} {stagiaire.lastName}
            </span>
            <span className="text-xs text-muted-foreground">{stagiaire.email}</span>
          </div>
          {isNew && !isCancelled && (
            <span className="size-2 rounded-full bg-green-500 shrink-0" />
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">
            {format(new Date(stage.startDate), "dd/MM/yyyy", { locale: fr })}
          </span>
          <span className="text-xs text-muted-foreground">
            {STAGE_TYPE_LABELS[stage.type] ?? stage.type}
          </span>
        </div>
      </TableCell>

      <TableCell>
        {isCancelled ? (
          <Badge className="bg-red-500 text-white border-transparent">Annulée</Badge>
        ) : (
          <Badge
            variant="secondary"
            className={ORDER_STATUS_CLASSES[order?.status ?? ""] ?? ""}
          >
            {ORDER_STATUS_LABELS[order?.status ?? ""] ?? order?.status}
          </Badge>
        )}
      </TableCell>

      <TableCell className="text-muted-foreground text-sm">
        {order ? `#${order.orderNumber}` : "—"}
      </TableCell>

      <TableCell className="text-right">
        {orderItem && !isCancelled ? (
          <div className="flex flex-col items-end">
            <span className="font-medium text-green-600">
              {formatCurrencyPrecise(paid)}
            </span>
            {!orderItem.isFullyPaid && (orderItem.remainingAmount ?? 0) > 0 && (
              <span className="text-xs text-orange-600">
                Reste : {formatCurrencyPrecise(orderItem.remainingAmount ?? 0)}
              </span>
            )}
            {orderItem.isFullyPaid && (
              <span className="text-xs text-green-600">✓ Soldé</span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          {orderItem && !isCancelled ? (
            <span className="font-medium">{formatCurrencyPrecise(effectiveTotal)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
          <ExternalLinkIcon className="size-4 text-muted-foreground" />
        </div>
      </TableCell>
    </TableRow>
  );
}
