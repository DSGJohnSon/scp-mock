import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetDashboardMonthly = (month: string, enabled = true) => {
  return useQuery({
    queryKey: ["dashboard", "monthly", month],
    queryFn: async () => {
      const res = await client.api.dashboard.monthly.$get({ query: { month } });
      if (!res.ok) throw new Error("Failed to fetch monthly dashboard stats");
      const { success, data } = await res.json();
      if (!success) throw new Error("Monthly dashboard stats unavailable");
      return data;
    },
    staleTime: 5 * 60 * 1000,
    enabled,
  });
};
