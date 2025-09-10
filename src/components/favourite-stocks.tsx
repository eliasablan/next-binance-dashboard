"use client";

import { useLocalStorage } from "usehooks-ts";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Star } from "lucide-react";

export function FavouriteStocks() {
  const [favouriteCryptos] = useLocalStorage<
    { symbol: string; base: string; name: string }[]
  >("favouriteCryptos", [], {
    deserializer: (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    },
  });

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
                    <NavigationMenuLink
                      key={crypto.symbol}
                      href={`/?symbol=${crypto.symbol}`}
                    >
                      <div className="text-md font-semibold">{crypto.name}</div>
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
}
