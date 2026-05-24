import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import type { ReservationDetail } from "../types";

export const useGetReservationDetails = (id: string) => {
  return useQuery({
    queryKey: ["reservation-details", id],
    queryFn: async () => {
      const res = await client.api.reservations[":id"].$get({ param: { id } });
      if (!res.ok) throw new Error("Échec de la récupération de la réservation");

      const json = await res.json();
      if (!json.success) {
        throw new Error((json as { message?: string }).message ?? "Réservation non trouvée");
      }

      return (json as { success: true; data: unknown }).data as ReservationDetail;
    },
    enabled: !!id,
  });
};
