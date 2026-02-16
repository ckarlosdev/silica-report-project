import { create } from "zustand";
import { persist } from "zustand/middleware";


interface AppContext {
  jobId: number | null;
  silicaId: number | null;
  isLoaded: boolean;
  setIds: (jobId: number | null, silicaId: number | null) => void;
  setIsLoaded: (loaded: boolean) => void;
}

export const useContextStore = create<AppContext>()(
  persist(
    (set) => ({
      jobId: null,
      silicaId: null,
      isLoaded: false,
      setIds: (jobId, silicaId) => set({ jobId, silicaId }),
      setIsLoaded: (loaded) => set({ isLoaded: loaded }),
    }),
    { name: "app-context-storage" }
  )
);