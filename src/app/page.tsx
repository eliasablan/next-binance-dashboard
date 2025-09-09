import PrimaryChartCard from "./_components/primary-chart-card";
import VolumeChartCard from "./_components/volume-chart-card";
import CoinFinder from "./_components/coin-finder";

export default function Home() {
  return (
    <div className="m-2 flex flex-1 flex-col gap-2 md:flex-row">
      <CoinFinder />
      <div className="flex grow flex-col gap-2">
        <PrimaryChartCard />
        <VolumeChartCard />
      </div>
    </div>
  );
}
