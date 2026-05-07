"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SessionManager } from "@/lib/sessionManager";
import { useToast } from "@/components/ui/use-toast";
import { type Stage, ALL_STAGE_IDS, initTypesFromParam } from "@/components/stages/StageCalendarPicker";
import { type ParticipantFormData } from "@/components/stages/ParticipantForm";

export function useStageReservation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedTypes, setSelectedTypes] = useState<string[]>(() =>
    initTypesFromParam(searchParams.get("stageType")),
  );
  const [accumulatedStages, setAccumulatedStages] = useState<Stage[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Stage | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const pendingStageId = useRef(searchParams.get("stageId"));
  const defaultViewDate = useMemo(() => {
    const d = searchParams.get("stageDate");
    if (!d) return undefined;
    const parsed = new Date(d);
    return isNaN(parsed.getTime())
      ? undefined
      : new Date(parsed.getFullYear(), parsed.getMonth(), 1);
  }, [searchParams]);

  useEffect(() => {
    if (!pendingStageId.current || accumulatedStages.length === 0) return;
    const match = accumulatedStages.find((s) => s.id === pendingStageId.current);
    if (match) {
      pendingStageId.current = null;
      setSelectedSlot(match);
      setShowForm(true);
    }
  }, [accumulatedStages]);

  const resolveEffectiveCategory = (slot: Stage): string => {
    if (slot.type !== "DOUBLE") return slot.type;
    if (selectedTypes.includes("INITIATION")) return "INITIATION";
    if (selectedTypes.includes("PROGRESSION")) return "PROGRESSION";
    return "INITIATION";
  };

  useEffect(() => {
    const handleScroll = () =>
      setIsScrolled((window.pageYOffset || document.documentElement.scrollTop) > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (showForm) history.pushState({ step: 2 }, "");
  }, [showForm]);

  useEffect(() => {
    const handlePopState = () => {
      if (showForm) {
        setSelectedSlot(null);
        setShowForm(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [showForm]);

  const goToStep1 = () => {
    setSelectedSlot(null);
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleType = (typeId: string) => {
    setSelectedTypes((prev) => {
      if (prev.includes(typeId) && prev.length === 1) return prev;
      const next = prev.includes(typeId)
        ? prev.filter((t) => t !== typeId)
        : [...prev, typeId];
      const param = next.length === ALL_STAGE_IDS.length ? "all" : next.join(",");
      router.replace(`?stageType=${param}`, { scroll: false });
      return next;
    });
    setSelectedSlot(null);
    setShowForm(false);
  };

  const handleSlotSelect = (slot: Stage) => {
    setSelectedSlot(slot);
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const saveUserInfo = (data: ParticipantFormData) => {
    if (data.participantType === "self") {
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          weight: data.weight,
          height: data.height,
          birthDate: data.birthDate,
        }),
      );
    }
  };

  const onSubmit = async (data: ParticipantFormData) => {
    if (!selectedSlot) return;
    setIsLoading(true);
    try {
      saveUserInfo(data);
      const sessionId = SessionManager.getOrCreateSessionId();
      const effectiveCategory = resolveEffectiveCategory(selectedSlot);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
          body: JSON.stringify({
            type: "STAGE",
            itemId: selectedSlot.id,
            participantData: {
              ...data,
              weight: Number(data.weight),
              height: Number(data.height),
              selectedStageType: effectiveCategory,
            },
            quantity: 1,
          }),
        },
      );
      const result = await res.json();
      if (result.success) {
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        toast({
          title: "Place réservée temporairement",
          description: "Cette place est bloquée pendant 1h00.",
          duration: 5000,
        });
        setShowSuccessDialog(true);
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Erreur lors de l'ajout au panier",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout au panier",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const effectiveCategory = selectedSlot ? resolveEffectiveCategory(selectedSlot) : "";

  return {
    isScrolled,
    isLoading,
    selectedTypes,
    selectedSlot,
    showForm,
    showSuccessDialog,
    setShowSuccessDialog,
    accumulatedStages,
    setAccumulatedStages,
    defaultViewDate,
    effectiveCategory,
    resolveEffectiveCategory,
    goToStep1,
    toggleType,
    handleSlotSelect,
    onSubmit,
    router,
  };
}
