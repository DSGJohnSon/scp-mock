import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

export const useGetPayments = () => {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const response = await client.api.payments.$get();

      if (!response.ok) {
        toast.error("Erreur lors de la récupération des paiements");
        return null;
      }

      const { success, message, data } = await response.json();

      if (!success) {
        toast.error(message);
        return null;
      }

      return data.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));
    },
  });
};
