"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepIndicator({
  currentStep,
  onGoToStep1,
}: {
  currentStep: 1 | 2;
  onGoToStep1?: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <button
        type="button"
        onClick={currentStep === 2 ? onGoToStep1 : undefined}
        className={cn(
          "flex items-center gap-2 transition-opacity",
          currentStep === 2
            ? "cursor-pointer hover:opacity-70"
            : "cursor-default",
        )}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
            currentStep >= 1
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-500",
          )}
        >
          {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
        </div>
        <span
          className={cn(
            "hidden sm:inline text-sm font-medium",
            currentStep >= 1 ? "text-blue-700" : "text-slate-400",
          )}
        >
          Choisir un créneau
        </span>
      </button>
      <div
        className={cn(
          "h-0.5 w-6 sm:w-8 mx-1 transition-colors",
          currentStep >= 2 ? "bg-blue-600" : "bg-slate-200",
        )}
      />
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
            currentStep >= 2
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-500",
          )}
        >
          2
        </div>
        <span
          className={cn(
            "hidden sm:inline text-sm font-medium",
            currentStep >= 2 ? "text-blue-700" : "text-slate-400",
          )}
        >
          Vos informations
        </span>
      </div>
    </div>
  );
}
