import { create } from "zustand";
import type { SilicaReport } from "../types";
import { persist } from "zustand/middleware";

type SilicaReportStore = {
  silicaReport: SilicaReport;
  setSilicaReport: <K extends keyof SilicaReport>(
    key: K,
    value: SilicaReport[K],
  ) => void;
  setFullDailyReport: (report: SilicaReport) => void;
  updateSilicaControl: (controlDescriptionId: number, answer: string) => void;
  reset: () => void;
};

const getTodayDate = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date.getTime() - offset)
    .toISOString()
    .split("T")[0];
  return localISOTime;
};

const initialData: SilicaReport = {
  silicaId: null,
  jobsId: 0,
  employeesId: 0,
  eventDate: getTodayDate(),
  workDescription: "",
  ventilationArea: "",
  datePlan: "",
  equipmentDescription: "",
  signatureId: "",
  signatureFolder: "",
  silicaControls: [],
  createdBy: "",
  updatedBy: "",
};

const useSilicaReportStore = create<SilicaReportStore>()(
  persist(
    (set) => ({
      silicaReport: initialData,
      setSilicaReport: (key, value) =>
        set((state) => ({
          silicaReport: {
            ...state.silicaReport,
            [key]: value,
          },
        })),
      updateSilicaControl: (controlDescriptionId: number, answer: string) =>
        set((state) => {
          const currentControls = state.silicaReport.silicaControls || [];

          // Buscamos si ya existe ese ID en el array
          const existingIndex = currentControls.findIndex(
            (c) => c.controlDescriptionId === controlDescriptionId,
          );

          let newControls;
          if (existingIndex !== -1) {
            // Si existe, creamos un nuevo array con el objeto actualizado
            newControls = [...currentControls];
            newControls[existingIndex] = {
              ...newControls[existingIndex],
              controlAnswer: answer,
            };
          } else {
            // Si no existe, lo agregamos
            newControls = [
              ...currentControls,
              {
                silicaControlId: 0, // O el valor que necesites por defecto
                controlDescriptionId: controlDescriptionId,
                controlAnswer: answer,
              },
            ];
          }

          return {
            silicaReport: {
              ...state.silicaReport,
              silicaControls: newControls,
            },
          };
        }),
      setFullDailyReport: (report) =>
        set(() => ({
          silicaReport: report,
        })),
      reset: () =>
        set(() => ({
          silicaReport: initialData,
        })),
    }),
    { name: "silica-report-storage" },
  ),
);

export default useSilicaReportStore;
