import { Head } from "$fresh/runtime.ts";
import { SocketManager } from "../../SocketManager.tsx";
import BasicStats from "./charts/BasicStats.tsx";
import TierBalancesDistro from "./charts/TierBalancesDistro.tsx";
import AccountDormancyChart from "./charts/AccountDormancy.tsx";
import AccountMoneyRecencyChart from "./charts/AccountMoneyRecency.tsx";
import NetworkActivityRatioChart from "./charts/NetworkActivityRatio.tsx";
import RepChangeDistroChart from "./charts/RepChangeDistro.tsx";
import TopTierBalancesDistro from "./charts/TopTierBalancesDistro.tsx";
import TransactionBalanceDistroChart from "./charts/TransactionBalanceDistro.tsx";
import AnimalTierTrendsChart from "./charts/AnimalTierTrends.tsx";

interface AccountsProps {
  wsProtocol: "ws" | "wss";
}

export default function Accounts({ wsProtocol }: AccountsProps) {
  return (
    <>
      <Head>
        <title>Nano Standard - Accounts Dashboard</title>
        <script src="https://cdn.plot.ly/plotly-2.32.0.min.js" />
      </Head>
      <SocketManager protocol={wsProtocol}>
        <div class="w-full">
          <BasicStats />
          <div class="p-4 mx-auto max-w-screen-xl">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {
                /* <TierBalancesDistro />
            <AccountDormancyChart />
            <AccountMoneyRecencyChart />
            <NetworkActivityRatioChart />
            <RepChangeDistroChart />
            <TopTierBalancesDistro />
            <TransactionBalanceDistroChart />
            <AnimalTierTrendsChart /> */
              }
            </div>
          </div>
        </div>
      </SocketManager>
    </>
  );
}
