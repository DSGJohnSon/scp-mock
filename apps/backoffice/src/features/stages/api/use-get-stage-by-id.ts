import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetStageById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["stage", id],
    queryFn: async () => {
      const res = await client.api.stages[":id"].$get({ param: { id } });
      if (!res.ok) return null;
      const { success, message, data } = await res.json();
      if (!success) { toast.error(message); return null; }
      return data;
    },
    enabled: !!id && enabled,
  });
};
