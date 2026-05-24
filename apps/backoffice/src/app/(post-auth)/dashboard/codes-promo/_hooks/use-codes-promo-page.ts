"use client";

import { useMemo, useState } from "react";
import { PromoCode, StatusFilter } from "../_types";

export const isExpired = (code: PromoCode) =>
  code.expiryDate !== null && code.expiryDate < new Date();

export const isMaxedOut = (code: PromoCode) =>
  code.maxUses !== null && code.currentUses >= code.maxUses;

export const getPromoStatus = (code: PromoCode) => {
  if (!code.isActive)
    return { label: "Inactif", variant: "secondary" as const, color: "text-gray-500" };
  if (isExpired(code))
    return { label: "Expiré", variant: "destructive" as const, color: "text-red-500" };
  if (isMaxedOut(code))
    return { label: "Épuisé", variant: "destructive" as const, color: "text-orange-500" };
  return { label: "Actif", variant: "default" as const, color: "text-green-500" };
};

export const useCodesPromoPage = (codes: PromoCode[] | null) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const openEdit = (code: PromoCode) => {
    setEditingCode(code);
    setIsEditOpen(true);
  };

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) setEditingCode(null);
  };

  const filteredItems = useMemo(() => {
    if (!codes) return [];
    const term = searchTerm.toLowerCase();
    return codes.filter((c) => {
      const matchesSearch =
        !term ||
        c.code.toLowerCase().includes(term) ||
        (c.label?.toLowerCase().includes(term) ?? false);

      if (!matchesSearch) return false;

      if (statusFilter === "ALL") return true;
      if (statusFilter === "ACTIVE") return c.isActive && !isExpired(c) && !isMaxedOut(c);
      if (statusFilter === "INACTIVE") return !c.isActive;
      if (statusFilter === "EXPIRED") return isExpired(c);
      if (statusFilter === "MAXED") return isMaxedOut(c);
      return true;
    });
  }, [codes, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    if (!codes) return { total: 0, actifs: 0, totalUses: 0, inactifs: 0 };
    const actifs = codes.filter((c) => c.isActive && !isExpired(c) && !isMaxedOut(c)).length;
    return {
      total: codes.length,
      actifs,
      totalUses: codes.reduce((sum, c) => sum + c.currentUses, 0),
      inactifs: codes.length - actifs,
    };
  }, [codes]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    isCreateOpen,
    setIsCreateOpen,
    editingCode,
    isEditOpen,
    openEdit,
    handleEditOpenChange,
    filteredItems,
    stats,
  };
};
