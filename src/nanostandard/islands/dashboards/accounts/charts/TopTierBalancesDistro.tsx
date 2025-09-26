import { AccountTopTiersDistribution } from "../models.ts";
import { useSocketData } from "../../../SocketManager.tsx";
import { useEffect, useState } from "preact/hooks";
import { config } from "../../../../../config_loader.ts";
import { ChartsData } from "../../../../models.ts";

interface CachedChartData {
  data: AccountTopTiersDistribution[] | null;
  updated: Date | null;
}

export default function TopTierBalancesDistro() {
  const { socketContext, connected } = useSocketData() as unknown as {
    socketContext: Record<string, ChartsData<AccountTopTiersDistribution>>;
    connected: boolean;
  };
  const [cachedData, setCachedData] = useState<CachedChartData>({
    data: null,
    updated: null,
  });

  useEffect(() => {
    if (!socketContext) return;
    Object.keys(socketContext).some((key: string) => {
      if (
        key.startsWith(config.propagator.account_top_tiers_distribution_key)
      ) {
        const newDataTimestamp = new Date(socketContext[key].timestamp);
        if (cachedData.updated && cachedData.updated > newDataTimestamp) {
          return;
        }
        setCachedData({
          data: socketContext[key].data,
          updated: newDataTimestamp,
        });
      }
    });
  }, [socketContext]);

  if (!connected || !cachedData.data) {
    return (
      <div class="flex items-center justify-center p-4 text-gray-600">
        <div class="mr-2">⌛</div>
        Loading table...
      </div>
    );
  }

  return (
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-lg font-semibold mb-4">Top Tier Balances</h2>
      <table class="table-auto w-full">
        <thead>
          <tr>
            <th class="px-4 py-2">Tier Name</th>
            <th class="px-4 py-2">Balance</th>
          </tr>
        </thead>
        <tbody>
          {cachedData.data.map((item) => (
            <tr>
              <td class="border px-4 py-2">{item.tier_name}</td>
              <td class="border px-4 py-2">{item.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <pre class="mt-4 p-2 bg-gray-100 rounded">
        {JSON.stringify(cachedData.data, null, 2)}
      </pre>
    </div>
  );
}
