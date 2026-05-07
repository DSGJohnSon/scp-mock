"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, LucideGift } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { StepIndicator } from "@/components/stages/StepIndicator";
import { SuccessDialog } from "@/components/stages/SuccessDialog";
import { SlotRecap } from "@/components/stages/SlotRecap";
import { TypeFilterBar } from "@/components/stages/TypeFilterBar";
import { ParticipantForm } from "@/components/stages/ParticipantForm";
import { StageCalendarPicker, TYPE_CONFIG } from "@/components/stages/StageCalendarPicker";
import { useStageReservation } from "@/hooks/useStageReservation";

// ─── Main Component ───────────────────────────────────────────────────────────

function StageReservationPageContent() {
  const {
    isScrolled,
    isLoading,
    selectedTypes,
    selectedSlot,
    showForm,
    showSuccessDialog,
    setShowSuccessDialog,
    setAccumulatedStages,
    defaultViewDate,
    effectiveCategory,
    resolveEffectiveCategory,
    goToStep1,
    toggleType,
    handleSlotSelect,
    onSubmit,
    router,
  } = useStageReservation();

  return (
    <div className="bg-slate-50 pb-24">
      {/* Sticky header */}
      <div
        className={cn(
          "bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm transition-all ease-in-out duration-300",
          isScrolled ? "pt-0 pb-0" : "pt-8 pb-0",
        )}
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="shrink-0">
              {showForm ? (
                <Button variant="outline" size="sm" onClick={goToStep1}>
                  <ArrowLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Retour</span>
                </Button>
              ) : (
                <Link href="/reserver">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Retour</span>
                  </Button>
                </Link>
              )}
            </div>
            <h1 className="text-base sm:text-xl font-bold text-slate-800 truncate flex-1 text-center sm:text-left">
              Réserver un stage
            </h1>
            <div className="shrink-0">
              <StepIndicator currentStep={showForm ? 2 : 1} onGoToStep1={goToStep1} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 pt-8 space-y-6">
        {showForm && selectedSlot && (
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Votre stage
            </h2>
          </div>
        )}

        {/* ── ÉTAPE 1 : calendrier (masqué en étape 2) ── */}
        {!showForm ? (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Choisissez votre créneau
              </h2>
            </div>

            <TypeFilterBar selectedTypes={selectedTypes} onToggle={toggleType} />

            <Card>
              <CardContent className="p-3 sm:p-5">
                <StageCalendarPicker
                  selectedTypes={selectedTypes}
                  onSlotSelect={handleSlotSelect}
                  selectedSlot={selectedSlot}
                  onStagesAccumulated={setAccumulatedStages}
                  defaultViewDate={defaultViewDate}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          selectedSlot && (
            <SlotRecap
              slot={selectedSlot}
              categoryLabel={TYPE_CONFIG[resolveEffectiveCategory(selectedSlot)]?.label ?? effectiveCategory}
            />
          )
        )}

        {!showForm && !selectedSlot && (
          <div className="flex items-center gap-1">
            <LucideGift className="size-5 text-slate-400 mb-1" />
            <p className="text-sm text-slate-500">
              Vous avez un bon cadeau ?{" "}
              <Link
                href="/utiliser-bon-cadeau"
                className="text-cyan-600 hover:underline font-medium"
              >
                Utilisez-le pour régler votre réservation
              </Link>
            </p>
          </div>
        )}

        {/* ── ÉTAPE 2 ── */}
        {showForm && selectedSlot && (
          <>
            <Separator id="participant-form-separator" />
            <ParticipantForm
              slot={selectedSlot}
              categoryLabel={TYPE_CONFIG[effectiveCategory]?.label ?? effectiveCategory}
              isLoading={isLoading}
              onSubmit={onSubmit}
              onBack={goToStep1}
            />
          </>
        )}
      </div>

      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          setShowSuccessDialog(open);
          if (!open) router.push("/reserver");
        }}
        onContinueShopping={() => {
          setShowSuccessDialog(false);
          router.push("/reserver");
        }}
        onGoToCheckout={() => {
          setShowSuccessDialog(false);
          router.push("/checkout");
        }}
      />
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function StageReservationClientPage() {
  return (
    <Suspense fallback={<div>Chargement…</div>}>
      <StageReservationPageContent />
    </Suspense>
  );
}
