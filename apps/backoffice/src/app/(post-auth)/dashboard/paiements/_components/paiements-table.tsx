"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppPayment } from "../_types";
import { PaiementsTableRow } from "./paiements-table-row";

interface PaiementsTableProps {
  payments: AppPayment[];
}

export function PaiementsTable({ payments }: PaiementsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Commande</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Détails</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                Aucun paiement trouvé
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <PaiementsTableRow key={payment.id} payment={payment} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
