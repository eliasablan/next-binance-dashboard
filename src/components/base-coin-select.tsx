"use client";

import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useLocalStorage } from "usehooks-ts";
import { cn } from "@/lib/utils";

const BASE_COINS = [
  {
    name: "US Dollar Tether",
    symbol: "USDT",
  },
  {
    name: "Euro",
    symbol: "EUR",
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
  },
];

export default function BaseCoinSelect({
  version,
}: {
  version?: "compact" | "full";
}) {
  const [baseCoin, setBaseCoin] = useLocalStorage<string>("baseCoin", "USDT", {
    serializer: (value) => JSON.stringify(value),
    deserializer: (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    },
  });

  return (
    <Select value={baseCoin} onValueChange={setBaseCoin}>
      <SelectTrigger
        className={cn(
          "bg-background! hover:bg-muted!",
          version === "full" && "min-w-[120px]",
        )}
      >
        <SelectValue placeholder="Select base" />
      </SelectTrigger>
      <SelectContent>
        {BASE_COINS.map((b) => (
          <SelectItem key={b.symbol} value={b.symbol}>
            {b.symbol}
            {version === "full" && ` - ${b.name}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
