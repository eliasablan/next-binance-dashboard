"use client";

import { useBinanceKlines } from "@/hooks/use-binance-klines";
import PrimaryChartCard from "./primary-chart-card";
import VolumeChartCard from "./volume-chart-card";

export default function ChartsSection() {
  const { symbol } = useBinanceKlines();

  if (!symbol) return null;

  return (  
    <div className="flex grow flex-col gap-2">
      <PrimaryChartCard />
      <VolumeChartCard />
    </div>
  );
}
