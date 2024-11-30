import { PriceTracker } from "../islands/PriceTracker.tsx";
import { SocketManager } from "../islands/SocketManager.tsx";
import { useState } from "preact/hooks";
import PriceCharts from "../islands/PriceCharts.tsx";
import InfoBar from "./InfoBar.tsx";
import NanoInfo from "../components/NanoInfo.tsx";
import Footer from "../components/Footer.tsx";

export default function Home() {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");


  return <>
    <NanoInfo />
    <SocketManager>
      <InfoBar />
      <PriceTracker onCurrencyClick={setSelectedCurrency} />
      <PriceCharts selectedCurrency={selectedCurrency} />
    </SocketManager>
    <Footer />
  </>;
}
