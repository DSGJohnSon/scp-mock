"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllStages } from "@/features/stages/actions";
import { StageItem } from "../_types";

function toStageItem(raw: any): StageItem {
  return {
    id: raw.id,
    startDate: new Date(raw.startDate),
    duration: raw.duration,
    places: raw.places,
    price: raw.price,
    acomptePrice: raw.acomptePrice,
    type: raw.type,
    promotionOriginalPrice: raw.promotionOriginalPrice ?? null,
    promotionEndDate: raw.promotionEndDate ?? null,
    promotionReason: raw.promotionReason ?? null,
    createdAt: new Date(raw.createdAt ?? Date.now()),
    updatedAt: new Date(raw.updatedAt ?? Date.now()),
    moniteurs: (raw.moniteurs ?? []).map((m: any) => ({
      moniteur: {
        id: m.moniteur.id,
        name: m.moniteur.name,
        avatarUrl: m.moniteur.avatarUrl ?? null,
        role: m.moniteur.role,
        email: m.moniteur.email ?? "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })),
    bookings: [],
    confirmedBookings: raw.confirmedBookings ?? 0,
    placesRestantes: raw.availablePlaces ?? raw.places,
  };
}

export function useStagesData() {
  const query = useQuery({
    queryKey: ["stages"],
    queryFn: async () => {
      const result = await getAllStages();
      if (!result.success) throw new Error(result.message);
      return result.data as any[];
    },
    select: (data): StageItem[] => data.map(toStageItem),
  });

  return {
    stages: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
