"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/lib/icons";
import { CalendarView } from "./use-calendar-filters";

interface CalendarFilterBarProps {
  headerLabel: string;
  view: CalendarView;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  onAddStage: () => void;
  role?: string;
}

export function CalendarFilterBar({
  headerLabel,
  view,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
  onAddStage,
  role,
}: CalendarFilterBarProps) {
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
          <Button variant="outline" size="sm" onClick={onToday} className="ml-1">
            Aujourd&apos;hui
          </Button>
        </div>
        <h2 className="text-lg font-bold text-slate-800 capitalize">{headerLabel}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Select value={view} onValueChange={(v: CalendarView) => onViewChange(v)}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mois</SelectItem>
            <SelectItem value="week">Semaine</SelectItem>
          </SelectContent>
        </Select>

        {role === "ADMIN" && (
          <Button onClick={onAddStage} size="sm">
            <PlusIcon className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Nouveau stage</span>
            <span className="sm:hidden">Stage</span>
          </Button>
        )}
      </div>
    </div>
  );
}
