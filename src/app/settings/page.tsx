import { ModeToggle } from "@/components/theme-dropdown";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
      {/* Breadcrumb / Navigation context */}
      <Breadcrumb className="animate-in fade-in slide-in-from-left-2 duration-300">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page header */}
      <div className="animate-in fade-in flex flex-col gap-2 duration-300">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            Tune the dashboard appearance and behavior. More preferences coming
            soon.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
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
        {/**
         * Uncomment & extend when adding more setting groups.
         *
         * <Card>
         *   <CardHeader>
         *     <CardTitle className="text-base">Notifications</CardTitle>
         *     <CardDescription>Control alerts & real-time updates.</CardDescription>
         *   </CardHeader>
         *   <CardContent>
         *     ...
         *   </CardContent>
         * </Card>
         */}
      </div>
    </main>
  );
}
