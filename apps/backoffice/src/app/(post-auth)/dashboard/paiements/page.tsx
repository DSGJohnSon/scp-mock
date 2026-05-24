"use client";

import { Button } from "@/components/ui/button";
import { RefreshIcon } from "@/lib/icons";
import { useGetPayments } from "@/features/payments/api/use-get-payments";
import { PaiementsStats } from "./_components/paiements-stats";
import { PaiementsToolbar } from "./_components/paiements-toolbar";
import { PaiementsTable } from "./_components/paiements-table";
import { usePaiementsPage } from "./_hooks/use-paiements-page";
import { AppPayment } from "./_types";

export default function PaiementsPage() {
  const { data, isLoading, isError, refetch } = useGetPayments();

  const {
    searchStripeId,
    setSearchStripeId,
    searchOrderNumber,
    setSearchOrderNumber,
    filteredPayments,
    stats,
  } = usePaiementsPage((data as AppPayment[] | undefined) ?? null);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <p className="text-sm text-muted-foreground animate-pulse">
          Chargement des paiements…
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-32">
        <p className="text-sm text-muted-foreground">
          Impossible de charger les paiements.
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
        <h1 className="text-2xl font-bold tracking-tight">Paiements</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Consultez tous les paiements enregistrés (Stripe et manuels)
        </p>
      </div>

      <PaiementsStats
        totalEncaisse={stats.totalEncaisse}
        countStripe={stats.countStripe}
        countManuel={stats.countManuel}
      />

      <PaiementsToolbar
        searchStripeId={searchStripeId}
        onSearchStripeIdChange={setSearchStripeId}
        searchOrderNumber={searchOrderNumber}
        onSearchOrderNumberChange={setSearchOrderNumber}
        resultCount={filteredPayments.length}
      />

      <PaiementsTable payments={filteredPayments} />
    </main>
  );
}
