import PrimaryChartCard from "./_components/primary-chart-card";
import VolumeChartCard from "./_components/volume-chart-card";
import CoinFinder from "./_components/coin-finder";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 p-3">
      <CoinFinder />
      <PrimaryChartCard />
      <VolumeChartCard />
    </div>
  );
}
