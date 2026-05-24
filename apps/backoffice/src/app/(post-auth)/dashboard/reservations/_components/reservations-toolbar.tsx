"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon, PlusIcon, XIcon } from "@/lib/icons";
import type { BookingStatusFilter } from "../_types";

interface ReservationsToolbarProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (e?: React.FormEvent) => void;
  bookingStatus: BookingStatusFilter;
  onBookingStatusChange: (value: BookingStatusFilter) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreateClick: () => void;
}

export function ReservationsToolbar({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  bookingStatus,
  onBookingStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  hasActiveFilters,
  onClearFilters,
  onCreateClick,
}: ReservationsToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={onSearchSubmit} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Nom, email, n° commande…"
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Rechercher
          </Button>
        </form>

        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={onClearFilters} title="Réinitialiser les filtres">
              <XIcon className="size-4" />
            </Button>
          )}
          <Button onClick={onCreateClick}>
            <PlusIcon className="size-4 mr-2" />
            Réservation manuelle
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 min-w-[200px]">
          <Label className="shrink-0 text-sm text-muted-foreground">Statut</Label>
          <Select
            value={bookingStatus}
            onValueChange={(v) => onBookingStatusChange(v as BookingStatusFilter)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes</SelectItem>
              <SelectItem value="CONFIRMED">Confirmées</SelectItem>
              <SelectItem value="CANCELLED">Annulées</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
