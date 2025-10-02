// Declare Plotly on window object for TypeScript
declare global {
  interface Window {
    Plotly: any;
  }
}

import { AccountTransactionAndBalanceDistribution } from "../models.ts";
import { useSocketData } from "../../../SocketManager.tsx";
import { useEffect, useState } from "preact/hooks";
import { config } from "../../../../../config_loader.ts";
import { ChartsData } from "../../../../models.ts";

interface CachedChartData {
  data: AccountTransactionAndBalanceDistribution[] | null;
  updated: Date | null;
}

export default function TransactionBalanceDistroChart() {
  const { socketContext, connected } = useSocketData() as unknown as {
    socketContext: Record<
      string,
      ChartsData<AccountTransactionAndBalanceDistribution>
    >;
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
        key.startsWith(
          config.propagator.account_transaction_and_balance_distribution_key,
        )
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
      const balanceOrder = [
        "< 1 NANO",
        "1-10 NANO",
        "10-100 NANO",
        "100-1k NANO",
        "1k-10k NANO",
        "10k-100k NANO",
        "100k-1M NANO",
        "1M+ NANO",
      ];
      const transactionOrder = [
        "1 tx",
        "2-10 tx",
        "11-100 tx",
        "101-1k tx",
        "1k+ tx",
      ];

      const pivotData = new Map<string, Map<string, number>>();
      cachedData.data.forEach((item) => {
        if (!pivotData.has(item.balance_bucket)) {
          pivotData.set(item.balance_bucket, new Map<string, number>());
        }
        pivotData.get(item.balance_bucket)!.set(
          item.transaction_bucket,
          item.total_counts,
        );
      });

      const z: number[][] = [];
      const customdata: number[][] = [];

      for (const balance of balanceOrder) {
        const row_z: number[] = [];
        const row_custom: number[] = [];
        for (const tx of transactionOrder) {
          const count = pivotData.get(balance)?.get(tx) ?? 0;
          row_z.push(Math.log10(count + 1));
          row_custom.push(count);
        }
        z.push(row_z);
        customdata.push(row_custom);
      }

      const data = [{
        z,
        x: transactionOrder,
        y: balanceOrder,
        type: "heatmap",
        colorscale: "YlGnBu",
        hoverongaps: false,
        hovertemplate:
          "<b>Balance:</b> %{y}<br><b>Transactions:</b> %{x}<br><b>Account Count:</b> %{customdata:,}<br><b>Log10 Count:</b> %{z:.2f}<extra></extra>",
        customdata,
        colorbar: {
          title: "Log10(Number of Accounts)",
        },
      }];

      const layout = {
        title: {
          text:
            "📊 NANO Account Distribution (Log Scale): Transaction Activity vs Balance Ranges",
          x: 0.5,
          xanchor: "center",
          font: { size: 22, family: "Arial Black" },
        },
        xaxis: {
          title: "Transaction Activity",
          tickangle: 45,
          gridcolor: "rgba(128, 128, 128, 0.2)",
          showgrid: true,
        },
        yaxis: {
          title: "Balance Range",
          gridcolor: "rgba(128, 128, 128, 0.2)",
          showgrid: true,
        },
        font: { family: "Arial", size: 12 },
        plot_bgcolor: "rgba(248, 249, 250, 0.8)",
        paper_bgcolor: "white",
        margin: { l: 100, r: 50, t: 80, b: 80 },
        height: 800,
      };

      globalThis.Plotly.newPlot(
        "transaction-balance-distro-chart",
        data,
        layout,
        { responsive: true },
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
          Transaction vs Balance Distribution
        </h3>
        <p class="text-sm text-gray-600">
          Heatmap showing account distribution by transaction activity and
          balance ranges (log scale)
        </p>
      </div>
      <div id="transaction-balance-distro-chart" class="w-full" />
    </div>
  );
}
