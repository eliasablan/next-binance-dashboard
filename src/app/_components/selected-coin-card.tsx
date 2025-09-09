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
  const { currentPrice } = useBinanceKlines();

  return (
    <Card className="h-fit w-full flex-none md:w-[350px]">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>
          {CryptoNameService.getCryptoName(symbol)}
          <span className="text-muted-foreground ml-2 text-xs">{symbol}</span>
        </CardTitle>
        <CardAction>
          <Button size="icon" variant="outline">
            <Star className="hover:motion-rotate-in-[0.5turn] size-4" />
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
