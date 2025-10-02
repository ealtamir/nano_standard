// Declare Plotly on globalThis object for TypeScript
declare global {
  interface Window {
    Plotly: any;
  }
}

interface PlotlyTrace {
  x: number[];
  y: number[];
  mode: string;
  name: string;
  fill?: string;
  fillcolor?: string;
  line: {
    color: string;
    width: number;
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
    tickformat: string;
    range?: [number, number];
  };
  yaxis: {
    title: string;
    type: string;
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

import { AccountTopTiersDistribution } from "../models.ts";
import { useSocketData } from "../../../SocketManager.tsx";
import { useEffect, useState } from "preact/hooks";
import { config } from "../../../../../config_loader.ts";
import { ChartsData } from "../../../../models.ts";

interface CachedChartData {
  data: AccountTopTiersDistribution[] | null;
  updated: Date | null;
}

export default function TopTierBalancesDistro() {
  const { socketContext, connected } = useSocketData() as unknown as {
    socketContext: Record<string, ChartsData<AccountTopTiersDistribution>>;
    connected: boolean;
  };
  const [cachedData, setCachedData] = useState<CachedChartData>({
    data: null,
    updated: null,
  });

  useEffect(() => {
    if (!socketContext) return;
    Object.keys(socketContext).some((key: string) => {
      if (
        key.startsWith(config.propagator.account_top_tiers_distribution_key)
      ) {
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
      // Define tier configuration with colors matching AnimalTierTrends.tsx
      const tierConfig = {
        seal: {
          color: "#96CEB4",
          emoji: "🦭",
          name: "Seal",
          threshold: 933,
        },
        dolphin: {
          color: "#FFEAA7",
          emoji: "🐬",
          name: "Dolphin",
          threshold: 5200,
        },
        shark: {
          color: "#DDA0DD",
          emoji: "🦈",
          name: "Shark",
          threshold: 83100,
        },
        whale: {
          color: "#74B9FF",
          emoji: "🐋",
          name: "Whale",
          threshold: null,
        },
      };

      // Sort data by balance in descending order and take top 1000
      const sortedData = [...cachedData.data]
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 1000);

      // Calculate percentiles for x-axis (0-100%) - inverted so lower balances are on left
      const percentiles = sortedData.map((_, index) =>
        ((sortedData.length - index) / sortedData.length) * 100
      );

      // Prepare data for the chart
      const traces: PlotlyTrace[] = [];

      // Group data by tier for coloring
      const tierGroups: Record<string, { x: number[]; y: number[] }> = {};
      Object.keys(tierConfig).forEach((tier) => {
        tierGroups[tier] = { x: [], y: [] };
      });

      // Populate tier groups - x-axis will be inverted percentiles, y-axis will be balance
      sortedData.forEach((item, index) => {
        const percentile = percentiles[index];
        tierGroups[item.tier_name].x.push(percentile);
        tierGroups[item.tier_name].y.push(item.balance);
      });

      // Create traces for each tier
      Object.keys(tierConfig).forEach((tier) => {
        const config = tierConfig[tier as keyof typeof tierConfig];
        const groupData = tierGroups[tier];

        if (groupData.x.length > 0) {
          traces.push({
            x: groupData.x,
            y: groupData.y,
            mode: "markers",
            name: `${config.emoji} ${config.name}`,
            fill: "none",
            line: {
              color: config.color,
              width: 2,
            },
            hovertemplate: `<b>${config.name}</b><br>` +
              `Percentile: %{x:.1f}%<br>` +
              `Balance: %{y:,.0f} NANO<br>` +
              `<extra></extra>`,
            opacity: 0.8,
          });
        }
      });

      // Helper function to format balance amounts (currently unused but kept for future use)
      const _formatBalance = (amount: number): string => {
        if (amount >= 1e6) {
          return `${(amount / 1e6).toFixed(1)}M`;
        } else if (amount >= 1e3) {
          return `${(amount / 1e3).toFixed(1)}K`;
        } else {
          return `${amount.toFixed(0)}`;
        }
      };

      // Create the plot
      const layout: PlotlyLayout = {
        title: {
          text: "🐋 Top 1000 Accounts: Balance Distribution by Animal Tier",
          x: 0.5,
          xanchor: "center",
          font: { size: 22, family: "Arial Black" },
        },
        xaxis: {
          title: "Percentile Rank (%)",
          gridcolor: "rgba(128, 128, 128, 0.2)",
          showgrid: true,
          tickformat: ".0f",
          range: [0, 100],
        },
        yaxis: {
          title: "Account Balance (NANO)",
          type: "log",
          gridcolor: "rgba(128, 128, 128, 0.2)",
          showgrid: true,
          zeroline: false,
          zerolinecolor: "rgba(128, 128, 128, 0.5)",
          zerolinewidth: 1,
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
        hovermode: "closest",
        height: 600,
      };

      const plotlyConfig: PlotlyConfig = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
      };

      // Render the chart
      globalThis.window.Plotly.newPlot(
        "top-tier-balances-distro-chart",
        traces,
        layout,
        plotlyConfig,
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
          Top 1000 Accounts Balance Distribution
        </h3>
        <p class="text-sm text-gray-600">
          Distribution of account balances by percentile rank, colored by animal
          tier.
        </p>
        <p class="text-sm text-gray-600">
          The plot shows how much Ӿ is held by the top 1k accounts,
          coincidentally, all belonging to shark and whale tiers.
        </p>
      </div>
      <div
        id="top-tier-balances-distro-chart"
        class="w-full"
        style="min-height: 600px;"
      />
    </div>
  );
}
