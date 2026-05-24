"use client";

import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.users["$post"]>;
type RequestType = InferRequestType<typeof client.api.users["$post"]>;

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const res = await client.api.users["$post"]({ json });
      return await res.json();
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
