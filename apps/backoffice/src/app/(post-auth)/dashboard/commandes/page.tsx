"use client";

import { Button } from "@/components/ui/button";
import { RefreshIcon } from "@/lib/icons";
import { useGetOrders } from "@/features/orders/api/use-get-orders";
import { useDeleteGhostOrders } from "@/features/orders/api/use-delete-ghost-orders";
import { CommandesToolbar } from "./_components/commandes-toolbar";
import { CommandesTable } from "./_components/commandes-table";
import { CommandeItemsModal } from "./_components/commande-items-modal";
import { CommandePaymentsModal } from "./_components/commande-payments-modal";
import { useCommandesPage } from "./_hooks/use-commandes-page";
import type { AppOrder } from "./_types";

export default function CommandesPage() {
  const { data, isLoading, isError, refetch } = useGetOrders();
  const orders = (data ?? []) as AppOrder[];
  const deleteGhosts = useDeleteGhostOrders();

  const {
    searchInput,
    setSearchInput,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filteredOrders,
    hasActiveFilters,
    clearFilters,
    modal,
    openItemsModal,
    openPaymentsModal,
    closeModal,
  } = useCommandesPage(orders);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <p className="text-sm text-muted-foreground animate-pulse">
          Chargement des commandes…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-32">
        <p className="text-sm text-muted-foreground">
          Impossible de charger les commandes.
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
        <h1 className="text-2xl font-bold tracking-tight">
          Commandes{" "}
          <span className="text-muted-foreground text-base font-normal">
            ({filteredOrders.length})
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {orders.length} commande{orders.length !== 1 ? "s" : ""} au total
        </p>
      </div>

      <CommandesToolbar
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        onGhostCleanup={() => deleteGhosts.mutate(undefined)}
        isGhostPending={deleteGhosts.isPending}
      />

      <CommandesTable
        items={filteredOrders}
        onOpenItems={openItemsModal}
        onOpenPayments={openPaymentsModal}
      />

      <CommandeItemsModal
        open={modal.mode === "items"}
        onOpenChange={(open) => !open && closeModal()}
        order={modal.order}
      />

      <CommandePaymentsModal
        open={modal.mode === "payments"}
        onOpenChange={(open) => !open && closeModal()}
        order={modal.order}
      />
    </main>
  );
}

export const fetchCache = "force-no-store";
