import { createStore } from "zustand/vanilla";
import { Candle } from "@/hooks/use-binance-klines";

export type DashboardState = {
  price: number;
  interval: string;
  range: string;
  viewerExpanded: boolean;
  chartType: "candlestick" | "line";
  candles: Candle[];
};

export type DashboardActions = {
  setPrice: (price: number) => void;
  setInterval: (interval: string) => void;
  setRange: (range: string) => void;
  setViewerExpanded: (finderExpanded: boolean) => void;
  setChartType: (chartType: "candlestick" | "line") => void;
  setCandles: (candles: Candle[]) => void;
};

export type DashboardStore = DashboardState & DashboardActions;

export const defaultInitialState: DashboardState = {
  price: 0,
  interval: "1h",
  range: "1d",
  viewerExpanded: false,
  chartType: "candlestick",
  candles: [],
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
    setCandles: (candles) => set({ candles }),
  }));
};
