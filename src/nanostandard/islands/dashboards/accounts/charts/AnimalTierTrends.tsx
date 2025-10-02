// Declare Plotly on globalThis object for TypeScript
declare global {
  interface Window {
    Plotly: any;
  }
}

interface PlotlyTrace {
  x: Date[];
  y: number[];
  mode: string;
  name: string;
  line: {
    color: string;
    width: number;
    dash?: string;
  };
  hovertemplate: string;
  opacity?: number;
  showlegend?: boolean;
  hoverinfo?: string;
}

interface PlotlyLayout {
  title: {
    text: string;
    x: number;
    xanchor: string;
    font: { size: number; family: string };
  };
  xaxis: {
    title: string;
    gridcolor: string;
    showgrid: boolean;
    dtick: string;
    tickformat: string;
    tickangle: number;
    rangeselector: {
      buttons: Array<{
        count?: number;
        label: string;
        step: string;
        stepmode: string;
      }>;
    };
    rangeslider: { visible: boolean };
    type: string;
  };
  yaxis: {
    title: string;
    ticksuffix: string;
    gridcolor: string;
    showgrid: boolean;
    zeroline: boolean;
    zerolinecolor: string;
    zerolinewidth: number;
  };
  font: { family: string; size: number };
  plot_bgcolor: string;
  paper_bgcolor: string;
  showlegend: boolean;
  legend: {
    orientation: string;
    yanchor: string;
    y: number;
    xanchor: string;
    x: number;
    bgcolor: string;
    bordercolor: string;
    borderwidth: number;
  };
  hovermode: string;
  width: number;
  height: number;
}

interface PlotlyConfig {
  responsive: boolean;
  displayModeBar: boolean;
  modeBarButtonsToRemove: string[];
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
    if (cachedData.data && globalThis.window?.Plotly) {
      // Define tier configuration with colors, emojis, and baseline amounts
      const tierConfig = {
        shrimp: {
          color: "#FF6B9D",
          emoji: "🦐",
          name: "Shrimp (<0.971)",
          threshold: 0.971,
        },
        fish: {
          color: "#4ECDC4",
          emoji: "🐟",
          name: "Fish (<9.59)",
          threshold: 9.59,
        },
        penguin: {
          color: "#FF4500",
          emoji: "🐧",
          name: "Penguin (<96.34)",
          threshold: 96.34,
        },
        seal: {
          color: "#96CEB4",
          emoji: "🦭",
          name: "Seal (<933)",
          threshold: 933,
        },
        dolphin: {
          color: "#FFEAA7",
          emoji: "🐬",
          name: "Dolphin (<5.2K)",
          threshold: 5200,
        },
        shark: {
          color: "#DDA0DD",
          emoji: "🦈",
          name: "Shark (<83.1K)",
          threshold: 83100,
        },
        whale: {
          color: "#74B9FF",
          emoji: "🐋",
          name: "Whale",
          threshold: null,
        },
      };

      // Helper function to format baseline amounts
      const formatBaselineAmount = (amount: number): string => {
        if (amount >= 1e6) {
          return `${(amount / 1e6).toFixed(1)}M`;
        } else if (amount >= 1e3) {
          return `${(amount / 1e3).toFixed(1)}K`;
        } else {
          return `${amount.toFixed(0)}`;
        }
      };

      // Get baseline amounts from the first data point
      const baselineAmounts: Record<string, number> = {};
      const firstDataPoint = cachedData.data[0];
      Object.keys(tierConfig).forEach((tier) => {
        const amountKey = `${tier}_amount` as keyof AnimalTierTrends;
        baselineAmounts[tier] = firstDataPoint[amountKey] as number;
      });

      // Update tier names with baseline amounts
      Object.keys(tierConfig).forEach((tier) => {
        const config = tierConfig[tier as keyof typeof tierConfig];
        const baseline = baselineAmounts[tier];
        config.name = `${config.emoji} ${config.name.split(" ")[0]} (${
          formatBaselineAmount(baseline)
        })`;
      });

      // Prepare data for the chart
      const traces: PlotlyTrace[] = [];
      const timestamps = cachedData.data?.map((d) =>
        new Date(d.calculation_timestamp)
      ) || [];

      // Add traces for trend data (percentage changes)
      Object.keys(tierConfig).forEach((tier) => {
        const trendCol = `${tier}_trend` as keyof AnimalTierTrends;
        const config = tierConfig[tier as keyof typeof tierConfig];

        const trendData = cachedData.data?.map((d) => d[trendCol] as number) ||
          [];

        traces.push({
          x: timestamps,
          y: trendData,
          mode: "lines",
          name: config.name,
          line: {
            color: config.color,
            width: 2,
          },
          hovertemplate: `<b>${config.name}</b><br>` +
            `Date: %{x}<br>` +
            `Trend: %{y:.2f}%<br>` +
            `<extra></extra>`,
        });
      });

      // Add horizontal line at y=0 for reference
      traces.push({
        x: [timestamps[0], timestamps[timestamps.length - 1]],
        y: [0, 0],
        mode: "lines",
        name: "Zero Line",
        line: {
          dash: "dash",
          color: "gray",
          width: 1,
        },
        hovertemplate: "Zero Line<br><extra></extra>",
        opacity: 0.7,
        showlegend: false,
        hoverinfo: "skip",
      });

      // Create the plot
      const layout = {
        title: {
          text: "📈 Nano Network: Tier Balance Trends (% Change from Baseline)",
          x: 0.5,
          xanchor: "center",
          font: { size: 22, family: "Arial Black" },
        },
        xaxis: {
          title: "Date",
          gridcolor: "rgba(128, 128, 128, 0.2)",
          showgrid: true,
          dtick: "M1",
          tickformat: "%Y-%m",
          tickangle: 45,
          rangeselector: {
            buttons: [
              { count: 30, label: "30D", step: "day", stepmode: "backward" },
              { count: 90, label: "3M", step: "day", stepmode: "backward" },
              { count: 180, label: "6M", step: "day", stepmode: "backward" },
              { step: "all", label: "All" },
            ],
          },
          rangeslider: { visible: false },
          type: "date",
        },
        yaxis: {
          title: "Percentage Change (%)",
          ticksuffix: "%",
          gridcolor: "rgba(128, 128, 128, 0.2)",
          showgrid: true,
          zeroline: true,
          zerolinecolor: "rgba(128, 128, 128, 0.5)",
          zerolinewidth: 2,
        },
        font: { family: "Arial", size: 12 },
        plot_bgcolor: "rgba(248, 249, 250, 0.8)",
        paper_bgcolor: "white",
        showlegend: true,
        legend: {
          orientation: "v",
          yanchor: "top",
          y: 0.99,
          xanchor: "left",
          x: 1.01,
          bgcolor: "rgba(255, 255, 255, 0.9)",
          bordercolor: "rgba(0, 0, 0, 0.2)",
          borderwidth: 1,
        },
        hovermode: "x unified",
        height: 800,
      };

      const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
      };

      // Render the chart
      globalThis.window.Plotly.newPlot(
        "animal-tier-trends-chart",
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
        <h3 class="text-lg font-semibold text-gray-800">Tier Balance Trends</h3>
        <p class="text-sm text-gray-600">
          Percentage change from baseline for each tier over time
        </p>
      </div>
      <div
        id="animal-tier-trends-chart"
        class="w-full"
        style="min-height: 600px;"
      />
    </div>
  );
}
