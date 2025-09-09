"use client";

import * as React from "react";
import { ModeToggle } from "@/components/theme-dropdown";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useLocalStorage } from "usehooks-ts";

const BASE_COINS = [
  {
    name: "US Dollar",
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

export default function SettingsClient() {
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
    <div className="grid gap-6">
      {/* Base currency selector */}
      <Card className="supports-[backdrop-filter]:bg-background/70 overflow-hidden backdrop-blur">
        <CardHeader className="pb-0">
          <CardTitle className="text-base">Base currency</CardTitle>
          <CardDescription>
            Select the base currency for price display across the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="group bg-muted/30 hover:bg-muted/40 relative flex items-center justify-between gap-6 rounded-lg border px-4 py-3 transition-colors">
            <div className="space-y-1">
              <p className="text-sm leading-none font-medium">Base currency</p>
              <p className="text-muted-foreground text-xs">
                All prices will be shown in this currency.
              </p>
            </div>
            <Select value={baseCoin} onValueChange={setBaseCoin}>
              {/* <SelectValue /> */}
              <SelectTrigger className="min-w-[120px]">
                <SelectValue placeholder="Select base" />
              </SelectTrigger>
              <SelectContent>
                {BASE_COINS.map((b) => (
                  <SelectItem key={b.symbol} value={b.symbol}>
                    {b.symbol} – {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ring-border pointer-events-none absolute inset-0 -z-10 rounded-lg opacity-0 ring-1 transition-all group-hover:opacity-100" />
          </div>
        </CardContent>
      </Card>
      {/* Appearance / Theme Card */}
      <Card className="supports-[backdrop-filter]:bg-background/70 overflow-hidden backdrop-blur">
        <CardHeader className="pb-0">
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>
            Customize how the interface looks and feels.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="group bg-muted/30 hover:bg-muted/40 relative flex items-center justify-between gap-6 rounded-lg border px-4 py-3 transition-colors">
            <div className="space-y-1">
              <p className="text-sm leading-none font-medium">Theme</p>
              <p className="text-muted-foreground text-xs">
                Switch between light, dark or system mode.
              </p>
            </div>
            <ModeToggle />
            <div className="ring-border pointer-events-none absolute inset-0 -z-10 rounded-lg opacity-0 ring-1 transition-all group-hover:opacity-100" />
          </div>
        </CardContent>
      </Card>
      {/* Future sections placeholder */}
      {/* Uncomment & extend when adding moresetting groups. */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Control alerts & real-time updates.</CardDescription>
        </CardHeader>
        <CardContent>...</CardContent>
      </Card>
    </div>
  );
}
