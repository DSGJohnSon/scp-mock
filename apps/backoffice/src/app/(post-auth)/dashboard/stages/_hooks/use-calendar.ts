"use client";

import { useState } from "react";
import { addMonths, subMonths, format } from "date-fns";
import { fr } from "date-fns/locale";

export function useCalendarFilters() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigatePrevious = () => setCurrentDate((d) => subMonths(d, 1));
  const navigateNext = () => setCurrentDate((d) => addMonths(d, 1));
  const goToToday = () => setCurrentDate(new Date());

  const headerLabel = format(currentDate, "MMMM yyyy", { locale: fr });

  return { currentDate, headerLabel, navigatePrevious, navigateNext, goToToday };
}
