"use client";

import { cn } from "@/lib/utils";
import { StageCard } from "./StageCard";
import type { WeekData, AvailData, Stage } from "@/hooks/useStageCalendar";
import { DAY_NAMES } from "@/hooks/useStageCalendar";

interface MonthGridProps {
  weeksData: WeekData[];
  todayKey: string;
  availabilityMap: Record<string, AvailData | null>;
  hoveredStageId: string | null;
  onStageHover: (id: string, stage: Stage, avail: AvailData | null | undefined) => void;
  onStageLeave: () => void;
  onStageMouseMove: (x: number, y: number) => void;
  onStageClick: (stage: Stage) => void;
}

export function MonthGrid({
  weeksData,
  todayKey,
  availabilityMap,
  hoveredStageId,
  onStageHover,
  onStageLeave,
  onStageMouseMove,
  onStageClick,
}: MonthGridProps) {
  return (
    <>
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
        {DAY_NAMES.map((day, i) => (
          <div
            key={day}
            className={cn(
              "text-center text-xs font-semibold py-2 border-r border-slate-200 last:border-r-0",
              i === 0 ? "text-blue-800 bg-blue-100 font-bold" : "text-blue-600",
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {weeksData.map((week, weekIdx) => (
          <div key={weekIdx} className="relative flex-1 border-b border-slate-200 last:border-b-0">
            <div className="absolute inset-0 grid grid-cols-7 pointer-events-none z-0">
              {week.days.map((day, di) => (
                <div key={di} className={day.isOutOfMonth ? "bg-slate-200/70" : ""} />
              ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-slate-100">
              {week.days.map((day, di) => (
                <div
                  key={di}
                  className={cn(
                    "text-right px-1.5 pt-3 pb-3 text-xs leading-none",
                    day.isOutOfMonth ? "text-slate-300" : day.isPast ? "text-slate-400" : "text-slate-600",
                    day.key === todayKey ? "bg-blue-100 font-bold text-blue-700" : "",
                  )}
                >
                  {day.date.getDate()}
                </div>
              ))}
            </div>

            <div
              className="relative z-[1] grid grid-cols-7 px-0 pb-1.5 pt-0.5"
              style={{
                gridTemplateRows: `repeat(${Math.max(week.maxRowIndex + 1, 1)}, 24px)`,
                rowGap: "3px",
                minHeight: "40px",
              }}
            >
              {week.events.map((ev, ei) => (
                <StageCard
                  key={`${ev.stage.id}-${ei}`}
                  ev={ev}
                  availabilityMap={availabilityMap}
                  hoveredStageId={hoveredStageId}
                  onHover={onStageHover}
                  onLeave={onStageLeave}
                  onMouseMove={onStageMouseMove}
                  onClick={onStageClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
