"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useUpdateStage } from "@/features/stages/api/use-update-stage";
import { EditedStageState, StageWithDetails } from "../_types";

export function useStageEditor(stage: StageWithDetails | null, bookingsCount: number) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStage, setEditedStage] = useState<EditedStageState | null>(null);
  const updateStage = useUpdateStage();

  const startEdit = () => {
    if (!stage) return;
    setEditedStage({
      places: stage.places,
      price: stage.price,
      acomptePrice: stage.acomptePrice,
      moniteurIds: stage.moniteurs.map((m) => m.moniteur.id),
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditedStage(null);
    setIsEditing(false);
  };

  const save = () => {
    if (!editedStage || !stage) return;
    updateStage.mutate(
      {
        param: { id: stage.id },
        json: {
          startDate: new Date(stage.startDate).toISOString(),
          duration: stage.duration,
          places: editedStage.places,
          price: editedStage.price,
          acomptePrice: editedStage.acomptePrice,
          moniteurIds: editedStage.moniteurIds,
          type: stage.type,
        },
      },
      { onSuccess: cancelEdit }
    );
  };

  const increasePlaces = () => {
    if (!editedStage) return;
    setEditedStage({ ...editedStage, places: editedStage.places + 1 });
  };

  const decreasePlaces = () => {
    if (!editedStage) return;
    if (editedStage.places <= bookingsCount) {
      toast.error(`Impossible de réduire en dessous de ${bookingsCount} places`);
      return;
    }
    if (editedStage.places <= 1) {
      toast.error("Le nombre de places doit être supérieur à 0");
      return;
    }
    setEditedStage({ ...editedStage, places: editedStage.places - 1 });
  };

  return {
    isEditing,
    editedStage,
    setEditedStage,
    isSaving: updateStage.isPending,
    startEdit,
    cancelEdit,
    save,
    increasePlaces,
    decreasePlaces,
  };
}
