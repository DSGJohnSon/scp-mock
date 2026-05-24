"use client";

import { useState } from "react";
import type { BookingStatusFilter } from "../_types";

export const useReservationsPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingStatus, setBookingStatus] = useState<BookingStatusFilter>("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const resetPageAndSet = <T>(setter: (v: T) => void) => (v: T) => {
    setPage(1);
    setter(v);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setBookingStatus("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery !== "" || bookingStatus !== "ALL" || startDate !== "" || endDate !== "";

  return {
    page,
    setPage,
    searchInput,
    setSearchInput,
    searchQuery,
    bookingStatus,
    setBookingStatus: resetPageAndSet(setBookingStatus),
    startDate,
    setStartDate: resetPageAndSet(setStartDate),
    endDate,
    setEndDate: resetPageAndSet(setEndDate),
    isCreateOpen,
    setIsCreateOpen,
    handleSearch,
    clearFilters,
    hasActiveFilters,
  };
};
