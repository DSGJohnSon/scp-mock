"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

// Auth User
import { useCurrent } from "@/features/auth/api/use-current";

// Types
import { StageItem, StageType } from "./_types";

// Custom Hooks
import { useStagesData } from "./_hooks/use-stages-data";
import { useStageModal } from "./_hooks/use-stage-modal";
// Hooks API
import { useCreateStage } from "@/features/stages/api/use-create-stage";

// Components
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/shared/responsive-modal";

import { StageDetailsSheet } from "./_components/(details-stage)/stage-details-modal";
import { Calendar } from "./_components/(calendar)/calendar";
import { StageAddForm } from "./_components/(forms)/stage-add-form";

//---------------------------------------------------------------------------------------

export default function Page() {
  const { stages, isLoading, isError, refetch } = useStagesData();
  const { data: user } = useCurrent();
  const modal = useStageModal();
  const createStage = useCreateStage();

  // Deep-link support: /dashboard/stages?stageId=xxx opens the detail modal directly
  const searchParams = useSearchParams();
  const stageIdFromUrl = searchParams.get("stageId");
  const hasAutoOpened = useRef(false);

  useEffect(() => {
    if (hasAutoOpened.current || !stageIdFromUrl || stages.length === 0) return;
    const target = stages.find((s) => s.id === stageIdFromUrl);
    if (target) {
      hasAutoOpened.current = true;
      modal.openDetail(target);
    }
  }, [stages, stageIdFromUrl, modal]);

  const handleStageClick = (stage: StageItem) => modal.openDetail(stage);
  const handleDayClick = (date: Date) => modal.openCreate(date);
  const handleAddStage = () => modal.openCreate();

  const handleCreateSubmit = (formData: {
    startDate: Date;
    duration: number;
    places: number;
    moniteurIds: string[];
    price: number;
    acomptePrice: number;
    type: StageType;
  }) => {
    createStage.mutate(
      { ...formData, startDate: formData.startDate.toISOString() },
      { onSuccess: () => modal.close() }
    );
  };

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Chargement des stages...
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex flex-1 flex-col p-4">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Impossible de charger les stages.</p>
          <Button variant="outline" onClick={() => refetch()}>Réessayer</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <div className="h-[calc(100vh-120px)]">
        <Calendar
          stages={stages}
          onStageClick={handleStageClick}
          onDayClick={handleDayClick}
          onAddStage={handleAddStage}
          role={user?.role ?? undefined}
        />
      </div>

      <ResponsiveModal
        open={modal.isOpen && modal.mode === "create"}
        onOpenChange={(open) => !open && modal.close()}
        title="Nouveau stage"
      >
        <div className="p-6">
          <StageAddForm
            selectedDate={modal.selectedDate}
            onSubmit={handleCreateSubmit}
            onCancel={modal.close}
            isSubmitting={createStage.isPending}
          />
        </div>
      </ResponsiveModal>

      <StageDetailsSheet
        open={modal.isOpen && modal.mode === "detail"}
        onOpenChange={(open) => !open && modal.close()}
        stage={modal.selectedStage}
        role={user?.role ?? undefined}
      />
    </main>
  );
}
