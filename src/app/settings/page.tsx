import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import SettingsClient from "./settings-client";

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

      <SettingsClient />
    </main>
  );
}
