// Declare Plotly on window object for TypeScript
declare global {
  interface Window {
    Plotly: any;
  }
}

import { NanoUniqueAccountsData } from "../../../node_interface/models.ts";
import { ChartProps, ChartsData } from "../../models.ts";
import { useSocketData } from "../SocketManager.tsx";
import { useEffect, useState } from "preact/hooks";
import { config } from "../../../config_loader.ts";

interface CachedChartData {
  data: NanoUniqueAccountsData[];
  updated: Date | null;
}

export default function NanoUniqueAccountsChart({ viewType }: ChartProps) {
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
        <div class="animate-spin mr-2">⌛</div>
        Loading chart...
      </div>
    );
  }

  // Use Plotly only when it's ready
  useEffect(() => {
    if (cachedData[viewType].data.length > 0) {
      const isMobile = window.innerWidth < 768;
      const chartData = cachedData[viewType].data;

      const chartConfig = {
        responsive: true,
        displayModeBar: true,
        scrollZoom: false,
        displaylogo: false,
        modeBarButtonsToAdd: ["pan2d", "zoomIn2d", "zoomOut2d", "resetScale2d"],
        modeBarButtonsToRemove: ["autoScale2d"],
        dragmode: "pan",
      };

      const layout = {
        title: {
          text: "Interactive Plot for Accounts Metrics and Cumulative Sum",
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
          title: "Time",
          type: "date",
          tickformat: "%b %d, %H:%M",
          nticks: isMobile ? 6 : Math.min(chartData.length, 12),
          tickangle: isMobile ? -45 : -30,
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
        },
        yaxis: {
          title: "Logarithmic Scale (New Accounts / Rolling Median)",
          type: "log",
          side: "left",
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
          tickfont: { size: isMobile ? 9 : 11 },
          showgrid: true,
        },
        yaxis2: {
          title: "Cumulative Sum of Accounts",
          type: "linear",
          overlaying: "y",
          side: "right",
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
          tickfont: { size: isMobile ? 9 : 11 },
          showgrid: false,
        },
        hovermode: "x unified",
        legend: {
          title: { text: "Metrics" },
          x: 0.5,
          y: -0.2,
          xanchor: "center",
          yanchor: "top",
          orientation: "h",
          bgcolor: "rgba(255, 255, 255, 0.8)",
          bordercolor: "#e2e8f0",
          borderwidth: 1,
        },
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
            size: 6,
            symbol: "circle",
          },
        },
        {
          x: chartData.map((d) => new Date(d.time_bucket)),
          y: chartData.map((d) => d.rolling_median_accounts),
          name: "Rolling Median (Unique Accounts)",
          type: "scatter",
          mode: "lines+markers",
          yaxis: "y1",
          line: {
            color: "#48BB78",
            width: 2,
          },
          marker: {
            size: 6,
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
        chartConfig,
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
