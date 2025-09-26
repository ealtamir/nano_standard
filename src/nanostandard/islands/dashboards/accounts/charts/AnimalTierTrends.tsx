// Declare Plotly on window object for TypeScript
declare global {
  interface Window {
    Plotly: any;
  }
}

import { AnimalTierTrends } from "../models.ts";
import { useSocketData } from "../../../SocketManager.tsx";
import { useEffect, useState } from "preact/hooks";
import { config } from "../../../../../config_loader.ts";
import { ChartsData } from "../../../../models.ts";

interface CachedChartData {
  data: AnimalTierTrends[] | null;
  updated: Date | null;
}

export default function AnimalTierTrendsChart() {
  const { socketContext, connected } = useSocketData() as unknown as {
    socketContext: Record<string, ChartsData<AnimalTierTrends>>;
    connected: boolean;
  };
  const [cachedData, setCachedData] = useState<CachedChartData>({
    data: null,
    updated: null,
  });

  useEffect(() => {
    if (!socketContext) return;
    Object.keys(socketContext).some((key: string) => {
      if (key.startsWith(config.propagator.animal_tier_trends_key)) {
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

  useEffect(() => {
    if (cachedData.data) {
      // TODO: Implement Plotly chart rendering logic here
      // window.Plotly.newPlot(...)
    }
  }, [cachedData]);

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
      <div id="animal-tier-trends-chart" class="w-full" />
      <pre class="mt-4 p-2 bg-gray-100 rounded">
        {JSON.stringify(cachedData.data, null, 2)}
      </pre>
    </div>
  );
}
