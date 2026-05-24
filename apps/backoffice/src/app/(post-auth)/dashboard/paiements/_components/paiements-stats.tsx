"use client";

import { CreditCardIcon2, EuroSignIcon, MoneyIcon } from "@/lib/icons";

interface PaiementsStatsProps {
  totalEncaisse: number;
  countStripe: number;
  countManuel: number;
}

const formatEur = (amount: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);

export function PaiementsStats({ totalEncaisse, countStripe, countManuel }: PaiementsStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
        <div className="rounded-md bg-blue-500/10 p-2">
          <MoneyIcon className="size-5 text-blue-500" />
        </div>
        <div>
          <p className="text-2xl font-bold">{formatEur(totalEncaisse)}</p>
          <p className="text-xs text-muted-foreground">Total encaissé</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
        <div className="rounded-md bg-violet-500/10 p-2">
          <CreditCardIcon2 className="size-5 text-violet-500" />
        </div>
        <div>
          <p className="text-2xl font-bold">{countStripe}</p>
          <p className="text-xs text-muted-foreground">Stripe</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
        <div className="rounded-md bg-emerald-500/10 p-2">
          <EuroSignIcon className="size-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-2xl font-bold">{countManuel}</p>
          <p className="text-xs text-muted-foreground">Manuels</p>
        </div>
      </div>
    </div>
  );
}
