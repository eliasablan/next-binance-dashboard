"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { useQueryState } from "nuqs";

export default function VolumeChartCard() {
  const [symbol] = useQueryState("symbol");

  if (!symbol) return null;

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      <Card className="h-38 md:col-span-full" />
      <Card className="aspect-video" />
      <Card className="aspect-video" />
      <Card className="aspect-video" />
    </div>
  );
}
