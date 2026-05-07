import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetDashboardStats = (selectedMonth?: string) => {
  const query = useQuery({
    queryKey: ["dashboard-stats", selectedMonth ?? "current"],
    queryFn: async () => {
      // Route has no zValidator so Hono RPC doesn't expose query params in its type.
      // Cast to a named function type that documents the accepted signature.
      type StatsGet = (params?: { query?: { selectedMonth?: string } }) => Promise<Response>;
      const response = await (client.api.dashboard.stats.$get as StatsGet)(
        selectedMonth ? { query: { selectedMonth } } : {},
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
