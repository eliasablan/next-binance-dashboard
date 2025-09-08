import { useDashboardStore } from "@/providers/dashboard-store-provider";
import { useQueryState } from "nuqs";
import { useState, useEffect, useCallback } from "react";

// Interfaz para los datos de velas
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// Interfaz para los datos del WebSocket de klines
interface KlineStreamData {
  e: string; // Tipo de evento
  E: number; // Tiempo del evento
  s: string; // Símbolo
  k: {
    t: number; // Tiempo de apertura de la vela
    T: number; // Tiempo de cierre de la vela
    s: string; // Símbolo
    i: string; // Intervalo
    f: number; // ID del primer trade
    L: number; // ID del último trade
    o: string; // Precio de apertura
    c: string; // Precio de cierre
    h: string; // Precio más alto
    l: string; // Precio más bajo
    v: string; // Volumen del asset base
    n: number; // Número de trades
    x: boolean; // Es esta vela cerrada?
    q: string; // Volumen del asset quote
    V: string; // Volumen de compra del asset base
    Q: string; // Volumen de compra del asset quote
  };
}

// Hook personalizado para manejar datos de velas de Binance
export function useBinanceKlines(interval?: string | undefined) {
  const [symbol, setSymbol] = useQueryState("symbol");
  const { price, setPrice, candles, setCandles } = useDashboardStore(
    (state) => state,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener datos históricos iniciales
  const fetchInitialData = useCallback(async () => {
    try {
      setPrice("0");
      setLoading(true);
      setError(null);

      if (!symbol || !interval) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${interval}`,
      );

      if (!response.ok) {
        throw new Error("Error al obtener datos históricos");
      }

      const data = await response.json();
      const parsed: Candle[] = (
        data as [number, string, string, string, string, string, ...unknown[]][]
      ).map((d) => ({
        time: d[0],
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5]),
      }));

      setCandles(parsed);
      setPrice(parsed[parsed.length - 1]?.close.toFixed(2) ?? "-");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error fetching initial klines:", err);
    } finally {
      setLoading(false);
    }
  }, [interval, symbol, setPrice]);

  // Efecto para obtener datos iniciales cuando cambia el símbolo
  useEffect(() => {
    if (symbol) {
      fetchInitialData();
    }
  }, [symbol, interval, fetchInitialData]);

  // Efecto para manejar WebSocket de klines en tiempo real
  useEffect(() => {
    if (!symbol || !interval) return;

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`,
    );

    ws.onmessage = (event) => {
      try {
        const message: KlineStreamData = JSON.parse(event.data);
        const k = message.k;

        const candle: Candle = {
          time: k.t,
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
        };

        setPrice(candle.close.toFixed(2));

        setCandles((prev) => {
          if (prev.length === 0) return [candle];
          const last = prev[prev.length - 1];

          if (last.time === candle.time) {
            // Reemplazar la última vela (vela actual actualizándose)
            return [...prev.slice(0, -1), candle];
          }

          // Agregar nueva vela y mantener máximo 100 velas
          return [...prev, candle];
        });
      } catch (error) {
        console.error("Error parsing kline WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("Kline WebSocket error:", error);
      setError("Error en conexión WebSocket");
    };

    ws.onclose = (event) => {
      console.log("Kline WebSocket desconectado:", event.code, event.reason);
    };

    return () => {
      ws.close();
    };
  }, [symbol, interval, setPrice]);

  return {
    candles,
    symbol,
    setSymbol,
    currentPrice: price,
    loading,
    error,
    refetch: () => fetchInitialData(),
  };
}
