"use client";

import { useBinanceKlines } from "@/hooks/use-binance-klines";
import { useState, useRef, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { Star } from "lucide-react";

export function FavouriteStocks() {
  const { setSymbol } = useBinanceKlines();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Cerrar el menú si se hace clic fuera del mismo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Star size={20} fill="yellow" stroke="yellow" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            {/* Mensaje cuando no hay favoritos */}
            {favouriteCryptos.length < 1 ? (
              <div className="w-44 rounded-lg p-4 shadow-lg">
                <p className="text-sm text-balance">
                  You {"don't"} have any favorite cryptocurrencies yet
                </p>
              </div>
            ) : (
              <ul className="grid w-44 gap-4">
                <li>
                  {favouriteCryptos.map((crypto) => (
                    <NavigationMenuLink key={crypto.symbol} asChild>
                      <Link href="#">
                        <div className="font-medium">{crypto.name}</div>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </li>
              </ul>
            )}
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón con estrella */}
      <button
        aria-label="Seleccionar acción favorita"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        disabled={favouriteCryptos?.length === 0}
      >
        <span className="text-lg">⭐</span>
        <span className="text-xs font-bold">
          {favouriteCryptos.length || 0}
        </span>
        {favouriteCryptos.length > 0 && (
          <span className="-mr-1 text-xs">▼</span>
        )}
      </button>

      {/* Lista de opciones */}
      {open && favouriteCryptos.length > 0 && (
        <ul className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
          {favouriteCryptos.map((crypto) => (
            <li
              key={crypto.symbol}
              onClick={() => {
                setSymbol(crypto.symbol);
                setOpen(false);
              }}
              className="cursor-pointer px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-blue-50 dark:text-gray-100 dark:hover:bg-blue-600"
            >
              <div className="flex items-center justify-start gap-2">
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  {crypto.symbol.toUpperCase()}
                </span>
                <span>{crypto.name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Mensaje cuando no hay favoritos */}
      {open && favouriteCryptos.length === 0 && (
        <div className="absolute right-0 z-40 mt-2 w-48 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-600 dark:bg-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            No tienes criptomonedas favoritas aún
          </p>
        </div>
      )}
    </div>
  );
}
