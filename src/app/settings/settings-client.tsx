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
import BaseCoinSelect from "@/components/base-coin-select";

export default function SettingsClient() {
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
            <BaseCoinSelect version="full" />
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
