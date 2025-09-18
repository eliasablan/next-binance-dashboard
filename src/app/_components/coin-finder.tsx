"use client";

import * as React from "react";
import { useQueryState } from "nuqs";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Star, TrendingUp } from "lucide-react";
import { CryptoNameService } from "@/services/crypto-name";
import { useLocalStorage } from "usehooks-ts";
import { useBinanceWebSocket } from "@/hooks/use-binance-websockets";
import { cn } from "@/lib/utils";
import BaseCoinSelect from "@/components/base-coin-select";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

type SymbolEntry = {
  symbol: string;
  base: string;
  name: string;
};

// Helper to format price
function formatPrice(value: string | number | undefined) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!num || Number.isNaN(num)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: num < 1 ? 6 : 2,
  }).format(num);
}

export default function CoinFinder() {
  const [symbol, setSymbol] = useQueryState("symbol");
  const [baseCoin] = useLocalStorage<string>("baseCoin", "USDT", {
    deserializer: (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return "";
      }
    },
  });
  const [favouriteCryptos] = useLocalStorage<
    { symbol: string; base: string; name: string }[]
  >("favouriteCryptos", [], {
    deserializer: (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    },
  });

  const [symbols, setSymbols] = React.useState<SymbolEntry[]>([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (!isMobile) {
      inputRef.current?.focus();
    }
  }, [isMobile]);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("https://api.binance.com/api/v3/exchangeInfo");
        if (!res.ok) throw new Error("Error cargando símbolos");
        const data = await res.json();
        interface RawSymbol {
          symbol: string;
          status: string;
          isSpotTradingAllowed: boolean;
        }
        const raw: RawSymbol[] = data.symbols || [];

        const entries: SymbolEntry[] = raw
          .filter(
            (s) =>
              s.symbol.endsWith(baseCoin) &&
              s.status === "TRADING" &&
              s.isSpotTradingAllowed,
          )
          .map((s) => ({
            symbol: s.symbol,
            base: CryptoNameService.getBaseSymbol(s.symbol),
            name: CryptoNameService.getCryptoName(s.symbol),
          }));
        if (!cancelled) setSymbols(entries);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [baseCoin]);

  const cryptoList = React.useMemo(() => {
    // if (!searchValue) return symbols;
    const q = searchValue.toLowerCase();
    return (
      symbols
        // Remove favourites from list
        .filter((s) => favouriteCryptos.every((f) => s.base !== f.base))
        // Remove non-matching symbols
        .filter(
          (s) =>
            s.base.toLowerCase().includes(q) ||
            s.symbol.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q),
        )
    );
  }, [symbols, searchValue, favouriteCryptos]);

  const watchedSymbols = React.useMemo(
    () => favouriteCryptos.map((c) => c.symbol),
    [favouriteCryptos],
  );

  const { getSymbolData } = useBinanceWebSocket(watchedSymbols);

  // Limit displayed results
  const DISPLAY_LIMIT = 10;
  const visibleResults = React.useMemo(
    () => cryptoList.slice(0, DISPLAY_LIMIT),
    [cryptoList],
  );

  const handleSelect = (base: string) => {
    setSymbol(base);
    setSearchValue("");
  };

  if (symbol) return null;

  return (
    <div className="mx-auto mt-12 w-full max-w-4xl px-4">
      <div className="mb-6 text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Search for a cryptocurrency
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Start typing to search by symbol or name (BTC, ETH, Solana...)
        </p>
      </div>
      <Command className="bg-background/60 supports-[backdrop-filter]:bg-background/70 h-auto border shadow-sm backdrop-blur">
        <CommandInput
          ref={inputRef}
          placeholder="Search BTC, ETH, SOL..."
          value={searchValue}
          onValueChange={setSearchValue}
          className="text-base"
        />
        <CommandList className="max-h-[420px] pb-2">
          <CommandGroup heading="Favorites">
            {favouriteCryptos.map((s) => {
              const ws = getSymbolData(s.symbol);
              const price = ws?.price;
              const pct = ws?.priceChangePercent;
              const pctNum = pct ? parseFloat(pct) : 0;
              return (
                <CommandItem
                  key={s.symbol}
                  value={`${s.symbol} ${s.name}`}
                  onSelect={() => handleSelect(s.symbol)}
                  className="items-stretch"
                >
                  <div className="flex flex-1 items-center gap-2 truncate">
                    <Star stroke="black" fill="gold" />
                    <div className="flex flex-col leading-tight">
                      <span className="font-mono text-sm font-semibold">
                        {s.base}
                        <span className="ml-0.5 text-xs font-medium">
                          {baseCoin.toUpperCase()}
                        </span>
                      </span>
                      <span className="text-[11px]">{s.name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="font-mono text-xs">
                      {formatPrice(price)}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] font-medium">
                      <div
                        className={cn(
                          "size-2 rounded-full border",
                          pctNum > 0 && "bg-green-500",
                          pctNum < 0 && "bg-red-500",
                          pctNum === 0 && "bg-muted",
                        )}
                      />
                      {pct ? `${pctNum.toFixed(2)}%` : "--"}
                    </span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
          {isLoading && visibleResults.length < 1 && (
            <div className="flex flex-col items-center justify-center p-1">
              <div className="flex w-full items-start px-2 py-1.5">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="w-full">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex w-full items-center gap-3 px-2 py-1.5"
                  >
                    <TrendingUp className="text-accent size-4 animate-pulse" />

                    <div className="flex flex-col justify-between gap-1.5">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-3.5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {searchValue && !isLoading && <CommandEmpty>No results</CommandEmpty>}

          {!isLoading && visibleResults.length > 0 && (
            <CommandGroup
              heading={
                <div className="flex w-full items-end justify-between">
                  <p>Cryptocurrencies ({visibleResults.length})</p>
                  <BaseCoinSelect className="h-6!" />
                </div>
              }
            >
              {visibleResults.map((s) => {
                return (
                  <CommandItem
                    key={s.symbol}
                    value={`${s.symbol} ${s.name}`}
                    onSelect={() => handleSelect(s.symbol)}
                    className="items-stretch"
                  >
                    <div className="flex flex-1 items-center gap-3 truncate">
                      <TrendingUp className="text-primary" />
                      <div className="flex flex-col leading-tight">
                        <span className="font-mono text-sm font-semibold">
                          {s.base.split(baseCoin)[0]}
                          <span className="ml-0.5 text-xs font-medium">
                            {baseCoin.toUpperCase()}
                          </span>
                        </span>
                        <span className="text-xs">{s.name}</span>
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </div>
  );
}
