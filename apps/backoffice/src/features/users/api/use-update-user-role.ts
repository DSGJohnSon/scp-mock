"use client";

import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.users)[":id"]["role"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.users)[":id"]["role"]["$patch"]
>;

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const res = await client.api.users[":id"].role["$patch"]({ param, json });
      return await res.json();
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
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
