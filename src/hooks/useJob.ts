import { useQuery } from "@tanstack/react-query";
import type { Job } from "../types";
import { api } from "./apiConfig";

const queryJob = async (jobId: number): Promise<Job> => {
  const { data } = await api.get<Job>(`v1/job/${jobId}`);
  return data;
};

function useJob(jobId: number) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: () => queryJob(jobId!),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
    retry: false,
  });
}

export default useJob;