import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export interface GetReservationsParams {
  page?: number;
  limit?: number;
  search?: string;
  bookingStatus?: "ALL" | "CONFIRMED" | "CANCELLED";
  startDate?: string;
  endDate?: string;
}

export const useGetReservations = (params: GetReservationsParams = {}) => {
  return useQuery({
    queryKey: ["reservations", params],
    queryFn: async () => {
      const searchParams: Record<string, string> = {};

      if (params.page) searchParams.page = params.page.toString();
      if (params.limit) searchParams.limit = params.limit.toString();
      if (params.search) searchParams.search = params.search;
      if (params.bookingStatus) searchParams.bookingStatus = params.bookingStatus;
      if (params.startDate) searchParams.startDate = params.startDate;
      if (params.endDate) searchParams.endDate = params.endDate;

      const res = await client.api.reservations.$get({ query: searchParams });
      if (!res.ok) throw new Error("Échec de la récupération des réservations");

      const json = await res.json();
      if (!json.success) throw new Error((json as { message?: string }).message ?? "Erreur");

      return (json as { success: true; data: unknown }).data;
    },
  });
};
