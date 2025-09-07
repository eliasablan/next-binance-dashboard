"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ChartCandlestick, ChartLine, FullscreenIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { useBinanceKlines, Candle } from "./use-binance-klines";
import { CryptoNameService } from "@/services/crypto-name";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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

  // if (!isGrowing) console.log({ color, height, width, y, x });

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

// Configuración de intervalos de tiempo
const TIME_INTERVALS = [
  { value: "1m", label: "1m", displayName: "1 minuto" },
  { value: "5m", label: "5m", displayName: "5 minutos" },
  { value: "15m", label: "15m", displayName: "15 minutos" },
  { value: "1h", label: "1h", displayName: "1 hora" },
  { value: "4h", label: "4h", displayName: "4 horas" },
  { value: "1d", label: "1d", displayName: "1 día" },
];

export default function PrimaryChartCard() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState<string>("90d");
  const [interval, setInterval] = useState<string>("1h");
  const [chartType, setChartType] = useState<"candlestick" | "line">(
    "candlestick",
  );

  // Obtener símbolo seleccionado desde el contexto (si existe)
  const [activeSymbol] = useQueryState("symbol");

  // Hook para obtener datos de velas en tiempo real con intervalo configurable
  const { candles, currentPrice, loading, error, refetch } =
    useBinanceKlines(interval);

  useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
      setInterval("4h"); // Intervalo más amplio para móvil
    }
  }, [isMobile]);

  // Preparar datos para el gráfico de velas
  const chartData = useMemo(() => {
    return prepareData(candles);
  }, [candles]);

  // Filtrar datos según el rango de tiempo seleccionado
  const filteredData = useMemo(() => {
    const now = Date.now();
    let timeAgoMs = 90 * 24 * 60 * 60 * 1000; // 90 días por defecto

    switch (timeRange) {
      case "1h":
        timeAgoMs = 60 * 60 * 1000;
        break;
      case "4h":
        timeAgoMs = 4 * 60 * 60 * 1000;
        break;
      case "1d":
        timeAgoMs = 24 * 60 * 60 * 1000;
        break;
      case "7d":
        timeAgoMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case "30d":
        timeAgoMs = 30 * 24 * 60 * 60 * 1000;
        break;
      case "90d":
      default:
        timeAgoMs = 90 * 24 * 60 * 60 * 1000;
        break;
    }

    return chartData.filter((item) => item.time >= now - timeAgoMs);
  }, [chartData, timeRange]);

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
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
      useGrouping: true,
    }).format(price);
  };

  console.log({ isExpanded });
  return (
    <Card
      className={cn(
        "@container/card duration-500 ease-in-out",
        isExpanded
          ? "min-h-[calc(100vh-var(--header-height)-2rem)]"
          : "min-h-[calc(60vh)]",
      )}
    >
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex flex-col items-start @xl/card:flex-row @xl/card:items-end @xl/card:gap-2">
          {loading ? (
            <div className="border-primary h-4 w-4 animate-spin rounded-full border-b-2" />
          ) : (
            <>
              <span className="text-2xl">
                {CryptoNameService.getCryptoName(`${activeSymbol}USDT`)}
              </span>
              <span className="text-muted-foreground font-mono text-lg">
                {formatPrice(parseFloat(currentPrice))}
              </span>
            </>
          )}
        </CardTitle>
        <CardAction className="flex flex-col items-end gap-2 @lg/card:flex-row">
          {/* Selector de rango de tiempo */}
          <ToggleGroup
            type="single"
            size="sm"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden @md/card:flex"
          >
            <ToggleGroupItem value="1h">1h</ToggleGroupItem>
            <ToggleGroupItem value="4h">4h</ToggleGroupItem>
            <ToggleGroupItem value="1d">1d</ToggleGroupItem>
            <ToggleGroupItem value="7d">7d</ToggleGroupItem>
            <ToggleGroupItem value="30d">30d</ToggleGroupItem>
            <ToggleGroupItem value="90d">90d</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="flex @md/card:hidden" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="4h">Últimas 4 horas</SelectItem>
              <SelectItem value="1d">Último día</SelectItem>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 3 meses</SelectItem>
            </SelectContent>
          </Select>
          {/* Selector de intervalo */}
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
        </CardAction>
      </CardHeader>
      <CardContent className="flex h-full flex-col items-center justify-center">
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
              No hay datos disponibles para el rango seleccionado
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-full w-full"
          >
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
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <ToggleGroup
          type="single"
          size="sm"
          value={chartType}
          onValueChange={(value) => {
            if (value) setChartType(value as "candlestick" | "line");
          }}
          variant="outline"
          className="flex self-baseline"
        >
          <ToggleGroupItem value="candlestick">
            <ChartCandlestick className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="line">
            <ChartLine className="h-5 w-5" />
          </ToggleGroupItem>
        </ToggleGroup>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          size="sm"
          variant="ghost"
        >
          <FullscreenIcon />
        </Button>
      </CardFooter>
    </Card>
  );
}
