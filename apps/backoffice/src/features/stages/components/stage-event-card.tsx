"use client";

import React from "react";
import { createPortal } from "react-dom";
import { addDays } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TooltipData {
  stage: StageCalendarEntry;
  x: number;
  y: number;
}

export interface StageCalendarEntry {
  id: string;
  type: string;
  startDate: Date | string;
  duration: number;
  places: number;
  price: number;
  placesRestantes?: number;
  confirmedBookings?: number;
  promotionOriginalPrice?: number | null;
  bookings?: unknown[];
  moniteurs?: Array<{ moniteur: { name: string } }>;
}

export interface StageCardProps {
  stage: StageCalendarEntry;
  spanDays: number;
  dayIndex: number;
  isContinuation: boolean;
  isHovered: boolean;
  isWeekView: boolean;
  stageIndex: number;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}

// ─── Config couleurs ──────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { hex: string; label: string; shortLabel: string }> = {
  INITIATION:  { hex: "#38bdf8", label: "Stage d'initiation",  shortLabel: "Initiation" },
  PROGRESSION: { hex: "#3b82f6", label: "Stage de progression", shortLabel: "Progression" },
  AUTONOMIE:   { hex: "#1e40af", label: "Stage d'autonomie",   shortLabel: "Autonomie" },
  DOUBLE:      { hex: "#8b5cf6", label: "Stage double",        shortLabel: "Double" },
};

const TYPE_BG: Record<string, string> = {
  INITIATION:  "bg-blue-100 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
  PROGRESSION: "bg-green-100 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100",
  AUTONOMIE:   "bg-purple-100 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100",
  DOUBLE:      "bg-orange-100 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100",
};

const TYPE_RING: Record<string, string> = {
  INITIATION:  "ring-blue-400",
  PROGRESSION: "ring-green-400",
  AUTONOMIE:   "ring-purple-400",
  DOUBLE:      "ring-orange-400",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getStageEndDate(stage: StageCalendarEntry): Date {
  return addDays(new Date(stage.startDate), stage.duration - 1);
}

export function getStagesForDay<T extends StageCalendarEntry>(
  stages: T[],
  day: Date,
  dayIndex: number,
  weekStart: Date
): T[] {
  const starting = stages.filter((s) => {
    const start = new Date(s.startDate);
    return (
      start.getFullYear() === day.getFullYear() &&
      start.getMonth() === day.getMonth() &&
      start.getDate() === day.getDate()
    );
  });

  const continuing =
    dayIndex === 0
      ? stages.filter((s) => {
          const start = new Date(s.startDate);
          const end = getStageEndDate(s);
          return start < weekStart && end >= day;
        })
      : [];

  return [...continuing, ...starting];
}

export function getSpanDays<T extends StageCalendarEntry>(
  stage: T,
  day: Date,
  dayIndex: number,
  weekStart: Date,
  totalCols: number
): number {
  const stageStart = new Date(stage.startDate);
  const stageEnd = getStageEndDate(stage);
  const isContinuing = stageStart < weekStart;

  if (isContinuing) {
    const daysToEnd =
      Math.floor((stageEnd.getTime() - day.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(daysToEnd, totalCols);
  } else {
    const remaining = totalCols - dayIndex;
    return Math.min(stage.duration, remaining);
  }
}

// ─── StageTooltip ─────────────────────────────────────────────────────────────

export function StageTooltip({ data }: { data: TooltipData }) {
  const { stage, x, y } = data;
  const cfg = TYPE_CONFIG[stage.type] ?? { hex: "#94a3b8", label: stage.type, shortLabel: stage.type };
  const placesRestantes = stage.placesRestantes ?? 0;
  const confirmedBookings = stage.confirmedBookings ?? stage.bookings?.length ?? 0;
  const hasPromo = !!stage.promotionOriginalPrice;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: x + 14,
        top: y - 10,
        transform: "translateY(-100%)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-3 space-y-2 max-w-[230px]">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: cfg.hex }}
          />
          <span className="text-sm font-semibold text-slate-800 leading-tight">{cfg.label}</span>
        </div>
        <div className="text-xs text-slate-600 space-y-1">
          <div>
            <span className="text-slate-400">Moniteur(s) : </span>
            {stage.moniteurs && stage.moniteurs.length > 0
              ? stage.moniteurs.length === 1
                ? stage.moniteurs[0].moniteur.name
                : `${stage.moniteurs[0].moniteur.name} +${stage.moniteurs.length - 1}`
              : "—"}
          </div>
          <div>
            <span className="text-slate-400">Places restantes : </span>
            <span className="font-semibold" style={{ color: placesRestantes <= 2 ? "#dc2626" : "#16a34a" }}>
              {placesRestantes}
            </span>
            <span className="text-slate-400"> / {stage.places}</span>
          </div>
          <div>
            <span className="text-slate-400">Réservations : </span>
            {confirmedBookings}
          </div>
          <div>
            <span className="text-slate-400">Durée : </span>
            {stage.duration} jour{stage.duration > 1 ? "s" : ""}
          </div>
          {hasPromo ? (
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-red-600">{stage.price}€</span>
              <span className="line-through text-slate-400 text-[11px]">
                {stage.promotionOriginalPrice}€
              </span>
              <span className="bg-red-100 text-red-600 text-[10px] font-semibold px-1 rounded">
                Promo
              </span>
            </div>
          ) : (
            <div>
              <span className="text-slate-400">Prix : </span>
              <span className="font-semibold">{stage.price}€</span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── StageCard ────────────────────────────────────────────────────────────────

export function StageCard({
  stage,
  spanDays,
  dayIndex,
  isContinuation,
  isHovered,
  isWeekView: _isWeekView,
  stageIndex,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onClick,
}: StageCardProps) {
  const cfg = TYPE_CONFIG[stage.type] ?? { hex: "#94a3b8", label: stage.type, shortLabel: stage.type };
  const bgCls = TYPE_BG[stage.type] ?? "bg-gray-100 border-gray-200 text-gray-900";
  const ringCls = TYPE_RING[stage.type] ?? "ring-gray-400";

  const placesRestantes = stage.placesRestantes ?? 0;
  const confirmedBookings = stage.confirmedBookings ?? stage.bookings?.length ?? 0;
  const hasPromo = !!stage.promotionOriginalPrice;
  const moniteurLabel =
    stage.moniteurs && stage.moniteurs.length > 0
      ? stage.moniteurs.length === 1
        ? stage.moniteurs[0].moniteur.name
        : `${stage.moniteurs[0].moniteur.name} +${stage.moniteurs.length - 1}`
      : null;

  return (
    <div
      className={`relative pointer-events-auto cursor-pointer border rounded-md px-2 py-1 text-xs transition-all ${bgCls} ${
        isHovered ? `ring-2 ${ringCls} shadow-lg z-50` : "border"
      }`}
      style={{
        width: `calc(${spanDays * 100}% + ${(spanDays - 1) * 0.5}px)`,
        zIndex: isHovered ? 50 : 10 + stageIndex,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onClick={onClick}
    >
      <div className="font-semibold truncate leading-tight flex items-center gap-1">
        {isContinuation && <span className="opacity-60">↪</span>}
        <span className="truncate">{cfg.shortLabel}</span>
        {hasPromo && (
          <span className="flex-shrink-0 bg-red-500 text-white text-[9px] font-bold px-1 rounded leading-tight">
            PROMO
          </span>
        )}
      </div>

      {moniteurLabel && (
        <div className="text-[10px] opacity-70 truncate leading-tight">{moniteurLabel}</div>
      )}

      <div className="text-[10px] opacity-80 truncate leading-tight">
        <span className={`font-bold ${placesRestantes <= 2 ? "text-red-600 dark:text-red-400" : ""}`}>
          {placesRestantes} places restantes
        </span>
        {" · "}
        {confirmedBookings} rés.
        {" · "}
        {hasPromo ? (
          <span className="font-semibold text-red-600 dark:text-red-400">
            {stage.price}€{" "}
            <span className="line-through opacity-60">{stage.promotionOriginalPrice}€</span>
          </span>
        ) : (
          <span className="font-semibold">{stage.price}€</span>
        )}
      </div>
    </div>
  );
}
