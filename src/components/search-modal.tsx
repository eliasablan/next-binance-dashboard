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
import { useQueryState } from "nuqs";
import { useLocalStorage } from "usehooks-ts";

type SymbolEntry = {
  symbol: string; // e.g. BTCUSDT
  base: string; // BTC
  name: string; // Bitcoin
};

export function SearchModal() {
  const [allSymbols, setAllSymbols] = React.useState<SymbolEntry[]>([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [, setSymbol] = useQueryState("symbol");
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

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
        console.error(e);
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

  const [favouriteCryptos] = useLocalStorage<
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
    setOpen(false);
    setSearchValue("");
  };

  const content = (
    <>
      <CommandInput
        placeholder="Search symbol, name, section..."
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <CommandList className="max-h-[60vh]">
        <CommandGroup heading={`Favorites (${favouriteCryptos.length})`}>
          {favouriteCryptos.map((item) => (
            <CommandItem
              key={item.symbol}
              value={item.symbol}
              onSelect={() => handleSelectSymbol(item.symbol)}
            >
              <Star stroke="gold" fill="gold" className="mr-1" />
              <span className="font-mono text-sm font-semibold">
                {item.name}
              </span>
              {/* <CommandShortcut className="bg-muted rounded px-1.5">
                ↵
              </CommandShortcut> */}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={`Cryptocurrencies (${filtered.length})`}>
          {filtered.map((s) => (
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
            </CommandItem>
          ))}
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
            <SheetTitle className="sr-only">Search</SheetTitle>
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
