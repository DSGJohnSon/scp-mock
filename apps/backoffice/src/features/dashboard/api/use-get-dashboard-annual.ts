import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetDashboardAnnual = (enabled = true) => {
  return useQuery({
    queryKey: ["dashboard", "annual"],
    queryFn: async () => {
      const res = await client.api.dashboard.annual.$get();
      if (!res.ok) throw new Error("Failed to fetch annual dashboard stats");
      const { success, data } = await res.json();
      if (!success) throw new Error("Annual dashboard stats unavailable");
      return data;
    },
    staleTime: 10 * 60 * 1000,
    enabled,
  });
};
