// Declare Plotly on window object for TypeScript
declare global {
  interface Window {
    Plotly: any;
  }
}

import { NanoPriceData } from "../../../node_interface/models.ts";
import { ChartProps, ChartsData } from "../../models.ts";
import { useSocketData } from "../SocketManager.tsx";
import { useEffect, useState } from "preact/hooks";
import { config } from "../../../config_loader.ts";

interface CachedChartData {
  data: NanoPriceData[];
  updated: Date | null;
}

export default function NanoPricesChart({
  viewType,
  selectedCurrency,
}: ChartProps) {
  const { socketContext, connected } = useSocketData() as unknown as {
    socketContext: Record<string, ChartsData<NanoPriceData>>;
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
      if (key.startsWith(config.propagator.nano_prices_key)) {
        const interval: string = key.split(":").pop()!;
        const dataInCache = cachedData[interval];
        const newDataTimestamp = new Date(socketContext[key].timestamp);
        console.debug("NanoPricesChart: newDataTimestamp", newDataTimestamp);

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
      const chartData = cachedData[viewType].data.filter(
        (d) => d.currency.toUpperCase() === selectedCurrency?.toUpperCase(),
      );

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
          text:
            `Interactive Plot for NANO Prices and Value Transmitted (${selectedCurrency})`,
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
          title:
            `Logarithmic Scale (Value Transmitted / Rolling Mean) ${selectedCurrency}`,
          type: "log",
          side: "left",
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
          tickfont: { size: isMobile ? 9 : 11 },
          showgrid: true,
        },
        yaxis2: {
          title: "Price (NANO)",
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
      };

      const traces = [
        {
          x: chartData.map((d) => new Date(d.time_bucket)),
          y: chartData.map((d) => d.value_transmitted_in_currency),
          name: "Value Transmitted",
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
          y: chartData.map((d) => d.rolling_median),
          name: "Rolling Median (2h)",
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
          y: chartData.map((d) => d.price),
          name: "Price (NANO)",
          type: "scatter",
          mode: "lines+markers",
          yaxis: "y2",
          line: {
            color: "#F6AD55",
            width: 2,
          },
          marker: {
            size: 6,
            symbol: "circle",
          },
        },
      ];

      window.Plotly.newPlot("nano-prices-chart", traces, layout, chartConfig);
    }
  }, [cachedData, viewType, selectedCurrency]);

  return (
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div id="nano-prices-chart" class="w-full" />
    </div>
  );
}
