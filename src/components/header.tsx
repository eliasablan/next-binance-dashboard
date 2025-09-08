"use client";

import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { Sidebar } from "lucide-react";
import { Button } from "./ui/button";
import { CryptoNameService } from "@/services/crypto-name";
import { useBinanceKlines } from "@/hooks/use-binance-klines";
import { SearchForm } from "./search-form";

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
  const { symbol, currentPrice } = useBinanceKlines();
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <header
      className="bg-background sticky top-0 z-30 flex items-center justify-between gap-2 border-b p-4"
      style={{
        height: "var(--header-height)",
      }}
    >
      <div className="flex items-center gap-2">
        {isMobile && (
          <>
            <Button
              onClick={() => toggleSidebar()}
              variant="ghost"
              className="-ml-1"
            >
              <span className="sr-only">Open sidebar</span>
              <Sidebar />
            </Button>
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </>
        )}
        <div className="flex items-end gap-2">
          {symbol && (
            <>
              <span className="font-mono text-2xl font-bold">
                {CryptoNameService.getCryptoName(`${symbol}USDT`)}
              </span>
              <span className="text-muted-foreground font-mono text-lg">
                {formatPrice(parseFloat(currentPrice))}
              </span>
            </>
          )}
        </div>
      </div>
      <SearchForm />
    </header>
  );
}
