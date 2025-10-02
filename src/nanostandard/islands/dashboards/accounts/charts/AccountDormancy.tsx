// Declare Plotly on globalThis object for TypeScript
declare global {
  interface Window {
    Plotly: any;
  }
}

import { AccountDormancy } from "../models.ts";
import { useSocketData } from "../../../SocketManager.tsx";
import { useEffect, useState } from "preact/hooks";
import { config } from "../../../../../config_loader.ts";
import { ChartsData } from "../../../../models.ts";

interface CachedChartData {
  data: AccountDormancy[] | null;
  updated: Date | null;
}

export default function AccountDormancyChart() {
  const { socketContext, connected } = useSocketData() as unknown as {
    socketContext: Record<string, ChartsData<AccountDormancy>>;
    connected: boolean;
  };
  const [cachedData, setCachedData] = useState<CachedChartData>({
    data: null,
    updated: null,
  });

  useEffect(() => {
    if (!socketContext) return;
    Object.keys(socketContext).some((key: string) => {
      if (key.startsWith(config.propagator.account_dormancy_key)) {
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
    if (cachedData.data && globalThis.Plotly) {
      // Prepare data
      const dates = cachedData.data.map((d) => new Date(d.day));
      const activityPercentage = cachedData.data.map((d) =>
        d.activity_percentage
      );
      const ma7d = cachedData.data.map((d) => d.activity_percentage_ma_7d);
      const median7d = cachedData.data.map((d) =>
        d.activity_percentage_median_7d
      );

      const layout = {
        title: {
          text: "📊 Account Activity Percentage Over Time",
          x: 0.5,
          xanchor: "center",
          font: { size: 22, family: "Arial Black" },
        },
        paper_bgcolor: "white",
        plot_bgcolor: "rgba(248, 249, 250, 0.8)",
        autosize: true,
        height: 600,
        margin: { t: 50, r: 80, b: 50, l: 80 },
        xaxis: {
          type: "date",
          tickformat: "%b %d, %Y",
          nticks: 12,
          tickangle: -30,
          gridcolor: "rgba(128, 128, 128, 0.2)",
          linecolor: "#cbd5e0",
          title: "Date",
        },
        yaxis: {
          title: "Activity Percentage (%)",
          side: "left",
          gridcolor: "rgba(128, 128, 128, 0.2)",
          linecolor: "#cbd5e0",
          tickfont: { size: 11 },
          showgrid: true,
          showspikes: true,
          spikemode: "across",
          spikesnap: "cursor",
          spikecolor: "#a0aec0",
          spikethickness: 1,
        },
        font: { family: "Arial", size: 12 },
        hovermode: "x unified",
        legend: {
          x: 0,
          y: 1,
          xanchor: "left",
          yanchor: "top",
          orientation: "v",
          bgcolor: "rgba(255, 255, 255, 0.9)",
          bordercolor: "rgba(0, 0, 0, 0.2)",
          borderwidth: 1,
        },
        barmode: "overlay",
      };

      const traces = [
        {
          x: dates,
          y: activityPercentage,
          name: "Activity Percentage",
          type: "bar",
          opacity: 0.7,
          marker: {
            color: "#4299E1",
            line: {
              color: "#3182CE",
              width: 0.5,
            },
          },
        },
        {
          x: dates,
          y: ma7d,
          name: "7-Day Moving Average",
          type: "scatter",
          mode: "lines+markers",
          line: {
            color: "#F59E0B",
            width: 3,
          },
          marker: {
            size: 4,
            symbol: "circle",
          },
        },
        {
          x: dates,
          y: median7d,
          name: "7-Day Median",
          type: "scatter",
          mode: "lines+markers",
          line: {
            color: "#8B5CF6",
            width: 3,
          },
          marker: {
            size: 4,
            symbol: "diamond",
          },
        },
      ];

      const config = {
        responsive: true,
        scrollZoom: false,
        displaylogo: false,
        dragmode: "pan",
        toImageButtonOptions: {
          format: "png",
          filename: "account_dormancy_chart",
        },
      };

      globalThis.Plotly.newPlot(
        "account-dormancy-chart",
        traces,
        layout,
        config,
      );
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
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-800">
          Account Activity Percentage
        </h3>
        <p class="text-sm text-gray-600">
          Daily account activity percentage with moving averages over time. Each
          datapoint represents how many accounts sent Ӿ over the last 30 days
          compared to how many sent over the last year.
        </p>
        <p class="text-sm text-gray-600">
          The plot gives an idea of how much activity is happening in a given
          day compared to the trend over the last year.
        </p>
      </div>
      <div id="account-dormancy-chart" class="w-full" />
    </div>
  );
}
