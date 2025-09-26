// Declare Plotly on window object for TypeScript
declare global {
  interface Window {
    Plotly: any;
  }
}

import { ChartsData, NanoConfirmationData } from "../../models.ts";
import { useSocketData } from "../SocketManager.tsx";
import { useContext, useEffect, useState } from "preact/hooks";
import { config } from "../../../config_loader.ts";
import {
  chartRound,
  defaultChartConfig,
  defaultLegendConfig,
  getDateFormat,
  viewType2MedianRange,
} from "./chart_data.ts";
import { ViewTypeContext } from "./ChartsContainer.tsx";

interface CachedChartData {
  data: NanoConfirmationData[];
  updated: Date | null;
}

export default function NanoConfirmationsChart() {
  const { viewType } = useContext(ViewTypeContext);
  const { socketContext, connected } = useSocketData() as unknown as {
    socketContext: Record<string, ChartsData<NanoConfirmationData>>;
    connected: boolean;
  };
  const [cachedData, setCachedData] = useState<Record<string, CachedChartData>>(
    {
      "5m": { data: [], updated: null },
      "1h": { data: [], updated: null },
      "1d": { data: [], updated: null },
      "1w": { data: [], updated: null },
    },
  );

  useEffect(() => {
    if (!socketContext) return;
    Object.keys(socketContext).some((key: string) => {
      if (key.startsWith(config.propagator.nano_confirmations_key)) {
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
          text: "Nano SEND Confirmations Over Time",
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
          : { t: 70, r: 80, b: 100, l: 80 },
        xaxis: {
          type: "date",
          tickformat: getDateFormat(viewType),
          nticks: isMobile ? 6 : Math.min(chartData.length, 24),
          tickangle: isMobile ? -45 : -30,
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
        },
        yaxis: {
          title: "SEND Confirmations",
          type: "log",
          rangemode: "tozero",
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
          tickfont: { size: isMobile ? 9 : 11 },
          showspikes: true,
          spikemode: "across",
          spikesnap: "cursor",
          spikecolor: "#a0aec0",
          spikethickness: 1,
        },
        yaxis2: {
          title: "Cumulative Confirmations Sum",
          type: "linear",
          overlaying: "y",
          side: "right",
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
          tickfont: { size: isMobile ? 9 : 11 },
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
          y: chartData.map((d) => chartRound(d.current_confirmations)),
          name: "Total Confirmations",
          type: "scatter",
          mode: "lines+markers",
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
          y: chartData.map((d) => chartRound(d.rolling_median)),
          name: `Median [${viewType2MedianRange(viewType)}]`,
          type: "scatter",
          mode: "lines+markers",
          line: {
            color: "#F59E0B",
            width: 2,
          },
          marker: {
            size: 4,
            symbol: "circle",
          },
        },
        {
          x: chartData.map((d) => new Date(d.time_bucket)),
          y: chartData.map((d) => chartRound(d.rolling_average)),
          name: `Avg [${viewType2MedianRange(viewType)}]`,
          type: "scatter",
          mode: "lines+markers",
          line: {
            color: "#8B5CF6",
            width: 2,
          },
          marker: {
            size: 4,
            symbol: "circle",
          },
        },
        {
          x: chartData.map((d) => new Date(d.time_bucket)),
          y: chartData.map((d) => d.cumulative_sum_confirmations),
          name: "Confirmations Cumulative Sum",
          type: "bar",
          yaxis: "y2",
          opacity: 0.1,
          marker: {
            color: "#4299E1",
          },
        },
      ];

      window.Plotly.newPlot(
        "confirmations-chart",
        traces,
        layout,
        defaultChartConfig,
      );
    }
  }, [cachedData, viewType]);

  return (
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div id="confirmations-chart" class="w-full" />
    </div>
  );
}
