"use client";

import { Button } from "@/components/ui/button";
import { RefreshIcon } from "@/lib/icons";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { useGetAllClients } from "@/features/clients/api/use-get-clients";
import { usePaginatedTable } from "@/hooks/use-paginated-table";
import { ClientsStats } from "./_components/clients-stats";
import { ClientsToolbar } from "./_components/clients-toolbar";
import { ClientsTable } from "./_components/clients-table";
import { ClientDetailModal } from "./_components/client-detail-modal";
import { ClientCreateForm } from "./_components/(forms)/client-create-form";
import { useClientsPage } from "./_hooks/use-clients-page";
import { AppClient } from "./_types";

export default function ClientsPage() {
  const table = usePaginatedTable("orders");

  const { data: response, isLoading, isError, refetch } = useGetAllClients({
    page: table.page,
    pageSize: table.pageSize,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    search: table.searchQuery,
  });

  const {
    selectedClient,
    isDetailOpen,
    isCreateOpen,
    setIsCreateOpen,
    openDetail,
    handleDetailOpenChange,
  } = useClientsPage();

  const clients = (response?.clients ?? []) as AppClient[];
  const totalCount = response?.totalCount ?? 0;
  const totalOrders = clients.reduce((sum, c) => sum + c.orders.length, 0);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <p className="text-sm text-muted-foreground animate-pulse">
          Chargement des clients…
        </p>
      </div>
    );
  }

  if (isError || !response) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-32">
        <p className="text-sm text-muted-foreground">
          Impossible de charger les clients.
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
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez tous les clients de votre établissement
        </p>
      </div>

      <ClientsStats totalCount={totalCount} totalOrders={totalOrders} />

      <ClientsToolbar
        searchInput={table.searchInput}
        onSearchInputChange={table.setSearchInput}
        onSearchSubmit={table.handleSearch}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      <ClientsTable
        clients={clients}
        totalCount={totalCount}
        page={table.page}
        pageSize={table.pageSize}
        sortBy={table.sortBy}
        sortOrder={table.sortOrder}
        onSort={table.handleSort}
        onPageChange={table.setPage}
        onPageSizeChange={table.handlePageSizeChange}
        onDetailClick={openDetail}
      />

      <ClientDetailModal
        client={selectedClient}
        open={isDetailOpen}
        onOpenChange={handleDetailOpenChange}
      />

      <ResponsiveModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Nouveau client"
        description="Renseignez les informations du nouveau client"
        dialogClassName="w-full sm:max-w-lg overflow-y-auto max-h-[85vh]"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Nouveau client</h2>
          <ClientCreateForm onSuccess={() => setIsCreateOpen(false)} />
        </div>
      </ResponsiveModal>
    </main>
  );
}
