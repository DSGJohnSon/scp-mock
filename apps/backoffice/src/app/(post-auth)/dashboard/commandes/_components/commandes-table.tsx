"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AppOrder } from "../_types";
import { CommandesTableRow } from "./commandes-table-row";

interface CommandesTableProps {
  items: AppOrder[];
  onOpenItems: (order: AppOrder) => void;
  onOpenPayments: (order: AppOrder) => void;
}

export function CommandesTable({ items, onOpenItems, onOpenPayments }: CommandesTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow>
            <TableHead>Numéro</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="w-12">Produits</TableHead>
            <TableHead className="w-12">Paiements</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                Aucune commande trouvée
              </TableCell>
            </TableRow>
          ) : (
            items.map((order) => (
              <CommandesTableRow
                key={order.id}
                order={order}
                onOpenItems={onOpenItems}
                onOpenPayments={onOpenPayments}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
