import { ModeToggle } from "@/components/theme-dropdown";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold">Settings</h1>
        <p className="text-muted-foreground font-mono text-sm">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col">
        <div className="mt-4 flex w-full items-center justify-between border-b border-dashed pb-4">
          <div className="flex flex-col items-start justify-center gap-2">
            <p className="text-sm font-extrabold">Theme:</p>
            <p className="text-muted-foreground font-mono text-xs">
              Select your preferred theme.
            </p>
          </div>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
