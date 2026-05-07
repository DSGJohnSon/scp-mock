"use client";

import { useState, useEffect, useMemo, useRef } from "react";

export interface Stage {
  id: string;
  startDate: string;
  duration: number;
  places: number;
  price: number;
  type: string;
  promotionOriginalPrice?: number | null;
}

export interface AvailData {
  available: boolean;
  availablePlaces: number;
}

export interface CalDay {
  date: Date;
  key: string;
  isPast: boolean;
  isOutOfMonth: boolean;
}

export interface WeekEventSegment {
  stage: Stage;
  colStart: number;
  colEnd: number;
  isContinuation: boolean;
  continuesNext: boolean;
  rowIndex: number;
}

export interface WeekData {
  days: CalDay[];
  events: WeekEventSegment[];
  maxRowIndex: number;
}

export const TYPE_CONFIG: Record<
  string,
  { bgBar: string; bgBarHex: string; label: string; bgLight: string; borderClass: string }
> = {
  INITIATION: {
    bgBar: "bg-sky-400",
    bgBarHex: "#38bdf8",
    bgLight: "bg-sky-50",
    borderClass: "border-sky-400",
    label: "Initiation",
  },
  PROGRESSION: {
    bgBar: "bg-blue-500",
    bgBarHex: "#3b82f6",
    bgLight: "bg-blue-50",
    borderClass: "border-blue-500",
    label: "Progression",
  },
  AUTONOMIE: {
    bgBar: "bg-blue-800",
    bgBarHex: "#1e40af",
    bgLight: "bg-blue-50",
    borderClass: "border-blue-800",
    label: "Autonomie",
  },
  DOUBLE: {
    bgBar: "bg-violet-500",
    bgBarHex: "#8b5cf6",
    bgLight: "bg-violet-50",
    borderClass: "border-violet-400",
    label: "Initiation + Progression",
  },
};

export const DAY_NAMES = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];

export const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function getDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDOWSun(d: Date) { return d.getDay(); }

export type StageType = "INITIATION" | "PROGRESSION" | "AUTONOMIE";

export function useStageCalendar(stageType: StageType) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const todayKey = getDateKey(today);

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [localStages, setLocalStages] = useState<Stage[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailData | null>>({});
  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [tooltipStage, setTooltipStage] = useState<{ stage: Stage; avail: AvailData | null | undefined } | null>(null);
  const [dialogStage, setDialogStage] = useState<Stage | null>(null);

  const stageCache = useRef<Map<string, Stage[]>>(new Map());
  const isAutoNavigating = useRef(true);

  const apiTypes = useMemo(() => {
    const t: string[] = [stageType];
    if (stageType === "INITIATION" || stageType === "PROGRESSION") t.push("DOUBLE");
    return t;
  }, [stageType]);

  useEffect(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const key = `${year}-${month}-${stageType}`;

    if (stageCache.current.has(key)) { setLocalStages(stageCache.current.get(key)!); return; }

    const ctrl = new AbortController();
    setLoadingStages(true);

    const from = new Date(year, month, 1).toISOString().split("T")[0];
    const to = new Date(year, month + 1, 0).toISOString().split("T")[0];
    const params = new URLSearchParams({ from, to, types: apiTypes.join(",") });

    fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/stages?${params}`, {
      signal: ctrl.signal,
      headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;
        const stages: Stage[] = data.data;
        stageCache.current.set(key, stages);
        setLocalStages(stages);

        if (isAutoNavigating.current) {
          const hasUpcoming = stages.some((s) => { const d = new Date(s.startDate); d.setHours(0,0,0,0); return d >= today; });
          if (!hasUpcoming) {
            const next = new Date(year, month + 1, 1);
            if (next < new Date(today.getFullYear(), today.getMonth() + 12, 1)) setViewDate(next);
            else isAutoNavigating.current = false;
          } else {
            isAutoNavigating.current = false;
          }
        }
      })
      .catch((e) => { if (e.name !== "AbortError") console.error(e); })
      .finally(() => setLoadingStages(false));

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [`${viewDate.getFullYear()}-${viewDate.getMonth()}`, stageType]);

  const filteredStages = useMemo(() =>
    localStages
      .filter((s) => { const d = new Date(s.startDate); d.setHours(0,0,0,0); return d >= today; })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
    [localStages, today],
  );

  const stagesKey = filteredStages.map((s) => s.id).join(",");
  useEffect(() => {
    if (filteredStages.length === 0) { setAvailabilityMap({}); return; }
    setLoadingAvail(true);
    const ctrl = new AbortController();
    fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/availability/check-batch`, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" },
      body: JSON.stringify({ items: filteredStages.map((s) => ({ type: "stage", itemId: s.id })) }),
    })
      .then((r) => r.json())
      .then((data) => { if (data.success) setAvailabilityMap(data.data); })
      .catch(() => {})
      .finally(() => setLoadingAvail(false));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagesKey]);

  const calendarDays = useMemo((): CalDay[] => {
    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay();
    const days: CalDay[] = [];
    const prevLast = new Date(year, month, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevLast - i); d.setHours(0,0,0,0);
      days.push({ date: d, key: getDateKey(d), isPast: d < today, isOutOfMonth: true });
    }
    for (let n = 1; n <= lastDay.getDate(); n++) {
      const d = new Date(year, month, n); d.setHours(0,0,0,0);
      days.push({ date: d, key: getDateKey(d), isPast: d < today, isOutOfMonth: false });
    }
    let nx = 1;
    while (days.length % 7 !== 0) {
      const d = new Date(year, month + 1, nx++); d.setHours(0,0,0,0);
      days.push({ date: d, key: getDateKey(d), isPast: d < today, isOutOfMonth: true });
    }
    return days;
  }, [viewDate, today]);

  const weeksData = useMemo((): WeekData[] => {
    const chunks: CalDay[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) chunks.push(calendarDays.slice(i, i + 7));

    return chunks.map((weekDays) => {
      const weekSunday = new Date(weekDays[0].date);
      weekSunday.setDate(weekSunday.getDate() - getDOWSun(weekSunday));
      weekSunday.setHours(0,0,0,0);
      const weekSaturday = new Date(weekSunday);
      weekSaturday.setDate(weekSaturday.getDate() + 6);
      weekSaturday.setHours(0,0,0,0);

      const overlapping = filteredStages.filter((s) => {
        const st = new Date(s.startDate); st.setHours(0,0,0,0);
        const en = new Date(s.startDate); en.setDate(en.getDate() + s.duration - 1); en.setHours(0,0,0,0);
        return en >= weekSunday && st <= weekSaturday;
      });

      let rowIdx = 0;
      const segments: WeekEventSegment[] = overlapping.map((stage) => {
        const st = new Date(stage.startDate); st.setHours(0,0,0,0);
        const en = new Date(stage.startDate); en.setDate(en.getDate() + stage.duration - 1); en.setHours(0,0,0,0);
        const segStart = st < weekSunday ? weekSunday : st;
        const segEnd = en > weekSaturday ? weekSaturday : en;
        return {
          stage,
          colStart: getDOWSun(segStart) + 1,
          colEnd: getDOWSun(segEnd) + 1,
          isContinuation: st < weekSunday,
          continuesNext: en > weekSaturday,
          rowIndex: rowIdx++,
        };
      });

      segments.sort((a, b) => a.colStart - b.colStart || (b.colEnd - b.colStart) - (a.colEnd - a.colStart));

      return { days: weekDays, events: segments, maxRowIndex: segments.length - 1 };
    });
  }, [calendarDays, filteredStages]);

  const hasAnyStages = filteredStages.length > 0;
  const currentMonthHasStages = weeksData.some((w) => w.events.length > 0);

  function navigate(delta: number) {
    isAutoNavigating.current = false;
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
  }

  function handleStageHover(id: string, stage: Stage, avail: AvailData | null | undefined) {
    setHoveredStageId(id);
    setTooltipStage({ stage, avail });
  }

  function handleStageLeave() {
    setHoveredStageId(null);
    setTooltipStage(null);
    setMousePos(null);
  }

  function handleMouseMove(x: number, y: number) {
    setMousePos({ x, y });
  }

  return {
    viewDate,
    navigate,
    loadingStages,
    loadingAvail,
    filteredStages,
    weeksData,
    hasAnyStages,
    currentMonthHasStages,
    availabilityMap,
    hoveredStageId,
    mousePos,
    tooltipStage,
    dialogStage,
    setDialogStage,
    todayKey,
    handleStageHover,
    handleStageLeave,
    handleMouseMove,
  };
}
