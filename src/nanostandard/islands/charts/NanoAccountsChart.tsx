// Declare Plotly on window object for TypeScript
declare global {
  interface Window {
    Plotly: any;
  }
}

import { NanoUniqueAccountsData } from "../../../node_interface/models.ts";
import { ChartsData } from "../../models.ts";
import { useSocketData } from "../SocketManager.tsx";
import { useContext, useEffect, useState } from "preact/hooks";
import { config } from "../../../config_loader.ts";
import {
  defaultChartConfig,
  defaultLegendConfig,
  viewType2MedianRange,
} from "./chart_data.ts";
import { ViewTypeContext } from "./ChartsContainer.tsx";

interface CachedChartData {
  data: NanoUniqueAccountsData[];
  updated: Date | null;
}

export default function NanoUniqueAccountsChart() {
  const { viewType } = useContext(ViewTypeContext);
  const { socketContext, connected } = useSocketData() as unknown as {
    socketContext: Record<string, ChartsData<NanoUniqueAccountsData>>;
    connected: boolean;
  };
  const [cachedData, setCachedData] = useState<Record<string, CachedChartData>>(
    {
      "5m": { data: [], updated: null },
      "1h": { data: [], updated: null },
      "1d": { data: [], updated: null },
    },
  );

  useEffect(() => {
    if (!socketContext) return;
    Object.keys(socketContext).some((key: string) => {
      if (key.startsWith(config.propagator.nano_unique_accounts_key)) {
        const interval: string = key.split(":").pop()!;
        const dataInCache = cachedData[interval];
        const newDataTimestamp = new Date(socketContext[key].timestamp);

        if (dataInCache.updated && dataInCache.updated > newDataTimestamp) {
          return;
        }
        setCachedData((prev) => ({
          ...prev,
          [interval]: {
            data: socketContext[key].data,
            updated: newDataTimestamp,
          },
        }));
      }
    });
  }, [socketContext]);

  if (!connected) {
    return (
      <div class="flex items-center justify-center p-4 text-gray-600">
        <div class="mr-2">⌛</div>
        Loading chart...
      </div>
    );
  }

  // Use Plotly only when it's ready
  useEffect(() => {
    if (cachedData[viewType].data.length > 0) {
      const isMobile = window.innerWidth < 768;
      const chartData = cachedData[viewType].data;

      const layout = {
        title: {
          text: "Nano Unique Accounts Transacting Over Time",
          font: {
            size: 16,
            color: "#2d3748",
          },
        },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        autosize: true,
        height: isMobile ? 500 : 600,
        margin: isMobile
          ? { t: 50, r: 45, b: 70, l: 45 }
          : { t: 50, r: 80, b: 50, l: 80 },
        xaxis: {
          type: "date",
          tickformat: "%b %d, %H:%M",
          nticks: isMobile ? 6 : Math.min(chartData.length, 24),
          tickangle: isMobile ? -45 : -30,
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
        },
        yaxis: {
          title: `Unique Accounts Over Interval / Rolling Median [${
            viewType2MedianRange(viewType)
          }] (Log Scale)`,
          type: "log",
          side: "left",
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
          tickfont: { size: isMobile ? 9 : 11 },
          showgrid: true,
          showspikes: true,
          spikemode: "across",
          spikesnap: "cursor",
          spikecolor: "#a0aec0",
          spikethickness: 1,
        },
        yaxis2: {
          title: "Cumulative Sum of Unique Accounts",
          type: "linear",
          overlaying: "y",
          side: "right",
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
          tickfont: { size: isMobile ? 9 : 11 },
          showgrid: false,
          showspikes: true,
          spikemode: "across",
          spikesnap: "cursor",
          spikecolor: "#a0aec0",
          spikethickness: 1,
        },
        hovermode: "x unified",
        legend: defaultLegendConfig,
        barmode: "overlay",
      };

      const traces = [
        {
          x: chartData.map((d) => new Date(d.time_bucket)),
          y: chartData.map((d) => d.new_accounts),
          name: "Unique Accounts",
          type: "scatter",
          mode: "lines+markers",
          yaxis: "y1",
          line: {
            color: "#4299E1",
            width: 2,
          },
          marker: {
            size: 4,
            symbol: "circle",
          },
        },
        {
          x: chartData.map((d) => new Date(d.time_bucket)),
          y: chartData.map((d) => d.rolling_median_accounts),
          name: `Rolling Median [${viewType2MedianRange(viewType)}]`,
          type: "scatter",
          mode: "lines+markers",
          yaxis: "y1",
          line: {
            color: "#48BB78",
            width: 2,
          },
          marker: {
            size: 4,
            symbol: "circle",
          },
        },
        {
          x: chartData.map((d) => new Date(d.time_bucket)),
          y: chartData.map((d) => d.cumulative_new_accounts),
          name: "Cumulative Unique Accounts",
          type: "bar",
          yaxis: "y2",
          opacity: 0.1,
          marker: {
            color: "#4299E1",
          },
        },
      ];

      window.Plotly.newPlot(
        "nano-unique-accounts-chart",
        traces,
        layout,
        defaultChartConfig,
      );
    } else {
      console.log(
        "No data available for viewType:",
        viewType,
        cachedData[viewType],
      );
    }
  }, [cachedData, viewType]);

  return (
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div id="nano-unique-accounts-chart" class="w-full" />
    </div>
  );
}
