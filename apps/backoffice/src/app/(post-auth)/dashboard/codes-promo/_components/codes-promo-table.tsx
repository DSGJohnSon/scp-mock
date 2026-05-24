"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TagIcon } from "@/lib/icons";
import { PromoCode } from "../_types";
import { CodesPromoTableRow } from "./codes-promo-table-row";

interface CodesPromoTableProps {
  items: PromoCode[];
  onEdit: (promoCode: PromoCode) => void;
}

export function CodesPromoTable({ items, onEdit }: CodesPromoTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground border rounded-lg">
        <TagIcon className="h-8 w-8 opacity-30" />
        <p className="text-sm">Aucun code promo trouvé</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Réduction</TableHead>
            <TableHead>Règles</TableHead>
            <TableHead>Utilisations</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((promoCode) => (
            <CodesPromoTableRow
              key={promoCode.id}
              promoCode={promoCode}
              onEdit={onEdit}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
