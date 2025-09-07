import { useState, useEffect, useRef, useCallback } from "react";

// Interfaz para los datos de ticker en tiempo real
export interface WebSocketTickerData {
  symbol: string;
  price: string;
  priceChangePercent: string;
}

// Interfaz para los datos del stream de ticker
interface TickerStreamData {
  e: string; // Tipo de evento
  E: number; // Tiempo del evento
  s: string; // Símbolo
  c: string; // Precio de cierre (precio actual)
  P: string; // Cambio porcentual de precio
}

// Hook personalizado para manejar WebSocket de Binance
export function useBinanceWebSocket(symbols: string[]) {
  const [tickerData, setTickerData] = useState<
    Map<string, WebSocketTickerData>
  >(new Map());
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const symbolsRef = useRef<string[]>([]);

  // Función para crear la conexión WebSocket
  const createWebSocketConnection = useCallback(() => {
    if (symbols.length === 0) return;

    // Cerrar conexión existente si la hay
    if (wsRef.current) {
      wsRef.current.close();
    }

    setConnectionStatus("connecting");

    // Crear streams para todos los símbolos (ticker de 24h)
    const streams = symbols
      .map((symbol) => `${symbol.toLowerCase()}@ticker`)
      .join("/");
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket conectado a Binance");
        setConnectionStatus("connected");

        // Limpiar timeout de reconexión si existe
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Los datos vienen envueltos en un objeto con stream y data
          if (message.stream && message.data) {
            const data: TickerStreamData = message.data;

            // Actualizar datos del ticker
            setTickerData((prev) => {
              const newMap = new Map(prev);
              newMap.set(data.s, {
                symbol: data.s,
                price: data.c,
                priceChangePercent: data.P,
              });
              return newMap;
            });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
      };

      ws.onclose = (event) => {
        console.log("WebSocket desconectado:", event.code, event.reason);
        setConnectionStatus("disconnected");

        // Intentar reconectar después de 3 segundos si no fue un cierre manual
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Intentando reconectar...");
            createWebSocketConnection();
          }, 3000);
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setConnectionStatus("error");
    }
  }, [symbols]);

  // Efecto para crear/recrear la conexión cuando cambian los símbolos
  useEffect(() => {
    // Solo recrear la conexión si los símbolos han cambiado realmente
    const symbolsChanged =
      symbols.length !== symbolsRef.current.length ||
      symbols.some((symbol, index) => symbol !== symbolsRef.current[index]);

    if (symbolsChanged) {
      symbolsRef.current = symbols;
      createWebSocketConnection();
    }

    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [symbols, createWebSocketConnection]);

  // Función para reconectar manualmente
  const reconnect = () => {
    createWebSocketConnection();
  };

  // Función para obtener datos de un símbolo específico
  const getSymbolData = (symbol: string): WebSocketTickerData | undefined => {
    return tickerData.get(symbol);
  };

  // Convertir Map a Array para facilitar el rendering
  const tickerArray = Array.from(tickerData.values());

  return {
    tickerData: tickerArray,
    connectionStatus,
    reconnect,
    getSymbolData,
  };
}
