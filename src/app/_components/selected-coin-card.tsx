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

function formatPrice(value: string | number | undefined) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!num || Number.isNaN(num)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: num < 1 ? 6 : 2,
  }).format(num);
}

export interface SelectedCoinCardProps {
  symbol: string;
}

export function SelectedCoinCard({ symbol }: SelectedCoinCardProps) {
  // Solo nos interesa el precio de este símbolo
  const { currentPrice, symbol: selectedSymbol } = useBinanceKlines();

  const [favouriteCryptos, setFavouriteCryptos] = useLocalStorage<
    { symbol: string; name: string }[]
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
    (crypto) => crypto.symbol === selectedSymbol,
  );

  function toggleFavourite() {
    if (!selectedSymbol || !CryptoNameService.getCryptoName(selectedSymbol))
      return;

    const stockToToggle = {
      symbol: selectedSymbol,
      name: CryptoNameService.getCryptoName(selectedSymbol),
    };

    if (isFavourite) {
      // Remover de favoritos
      setFavouriteCryptos((prev) =>
        prev.filter((crypto) => crypto.symbol !== selectedSymbol),
      );
    } else {
      // Agregar a favoritos
      setFavouriteCryptos((prev) => [...prev, stockToToggle]);
    }
  }

  return (
    <Card className="h-fit w-full flex-none md:w-[350px]">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>
          {CryptoNameService.getCryptoName(symbol)}
          <span className="text-muted-foreground ml-2 text-xs">{symbol}</span>
        </CardTitle>
        <CardAction>
          <Button
            className={cn(
              "hover:bg-yellow-200/70!",
              isFavourite && "border-yellow-500/50! bg-yellow-100/50!",
            )}
            size="icon"
            variant="outline"
            onClick={toggleFavourite}
          >
            <Star
              fill={isFavourite ? "yellow" : "none"}
              stroke={isFavourite ? "yellow" : "currentColor"}
              className={"hover:motion-rotate-in-[0.5turn] size-4"}
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
