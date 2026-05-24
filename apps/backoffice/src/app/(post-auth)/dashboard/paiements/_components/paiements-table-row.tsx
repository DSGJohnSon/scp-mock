"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import CopyTextComponent from "@/components/shared/copy-text-component";
import { AppPayment, ManualPaymentMethod, StageType } from "../_types";

const paymentMethodLabels: Record<ManualPaymentMethod, string> = {
  CARD: "Carte bancaire",
  BANK_TRANSFER: "Virement bancaire",
  CASH: "Espèces",
  CHECK: "Chèque",
};

const stageTypeLabels: Record<StageType, string> = {
  INITIATION: "Initiation",
  PROGRESSION: "Progression",
  AUTONOMIE: "Autonomie",
  DOUBLE: "Double",
};

const itemTypeLabels = {
  STAGE: "Stage",
  BAPTEME: "Baptême",
};

interface PaiementsTableRowProps {
  payment: AppPayment;
}

export function PaiementsTableRow({ payment }: PaiementsTableRowProps) {
  const isManual = payment.paymentType === "MANUAL" || payment.isManual;
  const isStripe = !isManual;

  return (
    <TableRow>
      {/* Date */}
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">
            {format(payment.createdAt, "dd/MM/yyyy", { locale: fr })}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(payment.createdAt, "HH:mm", { locale: fr })}
          </span>
        </div>
      </TableCell>

      {/* Commande */}
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium font-mono text-sm">
            {payment.order?.orderNumber ?? "—"}
          </span>
          {payment.order?.client && (
            <span className="text-xs text-muted-foreground">
              {payment.order.client.firstName} {payment.order.client.lastName}
            </span>
          )}
        </div>
      </TableCell>

      {/* Type */}
      <TableCell>
        {isStripe ? (
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="w-fit bg-blue-50 text-blue-700 border-blue-200">
              Stripe
            </Badge>
            {payment.stripePaymentIntentId && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground font-mono truncate max-w-[160px]">
                  {payment.stripePaymentIntentId}
                </span>
                <CopyTextComponent text={payment.stripePaymentIntentId} size="sm" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="w-fit">
              Manuel
            </Badge>
            {payment.manualPaymentMethod && (
              <span className="text-xs text-muted-foreground">
                {paymentMethodLabels[payment.manualPaymentMethod]}
              </span>
            )}
            {payment.recordedByUser && (
              <span className="text-xs text-muted-foreground">
                Par&nbsp;: {payment.recordedByUser.name}
              </span>
            )}
          </div>
        )}
      </TableCell>

      {/* Statut */}
      <TableCell>
        {payment.status === "SUCCEEDED" && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 border-none">
            Finalisé
          </Badge>
        )}
        {payment.status === "PENDING" && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">
            En attente
          </Badge>
        )}
        {payment.status === "FAILED" && (
          <Badge variant="destructive">Échoué</Badge>
        )}
        {payment.status === "CANCELLED" && (
          <Badge variant="outline" className="text-gray-500">
            Annulé
          </Badge>
        )}
        {payment.status === "REFUNDED" && (
          <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50">
            Remboursé
          </Badge>
        )}
      </TableCell>

      {/* Montant */}
      <TableCell className="font-medium tabular-nums">
        {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(payment.amount)}
      </TableCell>

      {/* Détails allocations */}
      <TableCell>
        {payment.allocations.length > 0 ? (
          <div className="space-y-1">
            {payment.allocations.map((allocation) => (
              <div key={allocation.id} className="text-xs space-y-0.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {itemTypeLabels[allocation.orderItem.type]}
                  </Badge>
                  <span className="font-medium tabular-nums">
                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(allocation.allocatedAmount)}
                  </span>
                </div>
                {allocation.orderItem.type === "STAGE" && allocation.orderItem.stage && (
                  <p className="text-muted-foreground">
                    Stage {stageTypeLabels[allocation.orderItem.stage.type]} —{" "}
                    {format(new Date(allocation.orderItem.stage.startDate), "dd/MM/yyyy", { locale: fr })}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
        {payment.manualPaymentNote && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className="font-medium">Note&nbsp;:</span> {payment.manualPaymentNote}
          </p>
        )}
      </TableCell>
    </TableRow>
  );
}
