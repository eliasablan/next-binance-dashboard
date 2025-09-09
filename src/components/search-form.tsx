"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  // CommandSeparator,
  CommandShortcut,
  Command,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBinanceWebSocket } from "@/hooks/use-binance-websockets";
import { useBinanceKlines } from "@/hooks/use-binance-klines";
import { CryptoNameService } from "@/services/crypto-name";
import {
  // Home,
  //  Settings,
  Search,
  TrendingUp,
} from "lucide-react";
// import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";

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

export function SearchForm() {
  // const router = useRouter();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [, setSymbol] = useQueryState("symbol");
  // Reuse hook only for setter side-effects (no interval => it won't fetch klines)
  const { setSymbol: setSymbolHook } = useBinanceKlines();

  // All symbols state
  const [allSymbols, setAllSymbols] = React.useState<SymbolEntry[]>([]);
  const [loadingSymbols, setLoadingSymbols] = React.useState(false);
  const [, setError] = React.useState<string | null>(null); // error reserved for future UI feedback

  // Fetch ALL trading symbols (we'll keep USDT pairs for consistency)
  React.useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      try {
        setLoadingSymbols(true);
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
        if (!cancelled) setLoadingSymbols(false);
      }
    };
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter symbols by search
  const filtered = React.useMemo(() => {
    if (!searchValue) return allSymbols;
    const q = searchValue.toLowerCase();
    return allSymbols.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.base.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q),
    );
  }, [allSymbols, searchValue]);

  // Subscribe to prices only for the first N currently filtered (avoid huge URL)
  const MAX_STREAM_SYMBOLS = 120; // safety limit
  const subscribedSymbols = React.useMemo(
    () => filtered.slice(0, MAX_STREAM_SYMBOLS).map((s) => s.symbol),
    [filtered],
  );
  const { getSymbolData } = useBinanceWebSocket(subscribedSymbols);

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
    setSymbol(base);
    setSymbolHook(base); // in case other logic relies on it
    setOpen(false);
    setSearchValue("");
  };

  // const navItems = [
  //   {
  //     label: "Home",
  //     value: "home",
  //     icon: Home,
  //     action: () => {
  //       router.push("/");
  //       setOpen(false);
  //     },
  //   },
  //   {
  //     label: "Settings",
  //     value: "settings",
  //     icon: Settings,
  //     action: () => {
  //       router.push("/settings");
  //       setOpen(false);
  //     },
  //   },
  // ];

  const content = (
    <>
      <CommandInput
        placeholder="Search symbol, name, section..."
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>
          {loadingSymbols ? "Loading..." : "No results"}
        </CommandEmpty>
        {/* <CommandGroup heading="Navigation">
          {navItems.map((item) => (
            <CommandItem
              key={item.value}
              value={item.value}
              onSelect={() => item.action()}
            >
              <item.icon className="text-muted-foreground" />
              <span>{item.label}</span>
              <CommandShortcut className="bg-muted rounded border px-1.5">
                ↵
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator /> */}
        <CommandGroup heading={`Cryptocurrencies (${filtered.length})`}>
          {filtered.map((s) => {
            const ws = getSymbolData(s.symbol);
            const price = ws?.price;
            const pct = ws?.priceChangePercent;
            const pctNum = pct ? parseFloat(pct) : 0;
            return (
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
                      {s.base}
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
      </CommandList>
    </>
  );

  if (isMobile) {
    return (
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
            <Command>{content}</Command>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="relative flex w-56 items-center gap-2 rounded-full pr-2 pl-3 text-sm"
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
