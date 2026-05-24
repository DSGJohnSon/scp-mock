import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetOrders = () => {
  const query = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await client.api.orders.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const { data } = await response.json();
      if (!data) return [];
      return (data as any[]).map((order) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        payments: (order.payments ?? []).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        })),
        orderItems: (order.orderItems ?? []).map((item: any) => ({
          ...item,
          stage: item.stage
            ? { ...item.stage, startDate: new Date(item.stage.startDate) }
            : null,
        })),
      }));
    },
  });

  return query;
};