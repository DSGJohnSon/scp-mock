import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import type { OrderDetail } from "../types";

export const useGetOrderDetails = (id: string) => {
  return useQuery({
    queryKey: ["order-details", id],
    queryFn: async () => {
      const response = await client.api.orders[":id"].details.$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const json = await response.json();
      if (!json.success) throw new Error((json as { message?: string }).message);
      return (json as { success: true; data: unknown }).data as OrderDetail;
    },
    enabled: !!id,
  });
};
