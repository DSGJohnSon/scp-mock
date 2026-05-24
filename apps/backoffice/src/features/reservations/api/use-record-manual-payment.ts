import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

interface RecordManualPaymentParams {
  orderItemId: string;
  amount: number;
  paymentMethod: "CARD" | "BANK_TRANSFER" | "CASH" | "CHECK";
  note?: string;
}

export const useRecordManualPayment = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, RecordManualPaymentParams>({
    mutationFn: async (json) => {
      const res = await client.api.reservations["manual-payment"]["$post"]({ json });
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
