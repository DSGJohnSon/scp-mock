"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppUser } from "../_types";
import { UsersTableRow } from "./users-table-row";

interface UsersTableProps {
  users: AppUser[];
  currentUserId?: string;
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border bg-card py-16 text-center">
        <p className="text-sm text-muted-foreground">Aucun utilisateur trouvé</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" />
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Dates</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <UsersTableRow key={user.id} user={user} isCurrentUser={user.id === currentUserId} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
