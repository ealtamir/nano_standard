import { PriceTracker } from "../islands/PriceTracker.tsx";
import { SocketManager } from "../islands/SocketManager.tsx";
import { useState } from "preact/hooks";
import PriceCharts from "../islands/PriceCharts.tsx";
import InfoBar from "./InfoBar.tsx";
import NanoInfo from "../components/NanoInfo.tsx";
import Footer from "../components/Footer.tsx";

interface HomeProps {
  wsProtocol: "ws" | "wss";
}

export default function Home({ wsProtocol }: HomeProps) {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  return <>
    <NanoInfo />
    <SocketManager protocol={wsProtocol}>
      <InfoBar />
      <PriceTracker onCurrencyClick={setSelectedCurrency} />
      <PriceCharts selectedCurrency={selectedCurrency} />
    </SocketManager>
    <Footer />
  </>;
}
