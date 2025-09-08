"use client";

import * as React from "react";
import { Command, Settings, Home } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import { useBinanceSidefinder } from "@/hooks/use-binance-sidefinder";
import { useBinanceWebSocket } from "@/hooks/use-binance-websockets";
import { CryptoNameService } from "@/services/crypto-name";

const navigation = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    isActive: true,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    isActive: false,
  },
];

const userData = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "/avatars/shadcn.jpg",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    symbols,
    // loading: symbolsLoading,
    // error: symbolsError,
  } = useBinanceSidefinder();
  const [activeSymbol, setActiveSymbol] = useQueryState("symbol");

  // Hook para manejar WebSocket de precios en tiempo real
  const {
    getSymbolData,
    //  connectionStatus, reconnect
  } = useBinanceWebSocket(symbols);

  // Crear datos combinados de símbolos y precios
  const symbolsData = symbols.map((symbol) => {
    const wsData = getSymbolData(symbol);
    return {
      symbol,
      baseSymbol: CryptoNameService.getBaseSymbol(symbol),
      name: CryptoNameService.getCryptoName(symbol),
      price: wsData?.price || "0",
      priceChangePercent: wsData?.priceChangePercent || "0",
    };
  });

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      asChild
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={userData} />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <SidebarInput placeholder="Type to search..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              {symbolsData.map((symbol) => (
                <SidebarMenuItem
                  className="list-none border-b"
                  key={symbol.name}
                >
                  <SidebarMenuButton
                    className="flex h-auto items-center justify-between rounded-none border-b-0 p-2 px-3"
                    isActive={activeSymbol === symbol.baseSymbol}
                    onClick={() => setActiveSymbol(symbol.baseSymbol)}
                    asChild
                  >
                    <div className="flex w-full items-center gap-2">
                      <div className="flex flex-col items-start">
                        <span className="text-muted-foreground font-mono text-lg font-bold">
                          {symbol.baseSymbol}
                        </span>
                        <span className="text-xs">{symbol.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="ml-auto text-lg font-semibold">
                          {parseFloat(symbol.price).toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </span>
                        <span
                          className={cn("text-xs font-bold", {
                            "text-green-500":
                              parseFloat(symbol.priceChangePercent) >= 0,
                            "text-red-500":
                              parseFloat(symbol.priceChangePercent) < 0,
                          })}
                        >
                          {symbol.priceChangePercent}%
                        </span>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
