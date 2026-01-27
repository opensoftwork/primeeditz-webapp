import { create } from "zustand";

interface BreadcrumbStore {
  overrides: Record<string, string>;
  setOverride: (segment: string, label: string) => void;
  removeOverride: (segment: string) => void;
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  overrides: {},
  setOverride: (segment, label) =>
    set((state) => ({
      overrides: { ...state.overrides, [segment]: label },
    })),
  removeOverride: (segment) =>
    set((state) => {
      const { [segment]: _, ...rest } = state.overrides;
      return { overrides: rest };
    }),
}));
