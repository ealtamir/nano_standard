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
    if (cachedData.data && window.Plotly) {
      const isMobile = window.innerWidth < 768;

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
          text: "Account Activity Percentage Over Time",
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
          tickformat: "%b %d, %Y",
          nticks: isMobile ? 8 : 12,
          tickangle: isMobile ? -45 : -30,
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
          title: "Date",
        },
        yaxis: {
          title: "Activity Percentage (%)",
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
        hovermode: "x unified",
        legend: {
          x: 0,
          y: 1,
          xanchor: "left",
          yanchor: "top",
          orientation: "v",
          bgcolor: "rgba(255, 255, 255, 0.8)",
          bordercolor: "#e2e8f0",
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

      window.Plotly.newPlot(
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
      <div id="account-dormancy-chart" class="w-full" />
    </div>
  );
}
