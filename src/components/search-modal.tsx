"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  Command,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { CryptoNameService } from "@/services/crypto-name";
import { Search, Star, TrendingUp } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { useBinanceWebSocket } from "@/hooks/use-binance-websockets";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Separator } from "./ui/separator";

type SymbolEntry = {
  symbol: string; // e.g. BTCUSDT
  base: string; // BTC
  name: string; // Bitcoin
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

export function SearchModal() {
  const router = useRouter();
  const [allSymbols, setAllSymbols] = React.useState<SymbolEntry[]>([]);
  const [searchValue, setSearchValue] = React.useState("");
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [baseCoin] = useLocalStorage<string>("baseCoin", "USDT", {
    deserializer: (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    },
  });

  // Fetch ALL trading symbols (we'll keep USDT pairs for consistency)
  React.useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
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
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [baseCoin]);

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

  // Keyboard shortcut '/'
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSelectSymbol = (base: string) => {
    setOpen(false);
    setSearchValue("");
    router.push(`/?symbol=${base}`);
  };

  const content = (
    <>
      <CommandInput
        placeholder="Search symbol, name, section..."
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <CommandList className="max-h-[60vh]">
        <CommandGroup heading="Favorites">
          {favouriteCryptos.map((s) => {
            const ws = getSymbolData(s.symbol.toLowerCase());
            const price = ws?.price;
            const pct = ws?.priceChangePercent;
            const pctNum = pct ? parseFloat(pct) : 0;
            return (
              <CommandItem
                key={s.symbol}
                value={`${s.symbol} ${s.name}`.toLowerCase()}
                onSelect={() => handleSelectSymbol(s.symbol)}
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
        <CommandSeparator />
        <CommandGroup heading={`Cryptocurrencies (${cryptoList.length})`}>
          {cryptoList.map((s) => (
            <CommandItem
              key={s.symbol}
              value={`${s.symbol} ${s.name}`}
              onSelect={() => handleSelectSymbol(s.symbol)}
              className="items-stretch"
            >
              <div className="flex flex-1 items-center gap-2 truncate">
                <TrendingUp className="text-muted-foreground" />
                <div className="flex flex-col leading-tight">
                  <span className="font-mono text-sm font-semibold">
                    {s.symbol}
                    {/* <span className="text-primary ml-1 text-xs font-light">
                      {s.symbol}
                    </span> */}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {s.name}
                  </span>
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </>
  );

  if (isMobile) {
    return (
      <>
        <Separator
          orientation="vertical"
          className="ml-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center">
          <Button
            size="icon"
            variant="ghost"
            className="size-9"
            onClick={() => setOpen(true)}
          >
            <Search className="size-5" />
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent
              side="bottom"
              className="h-auto border-t-0"
              showClose={false}
            >
              <SheetTitle className="sr-only">Search</SheetTitle>
              <Command>{content}</Command>
            </SheetContent>
          </Sheet>
        </div>
      </>
    );
  }

  return (
    <div className="flex items-center">
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="bg-background! hover:text-foreground hover:bg-muted! relative flex w-56 items-center gap-2 rounded-full pr-2 pl-3 text-sm"
      >
        <Search className="size-4 shrink-0 opacity-60" />
        <span className="text-muted-foreground font-normal">Search</span>
        <CommandShortcut className="bg-muted ml-auto rounded border px-1.5 py-0.5 font-mono text-[10px] leading-none">
          /
        </CommandShortcut>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        {content}
      </CommandDialog>
    </div>
  );
}
