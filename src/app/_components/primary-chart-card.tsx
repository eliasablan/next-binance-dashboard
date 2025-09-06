"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FullscreenIcon } from "lucide-react";
import { useState } from "react";

export default function PrimaryChartCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        "relative m-4 mb-0 flex flex-1 flex-col items-center justify-center rounded-xl border duration-200",
        isExpanded ? "min-h-[calc(100vh-5.5rem)]" : "min-h-3/5",
      )}
    >
      <h1>Welcome to the Next.js Binance Dashboard</h1>
      <Button
        className="absolute right-2 bottom-2"
        onClick={() => setIsExpanded(!isExpanded)}
        size="icon"
        variant="ghost"
      >
        <FullscreenIcon />
      </Button>
    </div>
  );
}
