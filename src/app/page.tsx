import PrimaryChartCard from "./_components/primary-chart-card";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <PrimaryChartCard />
      <div className="flex flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 aspect-[16/9] rounded-xl" />
          <div className="bg-muted/50 aspect-[16/9] rounded-xl" />
          <div className="bg-muted/50 aspect-[16/9] rounded-xl" />
          <div className="bg-muted/50 aspect-[16/9] rounded-xl" />
          <div className="bg-muted/50 aspect-[16/9] rounded-xl" />
          <div className="bg-muted/50 aspect-[16/9] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
