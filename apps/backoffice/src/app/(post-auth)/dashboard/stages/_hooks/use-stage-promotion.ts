"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useApplyPromotion } from "@/features/stages/api/use-apply-promotion";
import { useCancelPromotion } from "@/features/stages/api/use-cancel-promotion";
import { StageWithDetails } from "../_types";

const EMPTY_FORM = { newPrice: "", endDate: "", reason: "" };

export function useStagePromotion(stage: StageWithDetails | null) {
  const [form, setForm] = useState(EMPTY_FORM);
  const applyPromotion = useApplyPromotion();
  const cancelPromotion = useCancelPromotion();

  const resetForm = () => setForm(EMPTY_FORM);

  const handleApply = (onSuccess: () => void) => {
    if (!stage) return;
    const newPrice = parseFloat(form.newPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error("Le prix promotionnel doit être supérieur à 0");
      return;
    }
    if (newPrice >= stage.price && !stage.promotionOriginalPrice) {
      toast.error("Le prix promotionnel doit être inférieur au prix actuel");
      return;
    }
    applyPromotion.mutate(
      {
        param: { id: stage.id },
        json: {
          newPrice,
          endDate: form.endDate || undefined,
          reason: form.reason || undefined,
        },
      },
      {
        onSuccess: (res) => {
          if (res.success) { resetForm(); onSuccess(); }
        },
      }
    );
  };

  const handleCancel = (onSuccess: () => void) => {
    if (!stage) return;
    cancelPromotion.mutate({ id: stage.id }, { onSuccess });
  };

  return {
    form,
    setForm,
    handleApply,
    handleCancel,
    resetForm,
    isApplying: applyPromotion.isPending,
    isCancelling: cancelPromotion.isPending,
  };
}
