// Declare Plotly on globalThis object for TypeScript
declare global {
  interface Window {
    Plotly: any;
  }
}

import { AccountMoneyRecency } from "../models.ts";
import { useSocketData } from "../../../SocketManager.tsx";
import { useEffect, useState } from "preact/hooks";
import { config } from "../../../../../config_loader.ts";
import { ChartsData } from "../../../../models.ts";

interface CachedChartData {
  data: AccountMoneyRecency[] | null;
  updated: Date | null;
}

export default function AccountMoneyRecencyChart() {
  const { socketContext, connected } = useSocketData() as unknown as {
    socketContext: Record<string, ChartsData<AccountMoneyRecency>>;
    connected: boolean;
  };
  const [cachedData, setCachedData] = useState<CachedChartData>({
    data: null,
    updated: null,
  });

  useEffect(() => {
    if (!socketContext) return;
    Object.keys(socketContext).some((key: string) => {
      if (key.startsWith(config.propagator.account_money_recency_key)) {
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
      const isMobile = globalThis.innerWidth < 768;

      // Sort data by time bucket for better visualization
      const sortedData = [...cachedData.data].sort((a, b) => {
        // Custom sort order for time buckets - "Never Sent" goes last
        const timeOrder = [
          "≤1m",
          "≤2m",
          "≤3m",
          "≤4m",
          "≤5m",
          "≤6m",
          "≤7m",
          "≤8m",
          "≤9m",
          "≤10m",
          "≤11m",
          "≤12m",
          "≤13m",
          "≤14m",
          "≤15m",
          "≤16m",
          "≤17m",
          "≤18m",
          "≤19m",
          "≤20m",
          "≤21m",
          "≤22m",
          "≤23m",
          "≤24m",
          "≤25m",
          "≤26m",
          "≤27m",
          "≤28m",
          "≤29m",
          "≤30m",
          "≤31m",
          "≤32m",
          "≤33m",
          "≤34m",
          "≤35m",
          "≤36m",
          ">36m",
          "Never Sent",
        ];
        return timeOrder.indexOf(a.time_bucket) -
          timeOrder.indexOf(b.time_bucket);
      });

      // Prepare data
      const timeBuckets = sortedData.map((d) => d.time_bucket);
      const totalBalances = sortedData.map((d) => d.total_balance);

      // Create hover text with all relevant information
      const hoverText = sortedData.map((d) =>
        `<b>${d.time_bucket}</b><br>` +
        `Total Balance: ${d.total_balance.toLocaleString()} NANO<br>` +
        `Account Count: ${d.account_count.toLocaleString()}<br>` +
        `Avg Balance: ${d.avg_balance.toLocaleString()} NANO<br>` +
        `Min Balance: ${d.min_balance.toLocaleString()} NANO<br>` +
        `Max Balance: ${d.max_balance.toLocaleString()} NANO<br>` +
        `% of Accounts: ${d.percentage_of_accounts.toFixed(2)}%<br>` +
        `% of Balance: ${d.percentage_of_balance.toFixed(2)}%`
      );

      const layout = {
        title: {
          text: "Account Money Recency Distribution",
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
          ? { t: 50, r: 45, b: 100, l: 45 }
          : { t: 50, r: 80, b: 120, l: 80 },
        xaxis: {
          title: "Time Since Last Send",
          tickangle: isMobile ? -45 : -30,
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
          showgrid: false,
          categoryorder: "array",
          categoryarray: timeBuckets,
        },
        yaxis: {
          title: "Total Balance (NANO)",
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
          type: "log", // Use log scale for better visualization of large differences
        },
        hovermode: "closest",
        showlegend: false,
      };

      const trace = {
        x: timeBuckets,
        y: totalBalances,
        type: "bar",
        name: "Total Balance",
        marker: {
          color: totalBalances.map((balance) => {
            // Color bars based on percentage of total balance
            const maxBalance = Math.max(...totalBalances);
            const intensity = balance / maxBalance;
            return `rgba(66, 153, 225, ${0.3 + intensity * 0.7})`; // Blue gradient
          }),
          line: {
            color: "#3182CE",
            width: 1,
          },
        },
        hovertemplate: "%{customdata}<extra></extra>",
        customdata: hoverText,
        text: totalBalances.map((balance) => {
          // Convert to compact notation
          if (balance >= 1e9) {
            return (balance / 1e9).toFixed(1) + "B";
          } else if (balance >= 1e6) {
            return (balance / 1e6).toFixed(1) + "M";
          } else if (balance >= 1e3) {
            return (balance / 1e3).toFixed(1) + "K";
          } else {
            return balance.toFixed(0);
          }
        }),
        textposition: "outside",
        textfont: {
          size: isMobile ? 12 : 14,
          color: "#2d3748",
          family: "Inter, system-ui, sans-serif",
        },
      };

      const config = {
        responsive: true,
        scrollZoom: false,
        displaylogo: false,
        dragmode: "pan",
        toImageButtonOptions: {
          format: "png",
          filename: "account_money_recency_chart",
        },
      };

      globalThis.Plotly.newPlot(
        "account-money-recency-chart",
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
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div id="account-money-recency-chart" class="w-full" />
    </div>
  );
}
