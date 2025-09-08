"use client";

import {
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { ChartCandlestick, ChartLine, FullscreenIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { useBinanceKlines, Candle } from "../../hooks/use-binance-klines";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDashboardStore } from "@/providers/dashboard-store-provider";
import { Label } from "@/components/ui/label";

const chartConfig = {
  candlestick: {
    label: "Velas",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

// Componente personalizado para dibujar velas
interface CandlestickProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  low?: number;
  high?: number;
  openClose?: [number, number];
}

const Candlestick: React.FC<CandlestickProps> = (props) => {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    low = 0,
    high = 0,
    openClose = [0, 0],
  } = props;

  const [open, close] = openClose;
  const isGrowing = open < close;
  const color = isGrowing ? "green" : "red";
  const fillColor = isGrowing ? "green" : "red";

  if (height === 0 || Math.abs(open - close) < 0.001) return null;

  const ratio = Math.abs(height / (open - close));

  return (
    <g stroke={color} strokeWidth="1">
      {/* Cuerpo de la vela */}
      <rect
        fill={fillColor}
        stroke={color}
        strokeWidth={1.5}
        x={x}
        width={width}
        // correcciones para que la vela roja se dibuje correctamente
        y={isGrowing ? y : y + height}
        height={Math.abs(height)}
      />
      {/* Línea inferior (sombra) */}
      {isGrowing ? (
        <line
          x1={x + width / 2}
          y1={y + height}
          x2={x + width / 2}
          y2={y + height + (open - low) * ratio}
          stroke={color}
          strokeWidth={1}
        />
      ) : (
        <line
          x1={x + width / 2}
          y1={y}
          x2={x + width / 2}
          y2={y + (close - low) * ratio}
          stroke={color}
          strokeWidth={1}
        />
      )}
      {/* Línea superior (sombra) */}
      {isGrowing ? (
        <line
          x1={x + width / 2}
          y1={y}
          x2={x + width / 2}
          y2={y + (close - high) * ratio}
          stroke={color}
          strokeWidth={1}
        />
      ) : (
        <line
          x1={x + width / 2}
          y1={y + height}
          x2={x + width / 2}
          y2={y + height + (open - high) * ratio}
          stroke={color}
          strokeWidth={1}
        />
      )}
    </g>
  );
};

// Interfaz para los datos del gráfico
interface ChartDataItem {
  time: number;
  high: number;
  low: number;
  open: number;
  close: number;
  openClose: [number, number];
  date: string;
  volume?: number;
}

const prepareData = (candles: Candle[]): ChartDataItem[] => {
  return candles.map(({ open, close, high, low, time }) => ({
    time,
    high,
    low,
    open,
    close,
    openClose: [open, close] as [number, number],
    date: new Date(time).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    }),
  }));
};

// Configuración de intervalos de tiempo de las velas
const TIME_INTERVALS = [
  { order: 1, value: "1m", displayName: "1 minute" },
  { order: 2, value: "3m", displayName: "3 minutes" },
  { order: 3, value: "5m", displayName: "5 minutes" },
  { order: 4, value: "15m", displayName: "15 minutes" },
  { order: 5, value: "30m", displayName: "30 minutes" },
  { order: 6, value: "1h", displayName: "1 hour" },
  { order: 7, value: "2h", displayName: "2 hours" },
  { order: 8, value: "4h", displayName: "4 hours" },
  { order: 9, value: "6h", displayName: "6 hours" },
  { order: 10, value: "8h", displayName: "8 hours" },
  { order: 11, value: "12h", displayName: "12 hours" },
  { order: 12, value: "1d", displayName: "1 day" },
  { order: 13, value: "3d", displayName: "3 days" },
  { order: 14, value: "1w", displayName: "1 week" },
  { order: 15, value: "1M", displayName: "1 month" },
];

// Configuracion de rangos de tiempo del grafico
const TIME_RANGES = [
  {
    order: 1,
    value: "1h",
    displayName: "1 hour",
    miliseconds: 1000 * 60 * 60,
  },
  {
    order: 2,
    value: "4h",
    displayName: "4 hours",
    miliseconds: 1000 * 60 * 60 * 4,
  },
  {
    order: 3,
    value: "12h",
    displayName: "12 hours",
    miliseconds: 1000 * 60 * 60 * 12,
  },
  {
    order: 4,
    value: "1d",
    displayName: "1 day",
    miliseconds: 1000 * 60 * 60 * 24,
  },
  {
    order: 5,
    value: "2d",
    displayName: "2 days",
    miliseconds: 1000 * 60 * 60 * 24 * 2,
  },
  {
    order: 6,
    value: "1w",
    displayName: "1 week",
    miliseconds: 1000 * 60 * 60 * 24 * 7,
  },
  {
    order: 7,
    value: "1M",
    displayName: "1 month",
    miliseconds: 1000 * 60 * 60 * 24 * 30,
  },
];

export default function PrimaryChartCard() {
  const {
    interval,
    setInterval,
    range,
    setRange,
    viewerExpanded,
    setViewerExpanded,
    chartType,
    setChartType,
  } = useDashboardStore((state) => state);
  const [activeSymbol] = useQueryState("symbol");

  // Hook para obtener datos de velas en tiempo real con intervalo configurable
  const { candles, loading, error, refetch } = useBinanceKlines(interval);

  // Preparar datos para el gráfico de velas
  const chartData = useMemo(() => {
    return prepareData(candles);
  }, [candles]);

  // Filtrar datos según el rango de tiempo seleccionado
  const filteredData = useMemo(() => {
    const now = Date.now();
    let timeAgoMs = 0; // 0 por defecto

    const rangeConfig = TIME_RANGES.find((opt) => opt.value === range);
    if (rangeConfig) {
      timeAgoMs = rangeConfig.miliseconds;
    }

    return chartData.filter((item) => item.time >= now - timeAgoMs);
  }, [chartData, range]);

  // Calcular valores mínimos y máximos para el eje Y
  const { minValue, maxValue } = useMemo(() => {
    if (filteredData.length === 0) return { minValue: 0, maxValue: 100 };

    const minValue = filteredData.reduce(
      (min, { low, open, close }) => {
        const currentMin = Math.min(low, open, close);
        return min === null || currentMin < min ? currentMin : min;
      },
      null as number | null,
    );

    const maxValue = filteredData.reduce((max, { high, open, close }) => {
      const currentMax = Math.max(high, open, close);
      return currentMax > max ? currentMax : max;
    }, minValue || 0);

    // Agregar padding del 3% arriba y abajo
    const padding = (maxValue - (minValue || 0)) * 0.03;

    return {
      minValue: Math.max(0, (minValue || 0) - padding),
      maxValue: maxValue + padding,
    };
  }, [filteredData]);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
      maximumSignificantDigits: 8,
      useGrouping: true,
    }).format(price);
  };

  if (!activeSymbol) return null;

  return (
    <Card
      className={cn(
        "@container/card duration-500 ease-in-out",
        viewerExpanded
          ? "h-[calc(100vh-var(--header-height)-1.5rem)]"
          : "h-[calc(60vh-var(--header-height)-1.5rem)]",
      )}
    >
      <CardHeader className="flex w-full flex-row justify-between">
        {/* Selector de rango de tiempo */}
        <div className="flex flex-col gap-2">
          <Label>Chart Range</Label>
          <ToggleGroup
            type="single"
            size="sm"
            value={range}
            onValueChange={setRange}
            variant="outline"
            className="hidden @md/card:flex"
          >
            {TIME_RANGES.map((range) => (
              <ToggleGroupItem key={range.value} value={range.value}>
                {range.value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="flex @md/card:hidden" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Selector de intervalo */}
        <div className="flex flex-col items-end gap-2">
          <Label>Intervals/Candles</Label>
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger className="w-fullt" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_INTERVALS.map((intervalOption) => (
                <SelectItem
                  key={intervalOption.value}
                  value={intervalOption.value}
                >
                  {intervalOption.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* </CardAction> */}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col items-center justify-center overflow-hidden">
        {loading && candles.length === 0 ? (
          <div className="flex items-center space-x-3">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <span>Cargando gráfico...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <button
              onClick={refetch}
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 rounded px-4 py-2 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              {range
                ? "No hay datos disponibles para el rango seleccionado"
                : "Selecciona un rango de tiempo"}
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full">
            {chartType === "line" ? (
              <LineChart
                data={filteredData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("es-ES", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  domain={[minValue, maxValue]}
                  tickFormatter={(value) => formatPrice(value)}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value, props) => {
                        const [data] = props;
                        return new Date(data.payload.time).toLocaleDateString(
                          "es-ES",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        );
                      }}
                      formatter={(value) => {
                        // value puede ser un array o un número, pero para la línea solo será número
                        if (typeof value === "number") {
                          return (
                            <div className="mx-auto">{formatPrice(value)}</div>
                          );
                        }
                        return <div className="mx-auto">{value}</div>;
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Line
                  type="linear"
                  dataKey="close"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : (
              <BarChart
                data={filteredData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    const rangesOrder =
                      TIME_RANGES.find((opt) => opt.value === range)?.order ||
                      1;
                    const intervalOrder =
                      TIME_INTERVALS.find((opt) => opt.value === interval)
                        ?.order || 1;

                    // Mayor que el orden "dia"
                    if (intervalOrder > 8 && rangesOrder > 5) {
                      return date.toLocaleDateString("es-ES", {
                        month: "short",
                        day: "numeric",
                      });
                    }
                    return date.toLocaleDateString("es-ES", {
                      hour: "numeric",
                      minute: "2-digit",
                    });
                  }}
                />
                <YAxis
                  domain={[minValue, maxValue]}
                  tickFormatter={(value) => formatPrice(value)}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value, props) => {
                        const [data] = props;
                        return new Date(data.payload.time).toLocaleDateString(
                          "es-ES",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        );
                      }}
                      formatter={(value, name, props) => {
                        const { payload } = props;
                        if (payload && name === "openClose") {
                          const [open, close] = value as [number, number];
                          const isGrowing = open < close;
                          const changePercent = ((close - open) / open) * 100;

                          return [
                            <div key="candle-info" className="space-y-1">
                              <div className="flex justify-between">
                                <span>Apertura:</span>
                                <span className="font-mono">
                                  {formatPrice(open)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cierre:</span>
                                <span className="font-mono">
                                  {formatPrice(close)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Máximo:</span>
                                <span className="font-mono">
                                  {formatPrice(payload.high)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Mínimo:</span>
                                <span className="font-mono">
                                  {formatPrice(payload.low)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cambio:</span>
                                <span
                                  className={`font-mono ${isGrowing ? "text-green-600" : "text-red-600"}`}
                                >
                                  {isGrowing ? "+" : ""}
                                  {changePercent.toFixed(2)}%
                                </span>
                              </div>
                            </div>,
                            // "Información de la vela",
                          ];
                        }
                        return [value, name];
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Bar
                  dataKey="openClose"
                  fill="transparent"
                  shape={<Candlestick />}
                >
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <div className="flex flex-col gap-2">
          <Label>Chart Type</Label>
          <ToggleGroup
            type="single"
            size="sm"
            value={chartType}
            onValueChange={(value) => {
              if (value) setChartType(value as "candlestick" | "line");
            }}
            variant="outline"
          >
            <ToggleGroupItem value="candlestick">
              <ChartCandlestick className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="line">
              <ChartLine className="h-5 w-5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Label>{viewerExpanded ? "Collapse" : "Expand"}</Label>
          <Button
            onClick={() => setViewerExpanded(!viewerExpanded)}
            size="icon"
            className="size-8"
            variant="outline"
          >
            <FullscreenIcon />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
