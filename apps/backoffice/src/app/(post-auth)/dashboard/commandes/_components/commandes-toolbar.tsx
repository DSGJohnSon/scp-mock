"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchIcon, XIcon, TrashIcon } from "@/lib/icons";

interface CommandesToolbarProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onGhostCleanup: () => void;
  isGhostPending: boolean;
}

export function CommandesToolbar({
  searchInput,
  onSearchInputChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  hasActiveFilters,
  onClearFilters,
  onGhostCleanup,
  isGhostPending,
}: CommandesToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Numéro de commande…"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearFilters}
              title="Réinitialiser les filtres"
            >
              <XIcon className="size-4" />
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onGhostCleanup}
            disabled={isGhostPending}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <TrashIcon className="size-4 mr-2" />
            {isGhostPending ? "Nettoyage…" : "Nettoyer les fantômes"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <Label className="shrink-0 text-sm text-muted-foreground">Du</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-auto"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label className="shrink-0 text-sm text-muted-foreground">Au</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>
    </div>
  );
}
