"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGE_CATEGORIES = [
  { id: "INITIATION", name: "Stage Initiation", durationDays: 7 },
  { id: "PROGRESSION", name: "Stage Progression", durationDays: 7 },
  { id: "AUTONOMIE", name: "Stage Autonomie", durationDays: 14 },
];

const TYPE_STYLE: Record<string, { bgLight: string; textClass: string; dotClass: string }> = {
  INITIATION: { bgLight: "bg-sky-50", textClass: "text-sky-600", dotClass: "bg-sky-400" },
  PROGRESSION: { bgLight: "bg-blue-50", textClass: "text-blue-700", dotClass: "bg-blue-500" },
  AUTONOMIE: { bgLight: "bg-blue-50", textClass: "text-blue-900", dotClass: "bg-blue-800" },
};

interface TypeFilterBarProps {
  selectedTypes: string[];
  onToggle: (typeId: string) => void;
}

export function TypeFilterBar({ selectedTypes, onToggle }: TypeFilterBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-semibold text-slate-600 shrink-0">
        Filtrer par type :
      </span>
      {STAGE_CATEGORIES.map((cat) => {
        const isChecked = selectedTypes.includes(cat.id);
        const style = TYPE_STYLE[cat.id];
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onToggle(cat.id)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
              isChecked
                ? `${style.bgLight} ${style.textClass}`
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700",
            )}
          >
            <span
              className={cn(
                "inline-flex items-center justify-center w-3.5 h-3.5 rounded shrink-0 transition-all",
                isChecked
                  ? `${style.dotClass} border-transparent`
                  : "border border-slate-300 bg-white",
              )}
            >
              {isChecked && (
                <Check className="w-2 h-2 text-white" strokeWidth={3} />
              )}
            </span>
            {cat.name}
            <span className="opacity-60 font-normal">{cat.durationDays}j</span>
          </button>
        );
      })}
    </div>
  );
}
