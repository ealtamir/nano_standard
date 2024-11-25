import { PriceTracker } from "../islands/PriceTracker.tsx";
import { SocketManager } from "../islands/SocketManager.tsx";
import { useState } from "preact/hooks";
import PriceCharts from "../islands/PriceCharts.tsx";

export default function Home() {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");


  return <>
    <div className="flex flex-col items-center justify-center">
      <h1>Nano Standard</h1>
      <p>Nano is the most advanced form of money.</p>
    </div>
    <SocketManager>
      <PriceTracker onCurrencyClick={setSelectedCurrency} />
      <PriceCharts selectedCurrency={selectedCurrency} />
    </SocketManager>
  </>;
}
