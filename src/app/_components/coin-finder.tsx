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
} from "@/components/ui/command";
import { Star, TrendingUp } from "lucide-react";
import { CryptoNameService } from "@/services/crypto-name";
import { useLocalStorage } from "usehooks-ts";
import { useBinanceWebSocket } from "@/hooks/use-binance-websockets";
import { cn } from "@/lib/utils";

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
    serializer: (value) => JSON.stringify(value),
    deserializer: (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    },
  });

  const [allSymbols, setAllSymbols] = React.useState<SymbolEntry[]>([]);
  const [searchValue, setSearchValue] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
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
        if (!cancelled) setAllSymbols(entries);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [favouriteCryptos] = useLocalStorage<
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

  const cryptoList = React.useMemo(() => {
    // if (!searchValue) return allSymbols;
    const q = searchValue.toLowerCase();
    return (
      allSymbols
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
  }, [allSymbols, searchValue, favouriteCryptos]);

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
          placeholder="Search BTC, ETH, SOL..."
          value={searchValue}
          onValueChange={setSearchValue}
          className="text-base"
        />
        <CommandList className="max-h-[420px] pb-2">
          {searchValue && <CommandEmpty>No results</CommandEmpty>}
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
                    <Star stroke="gold" fill="gold" />
                    <div className="flex flex-col leading-tight">
                      <span className="font-mono text-sm font-semibold">
                        {s.base}
                        {/* <span className="text-primary ml-1 text-xs font-light">
                        {s.symbol}
                      </span> */}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        {s.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="font-mono text-xs">
                      {formatPrice(price)}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[10px] font-medium",
                        pctNum > 0 && "text-green-500",
                        pctNum < 0 && "text-red-500",
                        pctNum === 0 && "text-muted-foreground",
                      )}
                    >
                      {pct ? `${pctNum.toFixed(2)}%` : "--"}
                    </span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
          {visibleResults.length > 0 && (
            <CommandGroup
              heading={`Resultados (${Math.min(cryptoList.length, DISPLAY_LIMIT)}${
                cryptoList.length > DISPLAY_LIMIT ? "+" : ""
              })`}
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
                      <TrendingUp className="text-muted-foreground" />
                      <div className="flex flex-col leading-tight">
                        <span className="font-mono text-base font-semibold">
                          {s.symbol}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {s.name}
                        </span>
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
