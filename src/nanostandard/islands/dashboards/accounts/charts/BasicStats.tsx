import { AccountBasicStats } from "../models.ts";
import { useSocketData } from "../../../SocketManager.tsx";
import { useEffect, useState } from "preact/hooks";
import { config } from "../../../../../config_loader.ts";
import { ChartsData } from "../../../../models.ts";

interface CachedData {
  data: AccountBasicStats | null;
  updated: Date | null;
}

export default function BasicStats() {
  const { socketContext, connected } = useSocketData() as unknown as {
    socketContext: Record<string, ChartsData<AccountBasicStats>>;
    connected: boolean;
  };
  const [cachedData, setCachedData] = useState<CachedData>({
    data: null,
    updated: null,
  });

  useEffect(() => {
    if (!socketContext) return;
    Object.keys(socketContext).some((key: string) => {
      if (key.startsWith(config.propagator.account_basic_stats_key)) {
        const newDataTimestamp = new Date(socketContext[key].timestamp);
        if (cachedData.updated && cachedData.updated > newDataTimestamp) {
          return;
        }
        setCachedData({
          data: socketContext[key].data[0], // Assuming single object in array
          updated: newDataTimestamp,
        });
      }
    });
  }, [socketContext]);

  if (!connected || !cachedData.data) {
    return (
      <div class="flex items-center justify-center p-4 text-gray-600">
        <div class="mr-2">⌛</div>
        Loading stats...
      </div>
    );
  }

  return (
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-lg font-semibold mb-4">Basic Account Stats</h2>
      <ul class="list-disc list-inside">
        <li>Total Accounts: {cachedData.data.total_accounts}</li>
        <li>Accounts with Balance: {cachedData.data.accounts_with_balance}</li>
        <li>Accounts with Sends: {cachedData.data.accounts_with_sends}</li>
        <li>
          Accounts with Receives Only:{" "}
          {cachedData.data.accounts_with_receives_only}
        </li>
        <li>
          Total Nano in Accounts Under 1 Nano:{" "}
          {cachedData.data.total_nano_under_1}
        </li>
      </ul>
      <pre class="mt-4 p-2 bg-gray-100 rounded">
        {JSON.stringify(cachedData.data, null, 2)}
      </pre>
    </div>
  );
}
