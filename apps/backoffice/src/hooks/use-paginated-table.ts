"use client";

import { useState } from "react";

export const usePaginatedTable = (
  defaultSortBy: string,
  defaultSortOrder: "asc" | "desc" = "desc",
) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(defaultSortOrder);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value));
    setPage(1);
  };

  return {
    page,
    setPage,
    pageSize,
    sortBy,
    sortOrder,
    searchQuery,
    searchInput,
    setSearchInput,
    handleSort,
    handleSearch,
    handlePageSizeChange,
  };
};
