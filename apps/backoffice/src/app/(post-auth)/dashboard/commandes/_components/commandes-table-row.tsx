"use client";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { FileTextIcon, CreditCardIcon2 } from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrencyPrecise as formatCurrency } from "@/lib/formatting";
import type { AppOrder } from "../_types";
import { STATUS_LABELS, STATUS_COLORS } from "../_types";

interface CommandesTableRowProps {
  order: AppOrder;
  onOpenItems: (order: AppOrder) => void;
  onOpenPayments: (order: AppOrder) => void;
}

export function CommandesTableRow({ order, onOpenItems, onOpenPayments }: CommandesTableRowProps) {
  const totalPaid = order.payments
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((sum, p) => sum + p.amount, 0);

  const total = order.totalAmount - (order.promoDiscountAmount ?? 0);
  const statusColor = STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-800 border-gray-200";
  const statusLabel = STATUS_LABELS[order.status] ?? order.status;

  return (
    <TableRow>
      <TableCell className="font-mono font-medium">{order.orderNumber}</TableCell>

      <TableCell>
        {order.client ? (
          <div className="flex flex-col">
            <span className="font-medium">
              {order.client.firstName} {order.client.lastName}
            </span>
            <span className="text-xs text-muted-foreground">{order.client.email}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell>{format(order.createdAt, "dd/MM/yyyy", { locale: fr })}</TableCell>

      <TableCell>
        <div className="flex flex-col">
          <span className="font-semibold">{formatCurrency(total)}</span>
          {totalPaid > 0 && (
            <span className="text-xs text-muted-foreground">
              payé : {formatCurrency(totalPaid)}
            </span>
          )}
        </div>
      </TableCell>

      <TableCell>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}
        >
          {statusLabel}
        </span>
      </TableCell>

      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          title="Voir les produits"
          onClick={() => onOpenItems(order)}
        >
          <FileTextIcon className="size-4" />
          <span className="sr-only">Produits</span>
        </Button>
      </TableCell>

      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          title="Voir les paiements"
          onClick={() => onOpenPayments(order)}
        >
          <CreditCardIcon2 className="size-4" />
          <span className="sr-only">Paiements</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}
