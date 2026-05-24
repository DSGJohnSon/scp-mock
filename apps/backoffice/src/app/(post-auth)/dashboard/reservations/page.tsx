"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshIcon } from "@/lib/icons";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { useGetReservations } from "@/features/reservations/api/use-get-reservations";
import { ReservationsStats } from "./_components/reservations-stats";
import { ReservationsToolbar } from "./_components/reservations-toolbar";
import { ReservationsTable } from "./_components/reservations-table";
import { ReservationManualCreateForm } from "./_components/(forms)/reservation-manual-create-form";
import { useReservationsPage } from "./_hooks/use-reservations-page";
import type { AppReservationListItem } from "./_types";

export default function ReservationsPage() {
  const router = useRouter();
  const {
    page,
    setPage,
    searchInput,
    setSearchInput,
    searchQuery,
    bookingStatus,
    setBookingStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isCreateOpen,
    setIsCreateOpen,
    handleSearch,
    clearFilters,
    hasActiveFilters,
  } = useReservationsPage();

  const { data, isLoading, isError, refetch } = useGetReservations({
    page,
    limit: 20,
    search: searchQuery || undefined,
    bookingStatus,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const reservations = ((data as { reservations?: unknown[] })?.reservations ?? []) as AppReservationListItem[];
  const pagination = (data as { pagination?: { page: number; limit: number; total: number; totalPages: number } })?.pagination;

  const confirmed = reservations.filter((r) => r.status === "CONFIRMED").length;
  const cancelled = reservations.filter((r) => r.status === "CANCELLED").length;
  const totalOnPage = reservations.length;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <p className="text-sm text-muted-foreground animate-pulse">
          Chargement des réservations…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-32">
        <p className="text-sm text-muted-foreground">
          Impossible de charger les réservations.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshIcon className="size-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Réservations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {pagination ? `${pagination.total} réservation${pagination.total > 1 ? "s" : ""} au total` : ""}
        </p>
      </div>

      <ReservationsStats
        total={pagination?.total ?? totalOnPage}
        confirmed={confirmed}
        cancelled={cancelled}
      />

      <ReservationsToolbar
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={handleSearch}
        bookingStatus={bookingStatus}
        onBookingStatusChange={setBookingStatus}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      <ReservationsTable
        reservations={reservations}
        pagination={
          pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 }
        }
        onRowClick={(id) => router.push(`/dashboard/reservations/${id}`)}
        onPageChange={setPage}
      />

      <ResponsiveModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Réservation manuelle"
        description="Inscrit directement un stagiaire à un stage sans processus de paiement."
      >
        <ReservationManualCreateForm onSuccess={() => setIsCreateOpen(false)} />
      </ResponsiveModal>
    </main>
  );
}

export const fetchCache = "force-no-store";
