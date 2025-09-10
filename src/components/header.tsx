"use client";

import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { Sidebar } from "lucide-react";
import { Button } from "./ui/button";
import { SearchModal } from "./search-modal";

export function SiteHeader() {
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <header
      className="bg-background sticky top-0 z-30 flex items-center justify-between gap-2 border-b p-4"
      style={{
        height: "var(--header-height)",
      }}
    >
      <div className="flex items-center gap-2">
        {isMobile && (
          <>
            <Button
              onClick={() => toggleSidebar()}
              variant="ghost"
              className="-ml-1"
            >
              <span className="sr-only">Open sidebar</span>
              <Sidebar />
            </Button>
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <SearchModal />
      </div>
    </header>
  );
}
