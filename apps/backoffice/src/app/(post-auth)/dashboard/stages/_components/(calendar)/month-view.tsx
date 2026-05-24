"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameMonth,
} from "date-fns";
import { StageCard, StageCalendarEntry, getSpanDays } from "./stage-card";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthViewProps<T extends StageCalendarEntry> {
  currentDate: Date;
  getDayStages: (day: Date, dayIndex: number, weekStart: Date) => T[];
  hoveredStageId: string | null;
  onStageClick: (stage: StageCalendarEntry) => void;
  onDayClick: (date: Date) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  role?: string;
}

const DAY_NAMES = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];

// ─── MonthView ────────────────────────────────────────────────────────────────

export function MonthView<T extends StageCalendarEntry>({
  currentDate,
  getDayStages,
  hoveredStageId,
  onStageClick,
  onDayClick,
  onMouseMove,
  onMouseLeave,
  role,
}: MonthViewProps<T>) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  // Étendu aux semaines complètes pour ne pas couper lundi ou dimanche
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const weeks: Date[][] = [];
  for (let i = 0; i < calDays.length; i += 7) {
    weeks.push(calDays.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col h-full">
      {/* En-tête jours */}
      <div className="grid grid-cols-7 border-b sticky top-0 bg-background z-20">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Grille — event delegation sur le conteneur */}
      <div
        className="flex-1 flex flex-col"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex-1 grid grid-cols-7">
            {week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const weekStart = week[0];
              const dayStages = getDayStages(day, dayIndex, weekStart);

              return (
                <div
                  key={day.toISOString()}
                  className={`border-r last:border-r-0 border-b p-2 cursor-pointer hover:bg-muted/50 min-h-[100px] relative overflow-visible ${
                    !isCurrentMonth ? "text-muted-foreground bg-muted/20" : ""
                  } ${isToday(day) ? "bg-primary/10" : ""}`}
                  onClick={() => role === "ADMIN" && onDayClick(day)}
                >
                  <div
                    className={`text-sm mb-1 font-medium ${
                      isToday(day) ? "font-bold text-primary" : ""
                    }`}
                  >
                    {day.getDate()}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayStages.map((stage, stageIndex) => {
                      const isContinuation = new Date(stage.startDate) < weekStart;
                      const spanDays = getSpanDays(stage, day, dayIndex, weekStart, 7);
                      return (
                        <StageCard
                          key={`${stage.id}-w${weekIndex}`}
                          stage={stage}
                          spanDays={spanDays}
                          isContinuation={isContinuation}
                          isHovered={hoveredStageId === stage.id}
                          stageIndex={stageIndex}
                          onClick={onStageClick}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
