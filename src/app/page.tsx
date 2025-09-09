import CoinFinder from "./_components/coin-finder";
import { SelectedCoinCard } from "./_components/selected-coin-card";
import { Suspense } from "react";
import ChartsSection from "./_components/charts-section";

export default function Home() {
  return (
    <div className="m-2 flex flex-1 flex-col gap-2 md:flex-row">
      <CoinFinder />
      <SelectedCoinCard />
      <Suspense fallback={<div>Loading charts...</div>}>
        <ChartsSection />
      </Suspense>
    </div>
  );
}
