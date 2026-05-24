import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.reservations)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.reservations)["$post"]>["json"];

export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.reservations["$post"]({ json });
      return res.json();
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["reservations"] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => toast.error(error.message),
  });
};
