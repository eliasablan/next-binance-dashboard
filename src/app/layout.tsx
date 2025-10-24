import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/header";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { DashboardStoreProvider } from "@/providers/dashboard-store-provider";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crypto Dashboard",
  description: "A dashboard to visualize Binance cryptocurrency data.",
  icons: "/icon.png",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "development" && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <DashboardStoreProvider>
              <SidebarProvider
                className="relative"
                defaultOpen={defaultOpen}
                style={
                  {
                    "--sidebar-width": "50px",
                    "--header-height": "55px",
                  } as React.CSSProperties
                }
              >
                <AppSidebar />
                <SidebarInset>
                  <SiteHeader />
                  {children}
                  <footer className="flex justify-end p-4">
                    <span className="text-muted-foreground text-sm">
                      By{" "}
                      <Link
                        className="border-muted-foreground border-b border-dashed"
                        href="https://eliasablan.dev"
                        target="_blank"
                      >
                        Elias
                      </Link>
                    </span>
                  </footer>
                </SidebarInset>
              </SidebarProvider>
            </DashboardStoreProvider>
          </NuqsAdapter>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
