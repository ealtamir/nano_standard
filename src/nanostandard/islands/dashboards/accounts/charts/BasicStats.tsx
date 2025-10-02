import { AccountBasicStats, AccountBasicStatsSchema } from "../models.ts";
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
          data: AccountBasicStatsSchema.parse(socketContext[key].data[0]), // Parse with Zod schema
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

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2) + "M";
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + "K";
    }
    return Math.round(num).toString();
  };

  const Stat = (
    { title, value }: { title: string; value: string | number },
  ) => (
    <div class="text-center">
      <p class="font-bold text-4xl">{value}</p>
      <p class="text-lg text-gray-500">{title}</p>
    </div>
  );

  return (
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-800">
          Basic Account Statistics
        </h3>
        <p class="text-sm text-gray-600">
          Overview of account distribution and activity metrics
        </p>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat
          title="Total Accounts"
          value={formatNumber(cachedData.data.total_accounts)}
        />
        <Stat
          title="With Balance > 0"
          value={formatNumber(cachedData.data.accounts_with_balance)}
        />
        <Stat
          title="With Sends"
          value={formatNumber(cachedData.data.accounts_with_sends)}
        />
        <Stat
          title="Receives Only"
          value={formatNumber(cachedData.data.accounts_with_receives_only)}
        />
        <Stat
          title="Nano in Accounts < 1"
          value={formatNumber(cachedData.data.total_nano_under_1 / 1e30)}
        />
      </div>
    </div>
  );
}
