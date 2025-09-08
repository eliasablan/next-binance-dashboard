"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQueryState } from "nuqs";
import { useDashboardStore } from "@/providers/dashboard-store-provider";
import { useBinanceKlines } from "@/hooks/use-binance-klines";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from "recharts";
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
  const { candles, loading, error, refetch } = useBinanceKlines(interval);

  const filteredData = useMemo(() => {
    if (!candles.length) return [];
    const now = Date.now();
    const ms = TIME_RANGES.find((r) => r.value === range)?.miliseconds;
    return candles
      .filter((c) => !ms || c.time >= now - ms)
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

  const formatVol = (v: number) => {
    if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(2) + "B";
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(2) + "M";
    if (v >= 1_000) return (v / 1_000).toFixed(2) + "K";
    return v.toString();
  };

  if (!symbol) return null;

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      <Card className="flex h-64 flex-col overflow-hidden md:col-span-full">
        <CardHeader className="pb-2">
          <h3 className="font-semibold tracking-tight">Volume</h3>
          <p className="text-muted-foreground text-xs">{symbol} / USDT</p>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          {loading && filteredData.length === 0 ? (
            <div className="flex h-full items-center justify-center gap-3 text-sm">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2" />
              Cargando volumen...
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center text-sm">
              <p className="text-red-600">Error: {error}</p>
              <button
                onClick={refetch}
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 rounded px-3 py-1 text-xs transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
              Sin datos de volumen
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="h-full w-full overflow-hidden"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData}
                  margin={{ top: 8, right: 12, left: 12, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const d = new Date(value);
                      return d.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }}
                    tickMargin={6}
                  />
                  <YAxis
                    width={52}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatVol(v)}
                    domain={[0, (dataMax: number) => dataMax * 1.1]}
                  />
                  <ChartTooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.15 }}
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        labelFormatter={(_, props) => {
                          const [p] = props;
                          if (!p?.payload) return "";
                          return new Date(p.payload.time).toLocaleString(
                            "es-ES",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          );
                        }}
                        formatter={(_, name, props) => {
                          const { payload } = props;
                          if (!payload) return null;
                          return [
                            <div key="vol" className="space-y-1">
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                  Vol:
                                </span>
                                <span className="font-mono">
                                  {formatVol(payload.volume)}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                  Open:
                                </span>
                                <span className="font-mono">
                                  {payload.open}
                                </span>
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
                                <span className="text-muted-foreground">
                                  Δ%:
                                </span>
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
                        key={`vol-cell-${entry.time}-${idx}`}
                        fill={
                          entry.isGrowing
                            ? "hsl(var(--success, 142 76% 36%))"
                            : "hsl(var(--destructive, 0 72% 51%))"
                        }
                        opacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
      <Card className="aspect-video" />
      <Card className="aspect-video" />
      <Card className="aspect-video" />
    </div>
  );
}
