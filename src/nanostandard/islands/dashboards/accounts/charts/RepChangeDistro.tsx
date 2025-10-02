// Declare Plotly on globalThis object for TypeScript
declare global {
  interface Window {
    Plotly: any;
  }
}

import { AccountRepresentativeAnalysis } from "../models.ts";
import { useSocketData } from "../../../SocketManager.tsx";
import { useEffect, useState } from "preact/hooks";
import { config } from "../../../../../config_loader.ts";
import { ChartsData } from "../../../../models.ts";

interface CachedChartData {
  data: AccountRepresentativeAnalysis[] | null;
  updated: Date | null;
}

export default function RepChangeDistroChart() {
  const { socketContext, connected } = useSocketData() as unknown as {
    socketContext: Record<string, ChartsData<AccountRepresentativeAnalysis>>;
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
        key.startsWith(config.propagator.account_representative_analysis_key)
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
    if (cachedData.data && globalThis.Plotly) {
      // Define the order for time and representative count buckets
      const timeOrder = [
        "never_changed",
        "< 1 month",
        "1 month",
        "2 months",
        "3 months",
        "4 months",
        "5 months",
        "6 months",
        "7 months",
        "8 months",
        "9 months",
        "10 months",
        "11 months",
        "12+ months",
      ];

      const repCountOrder = [
        "never_changed",
        "1",
        "<= 5",
        "<= 10",
        "<= 100",
        "> 100",
      ];

      // Helper function to format numbers with K and M suffixes
      const formatBalance = (value: number): string => {
        if (isNaN(value) || value === 0) {
          return "0";
        }

        if (value >= 1_000_000) {
          return `${(value / 1_000_000).toFixed(1)}M`;
        } else if (value >= 1_000) {
          return `${(value / 1_000).toFixed(1)}K`;
        } else {
          return value.toFixed(0);
        }
      };

      // Create pivot tables for percentage, balance, and count
      const pivotPercentage: number[][] = [];
      const pivotBalance: number[][] = [];
      const pivotCount: number[][] = [];
      const textData: string[][] = [];

      // Initialize pivot tables with zeros
      for (let i = 0; i < repCountOrder.length; i++) {
        pivotPercentage[i] = [];
        pivotBalance[i] = [];
        pivotCount[i] = [];
        textData[i] = [];
        for (let j = 0; j < timeOrder.length; j++) {
          pivotPercentage[i][j] = 0;
          pivotBalance[i][j] = 0;
          pivotCount[i][j] = 0;
          textData[i][j] = "";
        }
      }

      // Fill pivot tables with data
      cachedData.data.forEach((item) => {
        const timeIndex = timeOrder.indexOf(item.time_since_last_rep_change);
        const repIndex = repCountOrder.indexOf(
          item.representatives_count_bucket,
        );

        if (timeIndex !== -1 && repIndex !== -1) {
          pivotPercentage[repIndex][timeIndex] = item.percentage_of_supply;
          pivotBalance[repIndex][timeIndex] = item.total_balance;
          pivotCount[repIndex][timeIndex] = item.accounts_count;
        }
      });

      // Create text data for each cell
      for (let i = 0; i < repCountOrder.length; i++) {
        for (let j = 0; j < timeOrder.length; j++) {
          const percentageVal = pivotPercentage[i][j];
          const balanceVal = pivotBalance[i][j];
          const countVal = pivotCount[i][j];

          if (percentageVal > 0 || balanceVal > 0 || countVal > 0) {
            // Format percentage with 3 decimal places only if less than 1, otherwise 1 decimal place
            const percentageStr = percentageVal < 1
              ? `${percentageVal.toFixed(3)}%`
              : `${percentageVal.toFixed(1)}%`;

            textData[i][j] = `${percentageStr}<br>${
              formatBalance(balanceVal)
            }<br>${countVal}`;
          }
        }
      }

      // Calculate summary statistics
      const totalPercentage = cachedData.data.reduce(
        (sum, item) => sum + item.percentage_of_supply,
        0,
      );
      const totalAccounts = cachedData.data.reduce(
        (sum, item) => sum + item.accounts_count,
        0,
      );
      const totalBalance = cachedData.data.reduce(
        (sum, item) => sum + item.total_balance,
        0,
      );

      // Create custom data for hover template
      const customData = [];
      for (let i = 0; i < repCountOrder.length; i++) {
        const row = [];
        for (let j = 0; j < timeOrder.length; j++) {
          row.push([
            pivotPercentage[i][j],
            pivotBalance[i][j],
            pivotCount[i][j],
          ]);
        }
        customData.push(row);
      }

      const layout = {
        title: {
          text:
            `Representative Changes Heatmap<br><sub>Color intensity based on percentage of supply, text shows percentage, balance, and accounts</sub><br><sub>Total: ${
              totalPercentage.toFixed(2)
            }% of supply, ${totalAccounts.toLocaleString()} accounts, ${
              formatBalance(totalBalance)
            } balance</sub>`,
          font: {
            size: 16,
            color: "#2d3748",
          },
        },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        height: 600,
        margin: {
          t: 120,
          r: 100,
          b: 80,
          l: 100,
        },
        xaxis: {
          title: "Time Since Last Representative Change",
          tickangle: 45,
          tickfont: { size: 12 },
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
        },
        yaxis: {
          title: "Number of Representative Changes",
          tickfont: { size: 12 },
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
        },
        font: { size: 14 },
      };

      const trace = {
        z: pivotPercentage,
        x: timeOrder,
        y: repCountOrder,
        text: textData,
        texttemplate: "%{text}",
        textfont: { size: 12 },
        type: "heatmap",
        colorscale: "YlGnBu",
        showscale: true,
        colorbar: {
          title: "Percentage of Supply (%)",
          titleside: "right",
          titlefont: { size: 14 },
          tickfont: { size: 12 },
        },
        hovertemplate: "<b>Rep Changes: %{y}</b><br>" +
          "<b>Time Since Last Change: %{x}</b><br>" +
          "Percentage: %{customdata[0]:.3f}%<br>" +
          "Balance: %{customdata[1]:.0f}<br>" +
          "Accounts: %{customdata[2]:.0f}<extra></extra>",
        customdata: customData,
      };

      const config = {
        responsive: true,
        scrollZoom: false,
        displaylogo: false,
        dragmode: "pan",
        toImageButtonOptions: {
          format: "png",
          filename: "rep_change_distro_chart",
        },
      };

      globalThis.Plotly.newPlot(
        "rep-change-distro-chart",
        [trace],
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
    <div class="bg-white rounded-lg shadow-lg p-4 md:p-6">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-800">
          Representative Changes Distribution
        </h3>
        <p class="text-sm text-gray-600">
          Heatmap showing distribution of representative changes over time
        </p>
      </div>
      <div
        id="rep-change-distro-chart"
        class="w-full"
        style="min-height: 600px;"
      />
    </div>
  );
}
