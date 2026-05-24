"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { EditIcon, SaveIcon2, XIcon } from "@/lib/icons";
import { AppUser } from "../_types";
import { useUpdateUserRole } from "@/features/users/api/use-update-user-role";
import { useUpdateUserName } from "@/features/users/api/use-update-user-name";

type Role = AppUser["role"];

const roleLabels: Record<Role, string> = {
  ADMIN: "Administrateur",
  MONITEUR: "Moniteur",
  CUSTOMER: "Client",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface UsersTableRowProps {
  user: AppUser;
  isCurrentUser?: boolean;
}

export function UsersTableRow({ user, isCurrentUser = false }: UsersTableRowProps) {
  const updateRole = useUpdateUserRole();
  const updateName = useUpdateUserName();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);

  const handleRoleChange = (newRole: Role) => {
    if (newRole === user.role) return;
    updateRole.mutate({ param: { id: user.id }, json: { role: newRole } });
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length < 2 || trimmed === user.name) {
      setIsEditingName(false);
      setNameInput(user.name);
      return;
    }
    updateName.mutate(
      { param: { id: user.id }, json: { name: trimmed } },
      {
        onSettled: () => setIsEditingName(false),
      }
    );
  };

  const handleCancelName = () => {
    setNameInput(user.name);
    setIsEditingName(false);
  };

  const avatarSrc = user.avatarUrl ?? user.image ?? undefined;

  return (
    <TableRow>
      {/* Avatar */}
      <TableCell className="w-12">
        <Avatar className="size-9">
          <AvatarImage src={avatarSrc} alt={user.name} />
          <AvatarFallback className="text-xs font-medium">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </TableCell>

      {/* Nom */}
      <TableCell>
        {isEditingName ? (
          <div className="flex items-center gap-1.5">
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") handleCancelName();
              }}
              className="h-7 text-sm w-40"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              onClick={handleSaveName}
              disabled={updateName.isPending}
            >
              <SaveIcon2 className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              onClick={handleCancelName}
            >
              <XIcon className="size-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 group">
            <span className="text-sm font-medium">{user.name}</span>
            <Button
              size="icon"
              variant="ghost"
              className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsEditingName(true)}
            >
              <EditIcon className="size-3" />
            </Button>
          </div>
        )}
      </TableCell>

      {/* Email */}
      <TableCell>
        <span className="text-sm text-muted-foreground">{user.email}</span>
      </TableCell>

      {/* Rôle */}
      <TableCell>
        <Select
          value={user.role}
          onValueChange={(v) => handleRoleChange(v as Role)}
          disabled={updateRole.isPending || isCurrentUser}
        >
          <SelectTrigger className="h-8 w-[140px] text-sm">
            <span>{roleLabels[user.role]}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CUSTOMER">Client</SelectItem>
            <SelectItem value="MONITEUR">Moniteur</SelectItem>
            <SelectItem value="ADMIN">Administrateur</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>

      {/* Dates */}
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm">{formatDate(user.createdAt)}</span>
          <span className="text-xs text-muted-foreground">
            modifié {formatDate(user.updatedAt)}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}
