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
    if (cachedData.data && window.Plotly) {
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
            "NANO Account Distribution (Log Scale): Transaction Activity vs Balance Ranges",
          x: 0.5,
          xanchor: "center",
          font: { size: 20 },
        },
        xaxis: {
          title: "Transaction Activity",
          tickangle: 45,
        },
        yaxis: {
          title: "Balance Range",
        },
        font: { size: 12 },
        margin: { l: 100, r: 50, t: 80, b: 80 },
        autosize: true,
      };

      window.Plotly.newPlot(
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
      <div id="transaction-balance-distro-chart" class="w-[1000px] h-[600px]" />
    </div>
  );
}
