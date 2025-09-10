"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { CryptoNameService } from "@/services/crypto-name";
import { useBinanceKlines } from "@/hooks/use-binance-klines";
import { useLocalStorage } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function formatPrice(value: string | number | undefined) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!num || Number.isNaN(num)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: num < 1 ? 6 : 2,
  }).format(num);
}

export function SelectedCoinCard() {
  // Solo nos interesa el precio de este símbolo
  const { currentPrice, symbol } = useBinanceKlines();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [favouriteCryptos, setFavouriteCryptos] = useLocalStorage<
    { symbol: string; base: string; name: string }[]
  >("favouriteCryptos", [], {
    serializer: (value) => JSON.stringify(value),
    deserializer: (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    },
  });

  const isFavourite = favouriteCryptos.some(
    (crypto) => crypto.symbol === symbol,
  );

  function toggleFavourite() {
    if (!symbol || !CryptoNameService.getCryptoName(symbol)) return;

    const stockToToggle = {
      symbol: symbol,
      base: CryptoNameService.getBaseSymbol(symbol),
      name: CryptoNameService.getCryptoName(symbol),
    };

    if (isFavourite) {
      // Remover de favoritos
      setFavouriteCryptos((prev) =>
        prev.filter((crypto) => crypto.symbol !== symbol),
      );
      toast(`${stockToToggle.symbol} eliminado de Favoritos!`);
    } else {
      // Agregar a favoritos
      setFavouriteCryptos((prev) => [...prev, stockToToggle]);
      toast(`${stockToToggle.symbol} agregado a Favoritos!`);
    }
  }

  if (!symbol || !isMounted) return null;

  return (
    <Card className="h-fit w-full flex-none md:w-[350px]">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>
          {CryptoNameService.getCryptoName(symbol)}
          <span className="text-muted-foreground ml-2 text-xs">{symbol}</span>
        </CardTitle>
        <CardAction>
          <Button
            className="group"
            size="icon"
            variant={isFavourite ? "link" : "outline"}
            onClick={toggleFavourite}
          >
            <Star
              stroke="currentColor"
              className={cn(
                "stroke-foreground duration-200",
                isFavourite
                  ? "size-6 animate-bounce fill-yellow-400"
                  : "fill-none",
              )}
            />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-4xl font-bold">
          {formatPrice(currentPrice)}
        </div>
      </CardContent>
    </Card>
  );
}
