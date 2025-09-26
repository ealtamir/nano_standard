import { PriceTracker } from "../../dashboards/transactions/PriceTracker.tsx";
import { SocketManager } from "../../SocketManager.tsx";
import { useState } from "preact/hooks";
import InfoBar from "../../dashboards/transactions/InfoBar.tsx";
import NanoInfo from "../../../components/dashboards/transactions/NanoInfo.tsx";
import ChartsContainer from "./charts/ChartsContainer.tsx";
import NanoConfirmationsChart from "./charts/NanoConfirmationsChart.tsx";
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
          <NanoConfirmationsChart />
          <NanoUniqueAccountsChart />
          <NanoDistributionChart />
        </ChartsContainer>
      </SocketManager>
    </>
  );
}
