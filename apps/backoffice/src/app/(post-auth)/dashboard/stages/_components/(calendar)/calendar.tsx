"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { addDays } from "date-fns";
import { MonthView } from "./month-view";
import { StageTooltip, StageCard, StageCalendarEntry, TooltipData } from "./stage-card";
import { useCalendarFilters } from "../../_hooks/use-calendar";
import { CalendarHeader } from "./calendar-header";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalendarProps<T extends StageCalendarEntry> {
  stages: T[];
  onStageClick: (stage: T) => void;
  onDayClick: (date: Date) => void;
  onAddStage: () => void;
  role?: string;
}

// ─── Helpers index ────────────────────────────────────────────────────────────

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function buildStageIndex<T extends StageCalendarEntry>(stages: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const stage of stages) {
    const key = toDateKey(new Date(stage.startDate));
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(stage);
  }
  return map;
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export function Calendar<T extends StageCalendarEntry>({
  stages,
  onStageClick,
  onDayClick,
  onAddStage,
  role,
}: CalendarProps<T>) {
  const { currentDate, headerLabel, navigatePrevious, navigateNext, goToToday } =
    useCalendarFilters();

  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Index date → stages pour O(1) par cellule ; map id → stage pour le tooltip
  const stageIndex = useMemo(() => buildStageIndex(stages), [stages]);
  const stageMap = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);

  // getDayStages est stable tant que les données API ne changent pas
  const getDayStages = useCallback(
    (day: Date, dayIndex: number, weekStart: Date): T[] => {
      const starting = (stageIndex.get(toDateKey(day)) ?? []) as T[];
      if (dayIndex === 0) {
        const continuing = stages.filter((s) => {
          const start = new Date(s.startDate);
          const end = addDays(start, s.duration - 1);
          return start < weekStart && end >= day;
        });
        return [...continuing, ...starting];
      }
      return starting;
    },
    [stageIndex, stages]
  );

  const handleStageClick = useCallback(
    (stage: StageCalendarEntry) => onStageClick(stage as T),
    [onStageClick]
  );

  // Un seul listener sur la grille — lit data-stage-id pour identifier la card
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const card = (e.target as Element).closest("[data-stage-id]");
      const id = card?.getAttribute("data-stage-id") ?? null;
      const stage = id ? stageMap.get(id) : undefined;
      setHoveredStageId(id);
      setTooltipData(stage ? { stage, x: e.clientX, y: e.clientY } : null);
    },
    [stageMap]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredStageId(null);
    setTooltipData(null);
  }, []);

  return (
    <div className="flex flex-col h-full border border-slate-200 rounded-xl overflow-hidden bg-white">
      <CalendarHeader
        headerLabel={headerLabel}
        onPrevious={navigatePrevious}
        onNext={navigateNext}
        onToday={goToToday}
        onAddStage={onAddStage}
        role={role}
      />

      <div className="flex-1 overflow-auto">
        <div className="min-w-[600px] h-full">
          <MonthView
            currentDate={currentDate}
            getDayStages={getDayStages}
            hoveredStageId={hoveredStageId}
            onStageClick={handleStageClick}
            onDayClick={onDayClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            role={role}
          />
        </div>
      </div>

      {/* Hors de MonthView — un mousemove ne re-render pas la grille */}
      {mounted && tooltipData && <StageTooltip data={tooltipData} />}
    </div>
  );
}
