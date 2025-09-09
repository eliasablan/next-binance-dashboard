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
import { useBinanceKlines } from "@/hooks/use-binance-klines";
import { TrendingUp } from "lucide-react";
import { CryptoNameService } from "@/services/crypto-name";

type SymbolEntry = {
  symbol: string;
  base: string;
  name: string;
};

export default function CoinFinder() {
  const [activeSymbol, setActiveSymbol] = useQueryState("symbol");
  const { setSymbol: setSymbolHook } = useBinanceKlines();

  const [allSymbols, setAllSymbols] = React.useState<SymbolEntry[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchValue, setSearchValue] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
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
              s.status === "TRADING" &&
              s.isSpotTradingAllowed &&
              /USDT$/.test(s.symbol),
          )
          .map((s) => ({
            symbol: s.symbol,
            base: CryptoNameService.getBaseSymbol(s.symbol),
            name: CryptoNameService.getCryptoName(s.symbol),
          }));
        if (!cancelled) setAllSymbols(entries);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = React.useMemo(() => {
    if (!searchValue) return [] as SymbolEntry[]; // hide until typing
    const q = searchValue.toLowerCase();
    return allSymbols.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.base.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q),
    );
  }, [allSymbols, searchValue]);

  // Limit displayed results
  const DISPLAY_LIMIT = 10;
  const visibleResults = React.useMemo(
    () => filtered.slice(0, DISPLAY_LIMIT),
    [filtered],
  );

  // WebSocket logic moved to SelectedCoinCard

  const handleSelect = (base: string) => {
    setActiveSymbol(base);
    setSymbolHook(base);
  };

  if (activeSymbol) return null;

  return (
    <div className="mx-auto mt-12 w-full max-w-4xl px-4">
      <div className="mb-6 text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Choose a cryptocurrency
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
          <CommandEmpty>
            {loading
              ? "Loading symbols..."
              : searchValue
                ? "No results"
                : "Start typing to see results"}
          </CommandEmpty>
          {visibleResults.length > 0 && (
            <CommandGroup
              heading={`Resultados (${Math.min(filtered.length, DISPLAY_LIMIT)}${
                filtered.length > DISPLAY_LIMIT ? "+" : ""
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
                          {s.base}
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
          {visibleResults.length > 0 && <CommandSeparator />}
          {error && !loading && (
            <div className="text-destructive px-4 py-3 text-sm">
              Error: {error}
            </div>
          )}
        </CommandList>
      </Command>
    </div>
  );
}
