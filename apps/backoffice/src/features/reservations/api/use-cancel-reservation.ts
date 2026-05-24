import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const res = await client.api.reservations[":id"]["$delete"]({ param: { id } });
      return res.json();
    },
    onSuccess: (response: unknown) => {
      const r = response as { success: boolean; message: string };
      if (r.success) {
        toast.success(r.message);
        queryClient.invalidateQueries({ queryKey: ["reservations"] });
        queryClient.invalidateQueries({ queryKey: ["reservation-details"] });
      } else {
        toast.error(r.message);
      }
    },
    onError: (error) => toast.error(error.message),
  });
};
