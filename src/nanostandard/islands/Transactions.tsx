import { PriceTracker } from "./PriceTracker.tsx";
import { SocketManager } from "./SocketManager.tsx";
import { useEffect, useState } from "preact/hooks";
import InfoBar from "./InfoBar.tsx";
import NanoInfo from "../components/NanoInfo.tsx";
import Footer from "../components/Footer.tsx";
import ChartsContainer from "./charts/ChartsContainer.tsx";
import NanoConfirmationsChart from "./charts/NanoConfirmationsChart.tsx";
import NanoVolumeChart from "./charts/NanoVolumeChart.tsx";
import NanoPricesChart from "./charts/NanoPricesChart.tsx";
import NanoUniqueAccountsChart from "./charts/NanoAccountsChart.tsx";
import NanoDistributionChart from "./charts/NanoDistributionChart.tsx";

interface HomeProps {
  wsProtocol: "ws" | "wss";
}

export default function Transactions({ wsProtocol }: HomeProps) {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  return (
    <>
      <NanoInfo />
      <div className="block md:hidden text-sm text-gray-600 text-center px-4 py-2 bg-amber-50 rounded-md mx-4 mb-4">
        For the best experience viewing our charts and data, please consider
        using a desktop browser.
      </div>
      <SocketManager protocol={wsProtocol}>
        <InfoBar />
        <PriceTracker onCurrencyClick={setSelectedCurrency} />

        <ChartsContainer>
          <NanoPricesChart selectedCurrency={selectedCurrency} />
          <NanoVolumeChart />
          <NanoConfirmationsChart />
          <NanoUniqueAccountsChart />
          <NanoDistributionChart />
        </ChartsContainer>
      </SocketManager>
      <Footer showPriceData />
    </>
  );
}
