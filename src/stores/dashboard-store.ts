import { createStore } from "zustand";
import { Candle } from "@/hooks/use-binance-klines";

export type DashboardState = {
  price: string;
  interval: string;
  range: string;
  viewerExpanded: boolean;
  chartType: "candlestick" | "line";
  candles: Candle[];
  loadingCandles: boolean;
  errorCandles: string | undefined;
};

export type DashboardActions = {
  setPrice: (price: string) => void;
  setInterval: (interval: string) => void;
  setRange: (range: string) => void;
  setViewerExpanded: (finderExpanded: boolean) => void;
  setChartType: (chartType: "candlestick" | "line") => void;
  setCandles: (candles: Candle[]) => void;
  setLoadingCandles: (loading: boolean) => void;
  setErrorCandles: (error: string | undefined) => void;
};

export type DashboardStore = DashboardState & DashboardActions;

export const defaultInitialState: DashboardState = {
  price: "-",
  interval: "1m",
  range: "1d",
  viewerExpanded: false,
  chartType: "line",
  candles: [],
  loadingCandles: false,
  errorCandles: undefined,
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
    setLoadingCandles: (loading) => set({ loadingCandles: loading }),
    setErrorCandles: (error) => set({ errorCandles: error }),
  }));
};
