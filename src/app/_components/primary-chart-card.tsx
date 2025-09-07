"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FullscreenIcon } from "lucide-react";
import { useState } from "react";

export default function PrimaryChartCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  console.log(isExpanded);
  return (
    <Card
      className={cn(
        "duration-500 ease-in-out",
        isExpanded
          ? "min-h-[calc(100vh-var(--header-height)-2rem)]"
          : "min-h-[calc(60vh)]",
      )}
    >
      <CardHeader>
        <CardTitle>Primary Chart</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col items-center justify-center">
        <h1>Welcome to the Next.js Binance Dashboard</h1>
      </CardContent>
      <CardFooter>
        <Button
          className="ml-auto translate-3"
          onClick={() => setIsExpanded(!isExpanded)}
          size="icon"
          variant="ghost"
        >
          <FullscreenIcon />
        </Button>
      </CardFooter>
    </Card>
  );
}
