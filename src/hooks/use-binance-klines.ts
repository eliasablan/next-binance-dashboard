import { useDashboardStore } from "@/providers/dashboard-store-provider";
import { useQueryState } from "nuqs";
import { useEffect, useCallback } from "react";

// Interfaz para los datos de velas
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number; // volumen negociado (puede venir en actualizaciones)
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

  // Función para obtener datos históricos iniciales
  const fetchInitialData = useCallback(async () => {
    try {
      setPrice(0);

      if (!symbol || !interval) {
        return;
      }

      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`,
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
      setPrice(parsed[parsed.length - 1]?.close ?? 0);
    } catch (err) {
      console.error("Error fetching initial klines:", err);
    }
  }, [interval, symbol, setPrice, setCandles]);

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
          volume: parseFloat(k.v),
        };

        setPrice(candle.close);

        // Usar estado actual de candles desde el store (sin setter funcional disponible)
        // Nota: Al no tener acceso directo al valor previo aquí, asumimos 'candles' es el snapshot actual.
        // Para evitar condiciones de carrera rápidas, esta frecuencia (1 msg/s en 1m) es segura.
        const prev = candles;
        let updated: Candle[];
        if (prev.length === 0) {
          updated = [candle];
        } else {
          const last = prev[prev.length - 1];
          if (candle.time < last.time) {
            updated = prev; // ignorar desorden
          } else if (last.time === candle.time) {
            const merged: Candle = {
              time: last.time,
              open: last.open,
              high: Math.max(last.high, candle.high),
              low: Math.min(last.low, candle.low),
              close: candle.close,
              volume: candle.volume ?? last.volume,
            };
            updated = [...prev.slice(0, -1), merged];
          } else {
            const next = [...prev, candle];
            const MAX = 100;
            updated = next.length > MAX ? next.slice(-MAX) : next;
          }
        }
        setCandles(updated);
      } catch (error) {
        console.error("Error parsing kline WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("Kline WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("Kline WebSocket desconectado:", event.code, event.reason);
    };

    return () => {
      ws.close();
    };
  }, [symbol, interval, candles, setPrice, setCandles]);

  return {
    candles,
    symbol,
    setSymbol,
    currentPrice: price,
  };
}
