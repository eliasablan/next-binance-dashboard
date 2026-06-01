"use client";

import { binanceRestUrl } from "@/services/binance-endpoints";
import { useState, useEffect } from "react";

// Interfaz para la información de símbolos de Binance
interface BinanceSymbol {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  isSpotTradingAllowed: boolean;
}

// Interfaz para la respuesta de exchangeInfo
interface ExchangeInfoResponse {
  symbols: BinanceSymbol[];
}

// Hook personalizado para obtener símbolos de Binance
export function useBinanceSidefinder() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener información de intercambio de Binance
        const response = await fetch(binanceRestUrl("/api/v3/exchangeInfo"));

        if (!response.ok) {
          throw new Error("Error al obtener información de símbolos");
        }

        const data: ExchangeInfoResponse = await response.json();

        // Filtrar solo símbolos USDT que estén activos y permitan trading
        const usdtSymbols = data.symbols
          .filter(
            (symbol) =>
              symbol.quoteAsset === "USDT" &&
              symbol.status === "TRADING" &&
              symbol.isSpotTradingAllowed,
          )
          .map((symbol) => symbol.symbol)
          .sort(); // Ordenar alfabéticamente

        // Tomar solo los primeros 20 símbolos más populares
        // Priorizamos algunos símbolos principales
        const prioritySymbols = [
          "BTCUSDT",
          "ETHUSDT",
          "BNBUSDT",
          "XRPUSDT",
          "ADAUSDT",
          "SOLUSDT",
          "DOGEUSDT",
          "AVAXUSDT",
          "DOTUSDT",
          "MATICUSDT",
          "LINKUSDT",
          "LTCUSDT",
          "UNIUSDT",
          "ATOMUSDT",
          "FILUSDT",
        ];

        // Combinar símbolos de prioridad con otros símbolos USDT
        const otherSymbols = usdtSymbols.filter(
          (symbol) => !prioritySymbols.includes(symbol),
        );
        const finalSymbols = [
          ...prioritySymbols.filter((symbol) => usdtSymbols.includes(symbol)),
          ...otherSymbols.slice(0, 20 - prioritySymbols.length),
        ];

        setSymbols(finalSymbols);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error fetching symbols:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSymbols();
  }, []);

  return { symbols, loading, error };
}
