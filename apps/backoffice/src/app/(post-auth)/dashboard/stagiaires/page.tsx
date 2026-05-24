"use client";

import { Button } from "@/components/ui/button";
import { RefreshIcon } from "@/lib/icons";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { useGetAllStagiaires } from "@/features/stagiaires/api/use-get-stagiaires";
import { usePaginatedTable } from "@/hooks/use-paginated-table";
import { StagiairesStats } from "./_components/stagiaires-stats";
import { StagiairesToolbar } from "./_components/stagiaires-toolbar";
import { StagiairesTable } from "./_components/stagiaires-table";
import { StagiaireDetailModal } from "./_components/stagiaire-detail-modal";
import { StagiaireCreateForm } from "./_components/(forms)/stagiaire-create-form";
import { useStagiairesPage } from "./_hooks/use-stagiaires-page";
import { AppStagiaire } from "./_types";

export default function StagiairesPage() {
  const table = usePaginatedTable("createdAt");

  const { data: response, isLoading, isError, refetch } = useGetAllStagiaires({
    page: table.page,
    pageSize: table.pageSize,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    search: table.searchQuery,
  });

  const {
    selectedStagiaire,
    isDetailOpen,
    isCreateOpen,
    setIsCreateOpen,
    openDetail,
    handleDetailOpenChange,
  } = useStagiairesPage();

  const stagiaires = (response?.stagiaires ?? []) as AppStagiaire[];
  const totalCount = response?.totalCount ?? 0;
  const totalBookings = stagiaires.reduce(
    (sum, s) => sum + s.stageBookings.length,
    0,
  );

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <p className="text-sm text-muted-foreground animate-pulse">
          Chargement des stagiaires…
        </p>
      </div>
    );
  }

  if (isError || !response) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-32">
        <p className="text-sm text-muted-foreground">
          Impossible de charger les stagiaires.
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
        <h1 className="text-2xl font-bold tracking-tight">Stagiaires</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez tous les stagiaires de votre établissement
        </p>
      </div>

      <StagiairesStats totalCount={totalCount} totalBookings={totalBookings} />

      <StagiairesToolbar
        searchInput={table.searchInput}
        onSearchInputChange={table.setSearchInput}
        onSearchSubmit={table.handleSearch}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      <StagiairesTable
        stagiaires={stagiaires}
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

      <StagiaireDetailModal
        stagiaire={selectedStagiaire}
        open={isDetailOpen}
        onOpenChange={handleDetailOpenChange}
      />

      <ResponsiveModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Nouveau stagiaire"
        description="Renseignez les informations du nouveau stagiaire"
        dialogClassName="w-full sm:max-w-lg overflow-y-auto max-h-[85vh]"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Nouveau stagiaire</h2>
          <StagiaireCreateForm onSuccess={() => setIsCreateOpen(false)} />
        </div>
      </ResponsiveModal>
    </main>
  );
}
