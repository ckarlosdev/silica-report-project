import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SilicaReport } from "../types";
import { api } from "./apiConfig";
import { useContextStore } from "../stores/useContextStore";
import useSilicaReportStore from "../stores/useSilicaReportStore";

const querySilica = async (silicaId: number): Promise<SilicaReport> => {
  const { data } = await api.get(`v1/silica/${silicaId}`);
  return data;
};

export function useSilicaReport(silicaId: number) {
  return useQuery({
    queryKey: ["silica", silicaId],
    queryFn: () => querySilica(silicaId),
    enabled: !!silicaId,
    retry: false,
  });
}

const createSilicaReport = async ({
  silicaReport,
}: {
  silicaReport: SilicaReport;
}) => {
  if (!silicaReport.silicaId) {
    return api.post("v1/silica", silicaReport);
  }
  return api.put(`v1/silica`, silicaReport);
};

export function useSilica() {
  const queryClient = useQueryClient();
  const jobId = useContextStore((s) => s.jobId);
  const setSilicaReport = useSilicaReportStore((s) => s.setSilicaReport);

  return useMutation({
    mutationKey: ["save-silica"],
    mutationFn: createSilicaReport,
    onSuccess: (response) => {
      const newId = response.data.silicaId;
      queryClient.invalidateQueries({ queryKey: ["silica", newId] });
      setSilicaReport("silicaId", newId);
      alert("Silica report saved successfully!");
      window.location.href = `https://ckarlosdev.github.io/binder-webapp/#/binder/${jobId}`;
    },
    onError: (error) => {
      alert("Error saving silica report: " + error);
    },
  });
}
