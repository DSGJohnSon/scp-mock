"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Stage {
  id: string;
  startDate: string;
  duration: number;
  places: number;
  price: number;
  acomptePrice?: number | null;
  type: string;
  promotionOriginalPrice?: number | null;
}

interface AvailData {
  available: boolean;
  availablePlaces: number;
}

interface WeekEventSegment {
  stage: Stage;
  colStart: number;
  colEnd: number;
  isContinuation: boolean;
  continuesNext: boolean;
  rowIndex: number;
}

interface CalDay {
  date: Date;
  key: string;
  isPast: boolean;
  isOutOfMonth: boolean;
}

interface WeekData {
  days: CalDay[];
  events: WeekEventSegment[];
  maxRowIndex: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

interface StageCategory {
  id: string;
  name: string;
  price: number;
  duration: number;
  durationDays: number;
  description: string;
}

export const STAGE_CATEGORIES: StageCategory[] = [
  {
    id: "INITIATION",
    name: "Stage Initiation",
    price: 0,
    duration: 5,
    durationDays: 7,
    description: "Découvrez le vol en parapente avec une équipe de professionnels.",
  },
  {
    id: "PROGRESSION",
    name: "Stage Progression",
    price: 0,
    duration: 5,
    durationDays: 7,
    description: "Vous avez déjà volé ? Devenez désormais autonome en vol durant ce stage.",
  },
  {
    id: "AUTONOMIE",
    name: "Stage Autonomie",
    price: 0,
    duration: 10,
    durationDays: 14,
    description: "Découvrez le parapente et devenez autonome durant un seul et même stage.",
  },
];

export const ALL_STAGE_IDS = STAGE_CATEGORIES.map((c) => c.id);

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const DAY_NAMES = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];

export const TYPE_CONFIG: Record<
  string,
  {
    bgBar: string;
    bgLight: string;
    bgBarHex: string;
    badgeClass: string;
    label: string;
    borderClass: string;
    textClass: string;
    dotClass: string;
  }
> = {
  INITIATION: {
    bgBar: "bg-sky-400",
    bgBarHex: "#38bdf8",
    bgLight: "bg-sky-50",
    badgeClass: "bg-sky-100 text-sky-800 border-sky-200",
    label: "Initiation",
    borderClass: "border-sky-400",
    textClass: "text-sky-600",
    dotClass: "bg-sky-400",
  },
  PROGRESSION: {
    bgBar: "bg-blue-500",
    bgBarHex: "#3b82f6",
    bgLight: "bg-blue-50",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Progression",
    borderClass: "border-blue-500",
    textClass: "text-blue-700",
    dotClass: "bg-blue-500",
  },
  AUTONOMIE: {
    bgBar: "bg-blue-800",
    bgBarHex: "#1e40af",
    bgLight: "bg-blue-50",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
    label: "Autonomie",
    borderClass: "border-blue-800",
    textClass: "text-blue-900",
    dotClass: "bg-blue-800",
  },
  DOUBLE: {
    bgBar: "bg-violet-500",
    bgBarHex: "#8b5cf6",
    bgLight: "bg-violet-50",
    badgeClass: "bg-violet-100 text-violet-800 border-violet-200",
    label: "Initiation + Progression",
    borderClass: "border-violet-400",
    textClass: "text-violet-700",
    dotClass: "bg-violet-500",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDOWSun(date: Date): number {
  return date.getDay();
}

function stageMatchesTypes(stage: Stage, selectedTypes: string[]): boolean {
  return selectedTypes.some((type) => {
    if (stage.type === type) return true;
    if (stage.type === "DOUBLE" && (type === "INITIATION" || type === "PROGRESSION")) return true;
    return false;
  });
}

export function initTypesFromParam(param: string | null): string[] {
  if (!param || param === "all") return ALL_STAGE_IDS;
  const types = param.split(",").filter((t) => ALL_STAGE_IDS.includes(t));
  return types.length > 0 ? types : ALL_STAGE_IDS;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface StageCalendarPickerProps {
  selectedTypes: string[];
  onSlotSelect: (slot: Stage) => void;
  selectedSlot: Stage | null;
  onStagesAccumulated: (stages: Stage[]) => void;
  onViewDateChange?: (date: Date) => void;
  defaultViewDate?: Date;
}

export function StageCalendarPicker({
  selectedTypes,
  onSlotSelect,
  selectedSlot,
  onStagesAccumulated,
  onViewDateChange,
  defaultViewDate,
}: StageCalendarPickerProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayKey = getDateKey(today);

  const [viewDate, setViewDate] = useState<Date>(
    () => defaultViewDate ?? new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [tooltipStage, setTooltipStage] = useState<{
    stage: Stage;
    avail: AvailData | null | undefined;
  } | null>(null);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailData | null>>({});
  const [loadingAvail, setLoadingAvail] = useState(false);

  const stageCache = useRef<Map<string, Stage[]>>(new Map());
  const isAutoNavigating = useRef(true);
  const [localStages, setLocalStages] = useState<Stage[]>([]);
  const [loadingStages, setLoadingStages] = useState(false);

  const typesKey = selectedTypes.join(",");

  useEffect(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const cacheKey = `${year}-${month}-${typesKey}`;

    if (stageCache.current.has(cacheKey)) {
      setLocalStages(stageCache.current.get(cacheKey)!);
      return;
    }

    const ctrl = new AbortController();
    setLoadingStages(true);

    const from = new Date(year, month, 1).toISOString().split("T")[0];
    const to = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const apiTypes = [...selectedTypes];
    if (selectedTypes.includes("INITIATION") || selectedTypes.includes("PROGRESSION")) {
      if (!apiTypes.includes("DOUBLE")) apiTypes.push("DOUBLE");
    }

    const params = new URLSearchParams({ from, to, types: apiTypes.join(",") });

    fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/stages?${params}`, {
      signal: ctrl.signal,
      headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;
        const stages: Stage[] = data.data;
        stageCache.current.set(cacheKey, stages);
        setLocalStages(stages);

        if (isAutoNavigating.current) {
          const hasUpcoming = stages.some((s) => {
            const d = new Date(s.startDate);
            d.setHours(0, 0, 0, 0);
            return d >= today;
          });
          if (!hasUpcoming) {
            const nextMonth = new Date(year, month + 1, 1);
            const maxDate = new Date(today.getFullYear(), today.getMonth() + 12, 1);
            if (nextMonth < maxDate) {
              setViewDate(nextMonth);
              onViewDateChange?.(nextMonth);
            } else {
              isAutoNavigating.current = false;
            }
          } else {
            isAutoNavigating.current = false;
          }
        }

        const deduped = new Map<string, Stage>();
        stageCache.current.forEach((monthStages) =>
          monthStages.forEach((s) => deduped.set(s.id, s)),
        );
        onStagesAccumulated(Array.from(deduped.values()));
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Erreur chargement stages:", err);
      })
      .finally(() => setLoadingStages(false));

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [`${viewDate.getFullYear()}-${viewDate.getMonth()}`, typesKey]);

  const filteredStages = useMemo(() => {
    return localStages
      .filter((s) => {
        const d = new Date(s.startDate);
        d.setHours(0, 0, 0, 0);
        return d >= today && stageMatchesTypes(s, selectedTypes);
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [localStages, selectedTypes, today]);

  const stagesKey = filteredStages.map((s) => s.id).join(",");
  useEffect(() => {
    if (filteredStages.length === 0) {
      setAvailabilityMap({});
      return;
    }
    setLoadingAvail(true);
    const ctrl = new AbortController();

    fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/availability/check-batch`, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
      body: JSON.stringify({
        items: filteredStages.map((s) => ({ type: "stage", itemId: s.id })),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAvailabilityMap(data.data);
      })
      .catch(() => {})
      .finally(() => setLoadingAvail(false));

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagesKey]);

  const calendarDays = useMemo((): CalDay[] => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay();

    const days: CalDay[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      date.setHours(0, 0, 0, 0);
      days.push({ date, key: getDateKey(date), isPast: date < today, isOutOfMonth: true });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);
      days.push({ date, key: getDateKey(date), isPast: date < today, isOutOfMonth: false });
    }

    let nextDay = 1;
    while (days.length % 7 !== 0) {
      const date = new Date(year, month + 1, nextDay++);
      date.setHours(0, 0, 0, 0);
      days.push({ date, key: getDateKey(date), isPast: date < today, isOutOfMonth: true });
    }

    return days;
  }, [viewDate, today]);

  const weeksData = useMemo((): WeekData[] => {
    const chunks: (typeof calendarDays)[number][][] = [];
    for (let i = 0; i < calendarDays.length; i += 7)
      chunks.push(calendarDays.slice(i, i + 7));

    return chunks.map((weekDays) => {
      const firstActual = weekDays[0];

      const weekSunday = new Date(firstActual.date);
      weekSunday.setDate(weekSunday.getDate() - getDOWSun(weekSunday));
      weekSunday.setHours(0, 0, 0, 0);
      const weekSaturday = new Date(weekSunday);
      weekSaturday.setDate(weekSaturday.getDate() + 6);
      weekSaturday.setHours(0, 0, 0, 0);

      const overlapping = filteredStages.filter((stage) => {
        const s = new Date(stage.startDate);
        s.setHours(0, 0, 0, 0);
        const e = new Date(stage.startDate);
        e.setDate(e.getDate() + stage.duration - 1);
        e.setHours(0, 0, 0, 0);
        return e >= weekSunday && s <= weekSaturday;
      });

      const segments = overlapping.map((stage) => {
        const stageStart = new Date(stage.startDate);
        stageStart.setHours(0, 0, 0, 0);
        const stageEnd = new Date(stage.startDate);
        stageEnd.setDate(stageEnd.getDate() + stage.duration - 1);
        stageEnd.setHours(0, 0, 0, 0);

        const segStart = stageStart < weekSunday ? weekSunday : stageStart;
        const segEnd = stageEnd > weekSaturday ? weekSaturday : stageEnd;

        return {
          stage,
          colStart: getDOWSun(segStart) + 1,
          colEnd: getDOWSun(segEnd) + 1,
          isContinuation: stageStart < weekSunday,
          continuesNext: stageEnd > weekSaturday,
        };
      });

      segments.sort(
        (a, b) => a.colStart - b.colStart || b.colEnd - b.colStart - (a.colEnd - a.colStart),
      );

      const rows: number[] = [];
      for (let i = 0; i < segments.length; i++) {
        let row = 0;
        let conflict = true;
        while (conflict) {
          conflict = false;
          for (let j = 0; j < i; j++) {
            if (
              rows[j] === row &&
              segments[j].colStart <= segments[i].colEnd &&
              segments[j].colEnd >= segments[i].colStart
            ) {
              conflict = true;
              break;
            }
          }
          if (conflict) row++;
        }
        rows.push(row);
      }

      const events: WeekEventSegment[] = segments.map((s, i) => ({ ...s, rowIndex: rows[i] }));
      const maxRowIndex = events.reduce((m, e) => Math.max(m, e.rowIndex), -1);
      return { days: weekDays, events, maxRowIndex };
    });
  }, [calendarDays, filteredStages]);

  const hasAnyStages = filteredStages.length > 0;
  const currentMonthHasStages = weeksData.some((w) => w.events.length > 0);

  return (
    <>
      <div className="relative space-y-3">
        {loadingStages && (
          <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center pointer-events-auto">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-slate-200">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-slate-600 font-medium">Chargement…</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              isAutoNavigating.current = false;
              const d = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
              setViewDate(d);
              onViewDateChange?.(d);
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base sm:text-lg text-slate-800 capitalize">
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h3>
            {loadingAvail && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              isAutoNavigating.current = false;
              const d = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
              setViewDate(d);
              onViewDateChange?.(d);
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">
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

          {weeksData.map((week, weekIdx) => (
            <div key={weekIdx} className="relative border-b border-slate-200 last:border-b-0">
              <div className="absolute inset-0 grid grid-cols-7 pointer-events-none z-0">
                {week.days.map((day, di) => (
                  <div key={di} className={day.isOutOfMonth ? "bg-slate-200/70" : ""} />
                ))}
              </div>

              <div className="grid grid-cols-7 divide-x divide-slate-100">
                {week.days.map((day, di) => {
                  const isToday = day.key === todayKey;
                  const isSelected =
                    selectedSlot &&
                    getDateKey(new Date(selectedSlot.startDate)) === day.key;
                  return (
                    <div
                      key={di}
                      className={cn(
                        "text-right px-1.5 pt-1 pb-0.5 text-xs leading-none",
                        day.isOutOfMonth
                          ? "text-slate-300"
                          : day.isPast
                            ? "text-slate-400"
                            : "text-slate-600",
                        isToday ? "bg-blue-100 font-bold text-blue-700" : "",
                        isSelected && !day.isOutOfMonth ? "bg-green-50" : "",
                      )}
                    >
                      {day.date.getDate()}
                    </div>
                  );
                })}
              </div>

              <div
                className="relative z-[1] grid grid-cols-7 px-0 pb-1.5 pt-0.5"
                style={{
                  gridTemplateRows: `repeat(${Math.max(week.maxRowIndex + 1, 1)}, 24px)`,
                  rowGap: "3px",
                  minHeight: "40px",
                }}
              >
                {week.events.map((ev, ei) => {
                  const cfg = TYPE_CONFIG[ev.stage.type];
                  const hex = cfg?.bgBarHex ?? "#94a3b8";
                  const avail = availabilityMap[ev.stage.id];
                  const places = avail?.availablePlaces ?? ev.stage.places;
                  const isAvail = avail?.available ?? true;
                  const isSelected = selectedSlot?.id === ev.stage.id;
                  const isHovered = hoveredStageId === ev.stage.id;
                  const isPromo = !!(
                    ev.stage.promotionOriginalPrice &&
                    ev.stage.price < ev.stage.promotionOriginalPrice
                  );

                  const borderL = ev.isContinuation ? "none" : `1.5px solid ${hex}`;
                  const borderR = ev.continuesNext ? "none" : `1.5px solid ${hex}`;
                  const borderTB = `1.5px solid ${hex}`;
                  const radiusL = ev.isContinuation ? "0" : "4px";
                  const radiusR = ev.continuesNext ? "0" : "4px";

                  return (
                    <button
                      key={`${ev.stage.id}-${ei}`}
                      type="button"
                      onClick={() => {
                        if (isAvail) onSlotSelect(ev.stage);
                      }}
                      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                      onMouseEnter={() => {
                        setHoveredStageId(ev.stage.id);
                        setTooltipStage({ stage: ev.stage, avail: availabilityMap[ev.stage.id] });
                      }}
                      onMouseLeave={() => {
                        setHoveredStageId(null);
                        setTooltipStage(null);
                        setMousePos(null);
                      }}
                      style={{
                        gridColumn: `${ev.colStart} / ${ev.colEnd + 1}`,
                        gridRow: ev.rowIndex + 1,
                        backgroundColor: isHovered || isSelected ? hex : `${hex}18`,
                        borderTop: borderTB,
                        borderBottom: borderTB,
                        borderLeft: borderL,
                        borderRight: borderR,
                        borderRadius: `${radiusL} ${radiusR} ${radiusR} ${radiusL}`,
                        color: isHovered || isSelected ? "#ffffff" : hex,
                        outline: isHovered || isSelected ? `2px solid ${hex}` : "none",
                        outlineOffset: "-1px",
                        marginLeft: ev.isContinuation ? "0" : "2px",
                        marginRight: ev.continuesNext ? "0" : "2px",
                        opacity: !isAvail ? 0.55 : 1,
                      }}
                      className={cn(
                        "flex items-center overflow-hidden text-xs font-semibold",
                        "transition-all duration-100 cursor-pointer select-none",
                        "focus-visible:outline-none",
                      )}
                    >
                      {!ev.isContinuation && (
                        <span className="truncate px-1.5 leading-none whitespace-nowrap">
                          {cfg?.label}
                          <span className="font-normal opacity-80">
                            {" - "}
                            {avail !== undefined && (
                              <span className="font-normal opacity-70">
                                {isAvail ? `${places} places` : " · Complet"}
                              </span>
                            )}
                            {" · "}
                            {isPromo ? (
                              <>
                                <span style={{ textDecoration: "line-through", opacity: 0.6 }}>
                                  {ev.stage.promotionOriginalPrice}€
                                </span>{" "}
                                {ev.stage.price}€
                              </>
                            ) : (
                              <>{ev.stage.price}€</>
                            )}
                          </span>
                          {isPromo && (
                            <span
                              className="ml-1 inline-flex items-center font-bold text-white rounded shrink-0"
                              style={{ backgroundColor: "#ef4444", fontSize: "8px", padding: "1px 3px" }}
                            >
                              PROMO
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {hasAnyStages &&
          (() => {
            const usedTypes = [...new Set(filteredStages.map((s) => s.type))];
            return (
              <div className="flex flex-wrap gap-4 pt-1">
                {usedTypes.map((type) => {
                  const cfg = TYPE_CONFIG[type];
                  return cfg ? (
                    <div key={type} className="flex items-center gap-1.5">
                      <span className={cn("inline-block w-4 h-2.5 rounded-sm shrink-0", cfg.bgBar)} />
                      <span className="text-xs text-slate-500">{cfg.label}</span>
                    </div>
                  ) : null;
                })}
              </div>
            );
          })()}

        {!hasAnyStages && (
          <div className="text-center py-10">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 text-sm">
              Aucun créneau disponible pour les types sélectionnés.
            </p>
          </div>
        )}
        {hasAnyStages && !currentMonthHasStages && (
          <p className="text-center text-sm text-slate-400 py-2">
            Aucun créneau ce mois — naviguez avec les flèches.
          </p>
        )}
      </div>

      {tooltipStage &&
        mousePos &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: mousePos.x + 14,
              top: mousePos.y - 10,
              transform: "translateY(-100%)",
              zIndex: 9999,
              pointerEvents: "none",
            }}
            className="hidden sm:block bg-white border border-slate-200 shadow-xl rounded-xl max-w-[230px]"
          >
            <div className="p-3 space-y-2">
              {(() => {
                const s = tooltipStage.stage;
                const tcfg = TYPE_CONFIG[s.type];
                const thex = tcfg?.bgBarHex ?? "#94a3b8";
                const ta = tooltipStage.avail;
                const tPlaces = ta?.availablePlaces ?? s.places;
                const tAvail = ta?.available ?? true;
                const tPromo = s.promotionOriginalPrice && s.price < s.promotionOriginalPrice;
                const tStart = new Date(s.startDate);
                const tEnd = new Date(s.startDate);
                tEnd.setDate(tEnd.getDate() + s.duration - 1);
                return (
                  <>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: thex }}
                      />
                      <span className="font-semibold text-sm text-slate-800">{tcfg?.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {tStart.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      {" → "}
                      {tEnd.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <div className="flex items-center gap-2">
                      {tPromo && (
                        <span className="text-xs text-slate-400 line-through">
                          {s.promotionOriginalPrice}€
                        </span>
                      )}
                      <span className="font-bold text-sm" style={{ color: thex }}>
                        {s.price}€
                      </span>
                      {tPromo && (
                        <span className="text-xs font-semibold text-red-500 bg-red-50 px-1 rounded">
                          PROMO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {ta === undefined
                        ? "Chargement…"
                        : tAvail
                          ? `${tPlaces} place${tPlaces > 1 ? "s" : ""} disponible${tPlaces > 1 ? "s" : ""}`
                          : "Complet"}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
