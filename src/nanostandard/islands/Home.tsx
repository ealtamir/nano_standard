import { PriceTracker } from "../islands/PriceTracker.tsx";
import { SocketManager } from "../islands/SocketManager.tsx";
import { useState } from "preact/hooks";
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

export default function Home({ wsProtocol }: HomeProps) {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [viewType, setViewType] = useState<"5m" | "1h" | "1d">("5m");

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

        <div className="flex justify-center gap-2 mb-4">
          {["5m", "1h", "1d"].map((type) => (
            <button
              key={type}
              onClick={() => setViewType(type as "5m" | "1h" | "1d")}
              className={`px-4 py-2 rounded-md font-medium transition-colors
                ${
                viewType === type
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <ChartsContainer>
          <NanoPricesChart
            viewType={viewType}
            selectedCurrency={selectedCurrency}
          />
          <NanoVolumeChart viewType={viewType} />
          <NanoConfirmationsChart viewType={viewType} />
          <NanoUniqueAccountsChart viewType={viewType} />
          <NanoDistributionChart viewType={viewType} />
        </ChartsContainer>
        {/* <PriceCharts selectedCurrency={selectedCurrency} /> */}
      </SocketManager>
      <Footer />
    </>
  );
}
