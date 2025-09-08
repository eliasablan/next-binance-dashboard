import { createStore } from "zustand";

export type DashboardState = {
  price: string;
  interval: string;
  range: string;
  viewerExpanded: boolean;
  chartType: "candlestick" | "line";
};

export type DashboardActions = {
  setPrice: (price: string) => void;
  setInterval: (interval: string) => void;
  setRange: (range: string) => void;
  setViewerExpanded: (finderExpanded: boolean) => void;
  setChartType: (chartType: "candlestick" | "line") => void;
};

export type DashboardStore = DashboardState & DashboardActions;

export const defaultInitialState: DashboardState = {
  price: "-",
  interval: "1m",
  range: "1d",
  viewerExpanded: false,
  chartType: "candlestick",
};

export const createDashboardStore = (
  initialState: DashboardState = defaultInitialState,
) => {
  return createStore<DashboardStore>()((set) => ({
    ...initialState,
    setPrice: (price) => set({ price }),
    setInterval: (interval) => set({ interval }),
    setRange: (range) => set({ range }),
    setViewerExpanded: (viewerExpanded) => set({ viewerExpanded }),
    setChartType: (chartType) => set({ chartType }),
  }));
};
