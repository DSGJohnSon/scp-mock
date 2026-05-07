"use client";

import { useState } from "react";
import { startOfWeek, endOfWeek, addWeeks, subWeeks, addMonths, subMonths } from "date-fns";

export type CalendarView = "week" | "month";

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

interface UseCalendarFiltersReturn {
  currentDate: Date;
  view: CalendarView;
  headerLabel: string;
  navigatePrevious: () => void;
  navigateNext: () => void;
  goToToday: () => void;
  setView: (view: CalendarView) => void;
}

export function useCalendarFilters(): UseCalendarFiltersReturn {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");

  const navigatePrevious = () => {
    setCurrentDate((d) => (view === "week" ? subWeeks(d, 1) : subMonths(d, 1)));
  };
  const navigateNext = () => {
    setCurrentDate((d) => (view === "week" ? addWeeks(d, 1) : addMonths(d, 1)));
  };
  const goToToday = () => setCurrentDate(new Date());

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const headerLabel =
    view === "month"
      ? `${MONTH_NAMES[month]} ${year}`
      : weekStart.getMonth() === weekEnd.getMonth()
      ? `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getFullYear()}`
      : `${MONTH_NAMES[weekStart.getMonth()]} – ${MONTH_NAMES[weekEnd.getMonth()]} ${year}`;

  return { currentDate, view, headerLabel, navigatePrevious, navigateNext, goToToday, setView };
}
