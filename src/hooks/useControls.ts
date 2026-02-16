import { useQuery } from "@tanstack/react-query";
import type { Control } from "../types";
import { api } from "./apiConfig";

const queryControls = (): Promise<Control[]> => {
  return api.get("v1/controls").then((response) => response.data);
};

function usecontrols() {
  return useQuery({
    queryKey: ["controls"],
    queryFn: queryControls,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}

export default usecontrols;