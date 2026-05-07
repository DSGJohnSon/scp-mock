"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameMonth,
} from "date-fns";
import { CalendarFilterBar } from "./calendar-filter-bar";
import { useCalendarFilters } from "./use-calendar-filters";
import {
  StageCard,
  StageTooltip,
  StageCalendarEntry,
  TooltipData,
  getStagesForDay,
  getSpanDays,
} from "./stage-event-card";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StageCalendarProps<T extends StageCalendarEntry> {
  stages: T[];
  onStageClick: (stage: T) => void;
  onDayClick: (date: Date) => void;
  onAddStage: () => void;
  role?: string;
}

const DAY_NAMES = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];

// ─── Composant orchestrateur ──────────────────────────────────────────────────

export function CalendarScheduleStages<T extends StageCalendarEntry>({
  stages,
  onStageClick,
  onDayClick,
  onAddStage,
  role,
}: StageCalendarProps<T>) {
  const { currentDate, view, headerLabel, navigatePrevious, navigateNext, goToToday, setView } =
    useCalendarFilters();

  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStageMouseEnter = useCallback((e: React.MouseEvent, stage: T) => {
    setHoveredStageId(stage.id);
    setTooltipData({ stage, x: e.clientX, y: e.clientY });
  }, []);

  const handleStageMouseMove = useCallback((e: React.MouseEvent, stage: T) => {
    setTooltipData({ stage, x: e.clientX, y: e.clientY });
  }, []);

  const handleStageMouseLeave = useCallback(() => {
    setHoveredStageId(null);
    setTooltipData(null);
  }, []);

  // ─── Vue semaine ──────────────────────────────────────────────────────────

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 border-b sticky top-0 bg-background z-20">
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={`p-4 text-center border-r last:border-r-0 cursor-pointer hover:bg-muted/50 ${
                isToday(day) ? "bg-primary/10 font-semibold" : ""
              }`}
              onClick={() => role === "ADMIN" && onDayClick(day)}
            >
              <div className="text-sm font-medium">
                {DAY_NAMES[day.getDay() === 0 ? 6 : day.getDay() - 1]}
              </div>
              <div className={`text-lg ${isToday(day) ? "text-primary" : ""}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((day, dayIndex) => {
            const dayStages = getStagesForDay(stages, day, dayIndex, weekStart);
            return (
              <div
                key={day.toISOString()}
                className="border-r last:border-r-0 border-b p-2 cursor-pointer hover:bg-muted/30 min-h-[400px] relative overflow-visible"
                onClick={() => role === "ADMIN" && onDayClick(day)}
              >
                <div className="space-y-1">
                  {dayStages.map((stage, stageIndex) => {
                    const isContinuation = new Date(stage.startDate) < weekStart;
                    const spanDays = getSpanDays(stage, day, dayIndex, weekStart, 7);
                    return (
                      <StageCard
                        key={stage.id}
                        stage={stage}
                        spanDays={spanDays}
                        dayIndex={dayIndex}
                        isContinuation={isContinuation}
                        isHovered={hoveredStageId === stage.id}
                        isWeekView
                        stageIndex={stageIndex}
                        onMouseEnter={(e) => handleStageMouseEnter(e, stage)}
                        onMouseLeave={handleStageMouseLeave}
                        onMouseMove={(e) => handleStageMouseMove(e, stage)}
                        onClick={(e) => { e.stopPropagation(); onStageClick(stage); }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Vue mois ─────────────────────────────────────────────────────────────

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

    const weeks: Date[][] = [];
    for (let i = 0; i < calDays.length; i += 7) {
      weeks.push(calDays.slice(i, i + 7));
    }

    return (
      <div className="flex flex-col h-full">
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

        <div className="flex-1 flex flex-col">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex-1 grid grid-cols-7">
              {week.map((day, dayIndex) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const dayStages = getStagesForDay(stages, day, dayIndex, week[0]);
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
                        const isContinuation = new Date(stage.startDate) < week[0];
                        const spanDays = getSpanDays(stage, day, dayIndex, week[0], 7);
                        return (
                          <StageCard
                            key={`${stage.id}-w${weekIndex}`}
                            stage={stage}
                            spanDays={spanDays}
                            dayIndex={dayIndex}
                            isContinuation={isContinuation}
                            isHovered={hoveredStageId === stage.id}
                            isWeekView={false}
                            stageIndex={stageIndex}
                            onMouseEnter={(e) => handleStageMouseEnter(e, stage)}
                            onMouseLeave={handleStageMouseLeave}
                            onMouseMove={(e) => handleStageMouseMove(e, stage)}
                            onClick={(e) => { e.stopPropagation(); onStageClick(stage); }}
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
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full border border-slate-200 rounded-xl overflow-hidden bg-white">
      <CalendarFilterBar
        headerLabel={headerLabel}
        view={view}
        onPrevious={navigatePrevious}
        onNext={navigateNext}
        onToday={goToToday}
        onViewChange={setView}
        onAddStage={onAddStage}
        role={role}
      />

      <div className="flex-1 overflow-auto">
        <div className={`${view === "week" ? "min-w-[700px]" : "min-w-[600px]"} h-full`}>
          {view === "week" ? renderWeekView() : renderMonthView()}
        </div>
      </div>

      {mounted && tooltipData && <StageTooltip data={tooltipData} />}
    </div>
  );
}
