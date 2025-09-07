import PrimaryChartCard from "./_components/primary-chart-card";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <PrimaryChartCard />

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card className="aspect-video" />
        <Card className="aspect-video" />
        <Card className="aspect-video" />
        <Card className="aspect-video" />
        <Card className="aspect-video" />
        <Card className="aspect-video" />
      </div>
    </div>
  );
}
