"use client";

import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/lib/icons";

interface PaiementsToolbarProps {
  searchStripeId: string;
  onSearchStripeIdChange: (value: string) => void;
  searchOrderNumber: string;
  onSearchOrderNumberChange: (value: string) => void;
  resultCount: number;
}

export function PaiementsToolbar({
  searchStripeId,
  onSearchStripeIdChange,
  searchOrderNumber,
  onSearchOrderNumberChange,
  resultCount,
}: PaiementsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="ID transaction Stripe…"
            value={searchStripeId}
            onChange={(e) => onSearchStripeIdChange(e.target.value)}
            className="pl-9 font-mono text-sm"
          />
        </div>

        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Numéro de commande…"
            value={searchOrderNumber}
            onChange={(e) => onSearchOrderNumberChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground shrink-0">
        {resultCount} paiement{resultCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
