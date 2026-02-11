import { useMutation, useQueries } from "convex/react";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useCallback, useState } from "react";

export const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

export function makeUseMutationWithStatus(useMutationHook: typeof useMutation) {
  return (mutationReference: any) => {
    const [status, setStatus] = useState<
      "idle" | "pending" | "success" | "error"
    >("idle");
    const [data, setData] = useState<any>();
    const [error, setError] = useState<any>();

    const mutate = useMutationHook(mutationReference);

    const wrappedMutate = useCallback(
      async (...args: any[]) => {
        setStatus("pending");
        setError(undefined);
        try {
          const result = await (mutate as any)(...args);
          setData(result);
          setStatus("success");
          return result;
        } catch (e) {
          setError(e);
          setStatus("error");
          throw e;
        }
      },
      [mutate],
    );

    return {
      mutate: wrappedMutate,
      status,
      data,
      error,
      isPending: status === "pending",
      isSuccess: status === "success",
      isError: status === "error",
      isIdle: status === "idle",
    };
  };
}

export const useMutationWithStatus = makeUseMutationWithStatus(useMutation);
