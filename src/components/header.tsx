"use client";

import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { Rows4, X } from "lucide-react";
import { Button } from "./ui/button";
import { CryptoNameService } from "@/services/crypto-name";
import { useBinanceKlines } from "@/hooks/use-binance-klines";

// Formatear precio
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    // maximumFractionDigits: price < 1 ? 6 : 2,
    maximumSignificantDigits: 6,
    useGrouping: true,
  }).format(price);
};

export function SiteHeader() {
  // Hook para obtener datos de velas en tiempo real con intervalo configurable
  const { symbol, setSymbol, currentPrice } = useBinanceKlines();
  const { toggleSidebar } = useSidebar();

  console.log({ symbol, currentPrice });
  return (
    <header
      className="bg-background sticky top-0 flex items-center justify-between gap-2 border-b p-4"
      style={{
        height: "var(--header-height)",
      }}
    >
      <div className="flex items-center gap-2">
        <Button
          onClick={() => toggleSidebar()}
          variant="ghost"
          className="-ml-1"
        >
          <span className="sr-only">Open sidebar</span>
          <Rows4 />
        </Button>
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-end gap-2">
          {symbol ? (
            <>
              <span className="font-mono text-2xl font-bold">
                {CryptoNameService.getCryptoName(`${symbol}USDT`)}
              </span>
              <span className="text-muted-foreground font-mono text-lg">
                {formatPrice(parseFloat(currentPrice))}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground font-mono text-lg">
              Select a coin
            </span>
          )}
        </div>
      </div>
      {symbol && (
        <Button
          size="icon"
          variant="link"
          onClick={() => setSymbol(null)}
          className="group"
        >
          <span className="sr-only">Expand Chart</span>
          <X className="group-hover:text-destructive" />
        </Button>
      )}
    </header>
  );
}
