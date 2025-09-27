// Declare Plotly on globalThis object for TypeScript
declare global {
  var Plotly: {
    newPlot: (
      id: string,
      data: unknown[],
      layout: unknown,
      config?: unknown,
    ) => void;
  };
}

import { AccountNetworkActivityRatio } from "../models.ts";
import { useSocketData } from "../../../SocketManager.tsx";
import { useEffect, useState } from "preact/hooks";
import { config } from "../../../../../config_loader.ts";
import { ChartsData } from "../../../../models.ts";

interface CachedChartData {
  data: AccountNetworkActivityRatio[] | null;
  updated: Date | null;
}

export default function NetworkActivityRatioChart() {
  const { socketContext, connected } = useSocketData() as unknown as {
    socketContext: Record<string, ChartsData<AccountNetworkActivityRatio>>;
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
        key.startsWith(config.propagator.account_network_activity_ratio_key)
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
      createNetworkActivityRatioChart(cachedData.data);
    }
  }, [cachedData]);

  // Function to generate cell colors (matching Python implementation)
  const generateCellColors = (
    pivotData: { [key: string]: { [key: string]: number } },
    tiers: string[],
    ratioBuckets: string[],
  ): string[][] => {
    console.log(
      `Generating colors for data with ${tiers.length} rows and ${ratioBuckets.length} columns`,
    );

    // Get all percentage values to find min/max
    const allValues: number[] = [];
    tiers.forEach((tier) => {
      ratioBuckets.forEach((ratio) => {
        allValues.push(pivotData[tier][ratio]);
      });
    });

    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    console.log(`Value range: ${minVal.toFixed(2)} to ${maxVal.toFixed(2)}`);

    // Normalize percentage values to a 0-1 range for saturation
    let normalizedSaturation: number[][];
    if (maxVal === minVal) {
      // Handle the case where all values are the same to avoid division by zero
      normalizedSaturation = tiers.map(() => ratioBuckets.map(() => 0.7) // Use a constant mid-range saturation
      );
    } else {
      // Scale saturation between 0.2 and 1.0 for more dramatic differences
      normalizedSaturation = tiers.map((tier) =>
        ratioBuckets.map((ratio) => {
          const val = pivotData[tier][ratio];
          return ((val - minVal) / (maxVal - minVal)) * 0.8 + 0.2;
        })
      );
    }

    const numCols = ratioBuckets.length;
    const colors: string[][] = [];

    tiers.forEach((_tier, rIdx) => {
      const colorRow: string[] = [];
      ratioBuckets.forEach((_ratio, cIdx) => {
        // Map column index to hue: from orange-red (15°) to blue-green (180°)
        const hue = 15 + (cIdx / (numCols - 1)) * (180 - 15);
        const hueNormalized = hue / 360; // Convert to 0-1 range

        // Get scaled saturation for the current cell
        const saturation = normalizedSaturation[rIdx][cIdx];

        // Use a slightly higher lightness for better visibility
        const lightness = 0.55;

        // Convert HLS to RGB and format as a string for Plotly
        const rgb = hlsToRgb(hueNormalized, lightness, saturation);
        const rgbScaled = rgb.map((c) => Math.round(c * 255));
        colorRow.push(`rgb(${rgbScaled[0]}, ${rgbScaled[1]}, ${rgbScaled[2]})`);
      });
      colors.push(colorRow);
    });

    console.log(`Generated ${colors.length} rows of colors`);
    return colors;
  };

  const createNetworkActivityRatioChart = (
    data: AccountNetworkActivityRatio[],
  ) => {
    // Process data into pivot table format
    const tiers = [
      "shrimp",
      "fish",
      "penguin",
      "seal",
      "dolphin",
      "shark",
      "whale",
    ];
    const ratioBuckets = [
      "0",
      "1-10",
      "11-20",
      "21-30",
      "31-40",
      "41-50",
      "51-60",
      "61-70",
      "71-80",
      "81-90",
      "91-100",
    ];

    // Create pivot tables
    const pivotData: { [key: string]: { [key: string]: number } } = {};
    const pivotCounts: { [key: string]: { [key: string]: number } } = {};

    // Initialize pivot tables
    tiers.forEach((tier) => {
      pivotData[tier] = {};
      pivotCounts[tier] = {};
      ratioBuckets.forEach((ratio) => {
        pivotData[tier][ratio] = 0;
        pivotCounts[tier][ratio] = 0;
      });
    });

    // Fill pivot tables with data
    data.forEach((item) => {
      if (pivotData[item.bucket_tier] && pivotCounts[item.bucket_tier]) {
        pivotData[item.bucket_tier][item.ratio_bucket] =
          item.percentage_of_tier;
        pivotCounts[item.bucket_tier][item.ratio_bucket] = item.account_count;
      }
    });

    // Create color matrix using the improved algorithm
    const colorMatrix = generateCellColors(pivotData, tiers, ratioBuckets);

    // Create shapes and annotations
    const shapes: Array<{
      type: string;
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      line: { width: number };
      fillcolor: string;
    }> = [];
    const annotations: Array<{
      x: number;
      y: number;
      text: string;
      showarrow: boolean;
      font: { color: string; size: number; family: string };
    }> = [];

    tiers.forEach((tier, rIdx) => {
      ratioBuckets.forEach((ratio, cIdx) => {
        const percentage = pivotData[tier][ratio];
        const accountCount = pivotCounts[tier][ratio];
        const color = colorMatrix[rIdx][cIdx];

        // Add rectangle shape
        shapes.push({
          type: "rect",
          x0: cIdx - 0.5,
          y0: rIdx - 0.5,
          x1: cIdx + 0.5,
          y1: rIdx + 0.5,
          line: { width: 0 },
          fillcolor: color,
        });

        // Add annotation with percentage and count
        annotations.push({
          x: cIdx,
          y: rIdx,
          text: `<b>${
            percentage.toFixed(2)
          }%</b><br><span style='font-size:10px'>${
            formatNumber(accountCount)
          }</span>`,
          showarrow: false,
          font: { color: "white", size: 12, family: "Arial" },
        });
      });
    });

    // Create y-axis labels with emojis
    const emojiMap: { [key: string]: string } = {
      shrimp: "🦐",
      fish: "🐟",
      penguin: "🐧",
      seal: "🦭",
      dolphin: "🐬",
      shark: "🦈",
      whale: "🐋",
    };

    const yLabels = tiers.map((tier) =>
      `${emojiMap[tier]} ${tier.charAt(0).toUpperCase() + tier.slice(1)}`
    );

    // Create the plot
    const plotData: Array<{
      x: number[];
      y: number[];
      type: string;
      mode: string;
      marker: { size: number };
      showlegend: boolean;
    }> = [{
      x: [],
      y: [],
      type: "scatter",
      mode: "markers",
      marker: { size: 0 },
      showlegend: false,
    }];

    const layout = {
      xaxis: {
        title: "Activity Coefficient (%)",
        tickmode: "array",
        tickvals: ratioBuckets.map((_, i) => i),
        ticktext: ratioBuckets,
        side: "bottom",
        tickangle: 45,
        range: [-0.6, ratioBuckets.length - 0.4],
      },
      yaxis: {
        title: "Account Tier",
        tickmode: "array",
        tickvals: tiers.map((_, i) => i),
        ticktext: yLabels,
        autorange: "reversed",
        range: [tiers.length - 0.4, -0.6],
      },
      width: 1200,
      height: 800,
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      margin: { l: 150, r: 100, t: 120, b: 60 },
      shapes: shapes,
      annotations: [
        ...annotations,
        {
          xref: "paper",
          yref: "paper",
          x: 1.0,
          y: 1.20,
          text: "<b>Color Key:</b><br>" +
            "<b>Hue (Orange → Blue-Green)</b>: Activity Ratio<br>" +
            "<b>Saturation (Faded → Bright)</b>: % of Accounts in Tier<br>" +
            "<span style='font-size:9px'>Each cell shows percentage (bold) and account count</span>",
          showarrow: false,
          align: "left",
          font: { size: 10 },
        },
      ],
    };

    globalThis.Plotly.newPlot(
      "network-activity-ratio-chart",
      plotData,
      layout,
      {
        responsive: true,
      },
    );
  };

  // Helper function to convert HLS to RGB (matching Python colorsys.hls_to_rgb)
  const hlsToRgb = (
    h: number,
    l: number,
    s: number,
  ): [number, number, number] => {
    let r, g, b;

    if (s === 0) {
      // Achromatic (gray)
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r, g, b];
  };

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

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
      <div id="network-activity-ratio-chart" class="w-full" />
    </div>
  );
}
