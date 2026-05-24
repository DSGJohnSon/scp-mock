"use client";

import { useState } from "react";

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function navigateMonth(ym: string, direction: -1 | 1): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + direction, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export const useDashboardPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth);

  const isCurrentMonth = selectedMonth === currentYearMonth();
  const smLabel = getMonthLabel(selectedMonth);

  const navigatePrev = () => setSelectedMonth((m) => navigateMonth(m, -1));
  const navigateNext = () => setSelectedMonth((m) => navigateMonth(m, 1));
  const goToCurrentMonth = () => setSelectedMonth(currentYearMonth());

  return {
    selectedMonth,
    smLabel,
    isCurrentMonth,
    navigatePrev,
    navigateNext,
    goToCurrentMonth,
  };
};
