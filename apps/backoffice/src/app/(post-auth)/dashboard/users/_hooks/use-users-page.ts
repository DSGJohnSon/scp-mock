"use client";

import { useMemo, useState } from "react";
import { AppUser, RoleFilter } from "../_types";

const ROLE_ORDER: Record<AppUser["role"], number> = { ADMIN: 0, MONITEUR: 1, CUSTOMER: 2 };

export const useUsersPage = (users: AppUser[] | null) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const term = searchTerm.toLowerCase();
    return users
      .filter((u) => {
        const matchesSearch =
          !term ||
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term);
        const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);
  }, [users, searchTerm, roleFilter]);

  const stats = useMemo(() => {
    if (!users) return { total: 0, admins: 0, moniteurs: 0 };
    return {
      total: users.length,
      admins: users.filter((u) => u.role === "ADMIN").length,
      moniteurs: users.filter((u) => u.role === "MONITEUR").length,
    };
  }, [users]);

  return {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    isCreateOpen,
    setIsCreateOpen,
    filteredUsers,
    stats,
  };
};
