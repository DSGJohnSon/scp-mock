"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchIcon, PlusIcon } from "@/lib/icons";
import { RoleFilter } from "../_types";

interface UsersToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: RoleFilter;
  onRoleFilterChange: (value: RoleFilter) => void;
  onCreateClick: () => void;
}

export function UsersToolbar({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onCreateClick,
}: UsersToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Rechercher par nom ou email…"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={roleFilter}
          onValueChange={(v) => onRoleFilterChange(v as RoleFilter)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les rôles</SelectItem>
            <SelectItem value="ADMIN">Administrateur</SelectItem>
            <SelectItem value="MONITEUR">Moniteur</SelectItem>
            <SelectItem value="CUSTOMER">Client</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onCreateClick} className="shrink-0">
        <PlusIcon className="size-4 mr-2" />
        Nouvel utilisateur
      </Button>
    </div>
  );
}
