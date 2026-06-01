"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQueryState } from "nuqs";
import { useDashboardStore } from "@/providers/dashboard-store-provider";
import { useBinanceKlines } from "@/hooks/use-binance-klines";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Rango de tiempo (duplicado del primary chart; ideal extraer a util si se reutiliza más)
const TIME_RANGES = [
  { value: "1h", miliseconds: 1000 * 60 * 60 },
  { value: "4h", miliseconds: 1000 * 60 * 60 * 4 },
  { value: "12h", miliseconds: 1000 * 60 * 60 * 12 },
  { value: "1d", miliseconds: 1000 * 60 * 60 * 24 },
  { value: "2d", miliseconds: 1000 * 60 * 60 * 24 * 2 },
  { value: "1w", miliseconds: 1000 * 60 * 60 * 24 * 7 },
  { value: "1M", miliseconds: 1000 * 60 * 60 * 24 * 30 },
];

const chartConfig = {
  volume: {
    label: "Volumen",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export default function VolumeChartCard() {
  const [symbol] = useQueryState("symbol");
  const { range, interval } = useDashboardStore((s) => s);
  const { candles } = useBinanceKlines(interval);

  const filteredData = useMemo(() => {
    if (!candles.length) return [];
    const latestTime = candles.at(-1)?.time ?? 0;
    const ms = TIME_RANGES.find((r) => r.value === range)?.miliseconds;
    return candles
      .filter((c) => !ms || c.time >= latestTime - ms)
      .map((c, idx, arr) => {
        const prev = arr[idx - 1];
        const isGrowing = c.close >= c.open;
        return {
          time: c.time,
          volume: c.volume ?? 0,
          open: c.open,
          close: c.close,
          isGrowing,
          date: new Date(c.time).toLocaleDateString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            month: "short",
            day: "numeric",
          }),
          changePct: prev ? ((c.close - prev.close) / prev.close) * 100 : 0,
        };
      });
  }, [candles, range]);

  const formatPrice = (v: number) => {
    if (v >= 1_000_000_000) return "$" + (v / 1_000_000_000).toFixed(2) + "B";
    if (v >= 1_000_000) return "$" + (v / 1_000_000).toFixed(2) + "M";
    if (v >= 1_000) return "$" + (v / 1_000).toFixed(2) + "K";
    return "$" + v.toFixed(2).toString();
  };

  // const formatPrice2 = (price: number) => {
  //   return new Intl.NumberFormat("en-US", {
  //     style: "currency",
  //     currency: "USD",
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: price < 1 ? 4 : 2,
  //     maximumSignificantDigits: 8,
  //     useGrouping: true,
  //   }).format(price);
  // };

  if (!symbol) return null;

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      <Card className="flex h-64 flex-col overflow-hidden md:col-span-full">
        <CardHeader className="pb-2">
          <h3 className="font-semibold tracking-tight">Volume</h3>
          {/* <p className="text-muted-foreground text-xs">{symbol} / USDT</p> */}
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={filteredData} margin={{ right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                // tickLine={false}
                // axisLine={false}
                minTickGap={32}
                tickFormatter={(value) => {
                  const d = new Date(value);
                  return d.toLocaleTimeString("es-ES", {
                    // month: "short",
                    // day: "numeric",
                    // hour: "2-digit",
                    // minute: "2-digit",
                    timeStyle: "short",
                  });
                }}
                tickMargin={6}
              />
              <YAxis
                // width={80}
                // tickLine={false}
                // axisLine={false}
                tickFormatter={(v) => formatPrice(v)}
                domain={[0, (dataMax: number) => dataMax * 1.1]}
                orientation="right"
              />
              <ChartTooltip
                // cursor={{ fill: "hsl(var(--muted))", opacity: 0.15 }}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(_, props) => {
                      const [p] = props;
                      if (!p?.payload) return "";
                      return new Date(p.payload.time).toLocaleString("es-ES", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }}
                    formatter={(_, name, props) => {
                      const { payload } = props;
                      if (!payload) return null;
                      return [
                        <div key="vol" className="space-y-1">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Vol:</span>
                            <span className="font-mono">
                              {formatPrice(payload.volume)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Open:</span>
                            <span className="font-mono">{payload.open}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">
                              Close:
                            </span>
                            <span
                              className={`font-mono ${payload.isGrowing ? "text-green-600" : "text-red-600"}`}
                            >
                              {payload.close}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Δ%:</span>
                            <span
                              className={`font-mono ${payload.changePct >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {payload.changePct.toFixed(2)}%
                            </span>
                          </div>
                        </div>,
                      ];
                    }}
                  />
                }
              />
              <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
                {filteredData.map((entry, idx) => (
                  <Cell
                    strokeWidth={1.5}
                    key={`vol-cell-${entry.time}-${idx}`}
                    // fill={entry.isGrowing ? "green" : "red"}
                    fill={"var(--background)"}
                    stroke={entry.isGrowing ? "green" : "red"}
                    // opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      {/* <Card className="aspect-video" />
      <Card className="aspect-video" />
      <Card className="aspect-video" /> */}
    </div>
  );
}
