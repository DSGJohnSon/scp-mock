import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import type { ReservationDetail } from "../types";

export const useGetReservationDetails = (id: string) => {
  const query = useQuery({
    queryKey: ["reservation-details", id],
    queryFn: async () => {
      const response = await client.api.reservations[":id"].$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reservation details");
      }

      const json = await response.json();
      if (!json.success) {
        throw new Error((json as { message?: string }).message ?? "Réservation non trouvée");
      }

      return (json as { success: true; data: unknown }).data as ReservationDetail;
    },
    enabled: !!id,
  });

  return query;
};
