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
        <div class="w-full min-w-[800px]">
          <BasicStats />

          <h2 class="text-2xl font-bold text-gray-800 mb-4 mt-8">
            Basic distributions
          </h2>
          <TransactionBalanceDistroChart />
          <RepChangeDistroChart />

          <h2 class="text-2xl font-bold text-gray-800 mb-4 mt-8">
            Money Flows
          </h2>
          <TierBalancesDistro />
          <AnimalTierTrendsChart />
          <TopTierBalancesDistro />

          <h2 class="text-2xl font-bold text-gray-800 mb-4 mt-8">
            Usage Statistics
          </h2>
          <AccountDormancyChart />
          <AccountMoneyRecencyChart />
          <NetworkActivityRatioChart />
        </div>
      </SocketManager>
    </>
  );
}
