import { AccountAnimalBuckets, AccountAnimalBucketsSchema } from "../models.ts";
import { useSocketData } from "../../../SocketManager.tsx";
import { useEffect, useState } from "preact/hooks";
import { config } from "../../../../../config_loader.ts";
import { ChartsData } from "../../../../models.ts";

interface CachedChartData {
  data: AccountAnimalBuckets[] | null;
  updated: Date | null;
}

const emojiMap: Record<string, string> = {
  shrimp: "🦐",
  fish: "🐟",
  penguin: "🐧",
  seal: "🦭",
  dolphin: "🐬",
  shark: "🦈",
  whale: "🐳",
};

const thresholdMap: Record<string, string> = {
  shrimp: "<0.971",
  fish: "<9.59",
  penguin: "<96.34",
  seal: "<933",
  dolphin: "<5.2K",
  shark: "<83.1K",
  whale: "≥83.1K",
};

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function TierBalancesDistro() {
  const { socketContext, connected } = useSocketData() as unknown as {
    socketContext: Record<string, ChartsData<AccountAnimalBuckets>>;
    connected: boolean;
  };
  const [cachedData, setCachedData] = useState<CachedChartData>({
    data: null,
    updated: null,
  });

  useEffect(() => {
    if (!socketContext) return;
    Object.keys(socketContext).some((key: string) => {
      if (key.startsWith(config.propagator.account_animal_bucket_key)) {
        const newDataTimestamp = new Date(socketContext[key].timestamp);
        if (cachedData.updated && cachedData.updated > newDataTimestamp) {
          return;
        }
        setCachedData({
          data: socketContext[key].data.map((data) =>
            AccountAnimalBucketsSchema.parse(data)
          ),
          updated: newDataTimestamp,
        });
      }
    });
  }, [socketContext]);

  if (!connected || !cachedData.data) {
    return (
      <div class="flex items-center justify-center p-4 text-gray-600">
        <div class="mr-2">⌛</div>
        Loading chart...
      </div>
    );
  }

  return (
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-800">
          Tier Balances Distribution
        </h3>
        <p class="text-sm text-gray-600">
          Detailed breakdown of account balances by animal tier categories
        </p>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tier (Ӿ Threshold)
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Account Count
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Balance (Ӿ)
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Avg Balance (Ӿ)
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Min Balance (Ӿ)
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                25th Percentile (Ӿ)
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Median (Ӿ)
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                75th Percentile (Ӿ)
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Max Balance (Ӿ)
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {cachedData.data.map((row) => (
              <tr key={row.bucket}>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <span class="mr-2">{emojiMap[row.bucket]}</span>
                  {capitalizeFirstLetter(row.bucket)}
                  <span class="ml-2 text-xs text-gray-500 font-normal">
                    ({thresholdMap[row.bucket]})
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.account_count.toLocaleString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.total_nano_in_bucket.toLocaleString(undefined, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.avg_balance_nano.toFixed(3)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.min_balance_nano.toFixed(3)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.p25_balance_nano.toFixed(3)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.p50_balance_nano.toFixed(3)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.p75_balance_nano.toFixed(3)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.max_balance_nano.toLocaleString(undefined, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
