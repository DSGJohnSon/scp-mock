"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, SearchIcon } from "@/lib/icons";
import { StatusFilter } from "../_types";

interface CodesPromoToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  onCreateClick: () => void;
}

export function CodesPromoToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onCreateClick,
}: CodesPromoToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par code ou label…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tous les statuts</SelectItem>
          <SelectItem value="ACTIVE">Actifs</SelectItem>
          <SelectItem value="INACTIVE">Inactifs</SelectItem>
          <SelectItem value="EXPIRED">Expirés</SelectItem>
          <SelectItem value="MAXED">Épuisés</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={onCreateClick} className="w-full sm:w-auto">
        <PlusIcon className="h-4 w-4 mr-2" />
        Créer un code promo
      </Button>
    </div>
  );
}
