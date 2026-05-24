"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { ReservationsTableRow } from "./reservations-table-row";
import type { AppReservationListItem } from "../_types";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ReservationsTableProps {
  reservations: AppReservationListItem[];
  pagination: Pagination;
  onRowClick: (id: string) => void;
  onPageChange: (page: number) => void;
}

export function ReservationsTable({
  reservations,
  pagination,
  onRowClick,
  onPageChange,
}: ReservationsTableProps) {
  if (reservations.length === 0) {
    return (
      <div className="rounded-xl border">
        <p className="py-16 text-center text-sm text-muted-foreground">
          Aucune réservation trouvée
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Réservé le</TableHead>
              <TableHead>Stagiaire</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Commande</TableHead>
              <TableHead className="text-right">Payé</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <ReservationsTableRow
                key={reservation.id}
                reservation={reservation}
                onClick={() => onRowClick(reservation.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="border-t px-4">
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          pageSize={pagination.limit}
          onPageChange={onPageChange}
          onPageSizeChange={() => {}}
        />
      </div>
    </div>
  );
}
