"use client";

import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { RefreshIcon } from "@/lib/icons";
import { useGetPromoCodes } from "@/features/promocodes/api/use-get-promocodes";
import { CodesPromoStats } from "./_components/codes-promo-stats";
import { CodesPromoToolbar } from "./_components/codes-promo-toolbar";
import { CodesPromoTable } from "./_components/codes-promo-table";
import { PromoCodeCreateForm } from "./_components/(forms)/promo-code-create-form";
import { PromoCodeEditForm } from "./_components/(forms)/promo-code-edit-form";
import { useCodesPromoPage } from "./_hooks/use-codes-promo-page";
import { PromoCode } from "./_types";

export default function CodesPromoPage() {
  const { data, isLoading, isError, refetch } = useGetPromoCodes();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    isCreateOpen,
    setIsCreateOpen,
    editingCode,
    isEditOpen,
    openEdit,
    handleEditOpenChange,
    filteredItems,
    stats,
  } = useCodesPromoPage((data as PromoCode[] | undefined) ?? null);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <p className="text-sm text-muted-foreground animate-pulse">
          Chargement des codes promo…
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-32">
        <p className="text-sm text-muted-foreground">
          Impossible de charger les codes promo.
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
        <h1 className="text-2xl font-bold tracking-tight">Codes Promo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez les codes de réduction utilisables au checkout
        </p>
      </div>

      <CodesPromoStats
        total={stats.total}
        actifs={stats.actifs}
        totalUses={stats.totalUses}
        inactifs={stats.inactifs}
      />

      <CodesPromoToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      <CodesPromoTable items={filteredItems} onEdit={openEdit} />

      {/* Modal création */}
      <ResponsiveModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Créer un code promo"
        description="Renseignez les paramètres du nouveau code de réduction"
        dialogClassName="w-full sm:max-w-lg overflow-y-auto max-h-[85vh]"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">Nouveau code promo</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Renseignez les paramètres du nouveau code de réduction
          </p>
          <PromoCodeCreateForm onSuccess={() => setIsCreateOpen(false)} />
        </div>
      </ResponsiveModal>

      {/* Modal édition */}
      {editingCode && (
        <ResponsiveModal
          open={isEditOpen}
          onOpenChange={handleEditOpenChange}
          title={`Modifier ${editingCode.code}`}
          description="Modifiez les paramètres du code de réduction"
          dialogClassName="w-full sm:max-w-lg overflow-y-auto max-h-[85vh]"
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-1">
              Modifier{" "}
              <span className="font-mono text-blue-600">{editingCode.code}</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Modifiez les paramètres du code de réduction
            </p>
            <PromoCodeEditForm
              promoCode={editingCode}
              onSuccess={() => handleEditOpenChange(false)}
            />
          </div>
        </ResponsiveModal>
      )}
    </main>
  );
}
