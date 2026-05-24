"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/lib/icons";

interface CalendarHeaderProps {
  headerLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onAddStage: () => void;
  role?: string;
}

export function CalendarHeader({
  headerLabel,
  onPrevious,
  onNext,
  onToday,
  onAddStage,
  role,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 border-b border-slate-200 bg-white gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={onPrevious}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onNext}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="ml-1"
          >
            Aujourd&apos;hui
          </Button>
        </div>
        <h2 className="text-lg font-bold text-slate-800 capitalize">
          {headerLabel}
        </h2>
      </div>

      {/* Affichage du CTA de création que pour l'ADMIN. */}
      {role === "ADMIN" && (
        <Button onClick={onAddStage} size="sm">
          <PlusIcon className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">Nouveau stage</span>
          <span className="sm:hidden">Stage</span>
        </Button>
      )}
    </div>
  );
}
