"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { SessionManager } from "@/lib/sessionManager";

export interface ParticipantData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  weight: number;
  height: number;
  birthDate?: string;
  selectedCategory?: string;
  hasVideo?: boolean;
  selectedStageType?: string;
}

interface UseParticipantEditProps {
  participantData: ParticipantData;
  itemId: string;
  onUpdate: () => void;
}

export function useParticipantEdit({ participantData, itemId, onUpdate }: UseParticipantEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: participantData,
  });

  function formatBirthDate(dateString?: string) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      const sessionId = SessionManager.getOrCreateSessionId();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items/${itemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
          body: JSON.stringify({
            participantData: {
              ...data,
              weight: Number(data.weight),
              height: Number(data.height),
              selectedCategory: participantData.selectedCategory,
              selectedStageType: participantData.selectedStageType,
            },
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        toast({
          title: "Modifications enregistrées",
          description: "Les informations du participant ont été mises à jour",
        });
        setIsEditing(false);
        onUpdate();
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Erreur lors de la mise à jour",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  function handleCancel() {
    reset(participantData);
    setIsEditing(false);
  }

  return {
    isEditing,
    setIsEditing,
    isSaving,
    register,
    handleSubmit,
    errors,
    onSubmit,
    handleCancel,
    formatBirthDate,
  };
}
