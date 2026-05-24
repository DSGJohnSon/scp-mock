"use client";

import { useMemo, useState } from "react";
import type { AppOrder } from "../_types";

type ModalState = { mode: "items" | "payments"; order: AppOrder } | { mode: null; order: null };

export const useCommandesPage = (orders: AppOrder[]) => {
  const [searchInput, setSearchInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modal, setModal] = useState<ModalState>({ mode: null, order: null });

  const filteredOrders = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate + "T23:59:59") : null;

    return orders.filter((order) => {
      if (q && !order.orderNumber.toLowerCase().includes(q)) return false;
      if (start && order.createdAt < start) return false;
      if (end && order.createdAt > end) return false;
      return true;
    });
  }, [orders, searchInput, startDate, endDate]);

  const hasActiveFilters = searchInput !== "" || startDate !== "" || endDate !== "";

  const clearFilters = () => {
    setSearchInput("");
    setStartDate("");
    setEndDate("");
  };

  const openItemsModal = (order: AppOrder) => setModal({ mode: "items", order });
  const openPaymentsModal = (order: AppOrder) => setModal({ mode: "payments", order });
  const closeModal = () => setModal({ mode: null, order: null });

  return {
    searchInput,
    setSearchInput,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filteredOrders,
    hasActiveFilters,
    clearFilters,
    modal,
    openItemsModal,
    openPaymentsModal,
    closeModal,
  };
};
