"use client";

import type { WeekEventSegment, AvailData, Stage } from "@/hooks/useStageCalendar";
import { TYPE_CONFIG } from "@/hooks/useStageCalendar";

interface StageCardProps {
  ev: WeekEventSegment;
  availabilityMap: Record<string, AvailData | null>;
  hoveredStageId: string | null;
  onHover: (id: string, stage: Stage, avail: AvailData | null | undefined) => void;
  onLeave: () => void;
  onMouseMove: (x: number, y: number) => void;
  onClick: (stage: Stage) => void;
}

export function StageCard({
  ev,
  availabilityMap,
  hoveredStageId,
  onHover,
  onLeave,
  onMouseMove,
  onClick,
}: StageCardProps) {
  const cfg = TYPE_CONFIG[ev.stage.type];
  const hex = cfg?.bgBarHex ?? "#94a3b8";
  const avail = availabilityMap[ev.stage.id];
  const places = avail?.availablePlaces ?? ev.stage.places;
  const isAvail = avail?.available ?? true;
  const isHovered = hoveredStageId === ev.stage.id;
  const isPromo = !!(ev.stage.promotionOriginalPrice && ev.stage.price < ev.stage.promotionOriginalPrice);

  const borderL = ev.isContinuation ? "none" : `1.5px solid ${hex}`;
  const borderR = ev.continuesNext ? "none" : `1.5px solid ${hex}`;
  const borderTB = `1.5px solid ${hex}`;
  const radiusL = ev.isContinuation ? "0" : "4px";
  const radiusR = ev.continuesNext ? "0" : "4px";

  return (
    <button
      type="button"
      onClick={() => onClick(ev.stage)}
      onMouseMove={(e) => onMouseMove(e.clientX, e.clientY)}
      onMouseEnter={() => onHover(ev.stage.id, ev.stage, availabilityMap[ev.stage.id])}
      onMouseLeave={onLeave}
      style={{
        gridColumn: `${ev.colStart} / ${ev.colEnd + 1}`,
        gridRow: ev.rowIndex + 1,
        backgroundColor: isHovered ? hex : `${hex}18`,
        borderTop: borderTB,
        borderBottom: borderTB,
        borderLeft: borderL,
        borderRight: borderR,
        borderRadius: `${radiusL} ${radiusR} ${radiusR} ${radiusL}`,
        color: isHovered ? "#ffffff" : hex,
        outline: isHovered ? `2px solid ${hex}` : "none",
        outlineOffset: "-1px",
        marginLeft: ev.isContinuation ? "0" : "2px",
        marginRight: ev.continuesNext ? "0" : "2px",
        opacity: !isAvail ? 0.55 : 1,
      }}
      className="flex items-center overflow-hidden text-xs font-semibold transition-all duration-100 select-none cursor-pointer focus-visible:outline-none"
    >
      {!ev.isContinuation && (
        <span className="truncate px-1.5 leading-none whitespace-nowrap">
          {cfg?.label}
          {avail !== undefined && (
            <span className="font-normal opacity-80">
              {isAvail ? ` — ${places} place${places > 1 ? "s" : ""}` : " — Complet"}
            </span>
          )}
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
}
