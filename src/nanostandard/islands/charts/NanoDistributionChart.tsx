// Declare Plotly on window object for TypeScript
declare global {
  interface Window {
    Plotly: any;
  }
}

import { ChartProps, ChartsData } from "../../models.ts";
import { useSocketData } from "../SocketManager.tsx";
import { useEffect, useState } from "preact/hooks";
import { config } from "../../../config_loader.ts";

interface CachedChartData {
  data: { [key: string]: string }[];
  updated: Date | null;
}

export default function NanoDistributionChart({ viewType }: ChartProps) {
  const { socketContext, connected } = useSocketData() as unknown as {
    socketContext: Record<string, ChartsData<{ [key: string]: string }>>;
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
      if (key.startsWith(config.propagator.nano_bucket_distribution_key)) {
        const interval: string = key.split(":").pop()!;
        const dataInCache = cachedData[interval];
        const newDataTimestamp = new Date(socketContext[key].timestamp);

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
      const chartData = cachedData[viewType].data;
      console.log(chartData);

      // Process the data to create normalized bucket data
      const traces = [];
      const bucketCount = 64; // 0 to 63 buckets

      for (let bucket = 0; bucket < bucketCount; bucket++) {
        const bucketKey = bucket.toString();
        // Skip empty buckets
        if (chartData.every((d) => d[bucketKey] === "0")) {
          continue;
        }

        // Calculate bucket intervals
        const bucketInterval = bucket === 63
          ? `${formatNumber(bucketLevels[bucket])}, Inf`
          : `${formatNumber(bucketLevels[bucket])}, ${
            formatNumber(bucketLevels[bucket + 1])
          }`;

        traces.push({
          x: chartData.map((d) => new Date(d.time_bucket)),
          y: chartData.map((d) => d[bucketKey]),
          name: `Bucket ${bucket} (${bucketInterval})`,
          type: "scatter",
          mode: "lines",
          stackgroup: "one",
          groupnorm: "percent",
          line: {
            width: 0.6,
            color: getBucketColor(bucket),
          },
          hovertemplate: "%{text}<extra></extra>",
          text: chartData.map((d) => {
            const value = Number(d[bucketKey]);
            const total = Object.keys(d)
              .filter((k) => !isNaN(Number(k)))
              .reduce((sum, k) => sum + Number(d[k]), 0);
            const percentage = (value / total) * 100;
            return percentage > 0
              ? `Bucket ${bucket}: ${percentage.toFixed(2)}% (${value})`
              : "";
          }),
        });
      }

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
          text: "Nano Balance Distribution Over Time",
          font: {
            size: 16,
            color: "#2d3748",
          },
        },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        autosize: true,
        height: isMobile ? 500 : 1200,
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
          title: "Percentage",
          ticksuffix: "%",
          range: [0, 100],
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
        },
        hovermode: "x unified",
        hoverlabel: {
          font: {
            size: 9,
            family: "Arial",
          },
        },
        legend: {
          title: { text: "Buckets" },
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

      window.Plotly.newPlot("nano-volume-chart", traces, layout, chartConfig);
    }
  }, [cachedData, viewType]);

  return (
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div id="nano-volume-chart" class="w-full" />
    </div>
  );
}

const bucketLevels = [
  0.0,
  6.044629098073145e-07,
  0.00030948500982134504,
  0.002630622583481433,
  0.004951760157141521,
  0.023520860746422224,
  0.042089961335702926,
  0.06065906192498363,
  0.07922816251426433,
  0.22778096722850996,
  0.3763337719427556,
  0.5248865766570012,
  0.6734393813712468,
  0.8219921860854925,
  0.9705449907997381,
  1.1190977955139838,
  1.2676506002282293,
  2.4560730379421942,
  3.6444954756561594,
  4.8329179133701246,
  6.021340351084089,
  7.209762788798055,
  8.39818522651202,
  9.586607664225985,
  10.775030101939949,
  11.963452539653915,
  13.15187497736788,
  14.340297415081844,
  15.52871985279581,
  16.717142290509774,
  17.90556472822374,
  19.093987165937705,
  20.28240960365167,
  39.29716860707511,
  58.31192761049855,
  77.32668661392199,
  96.34144561734543,
  115.35620462076888,
  134.3709636241923,
  153.38572262761576,
  172.40048163103918,
  191.41524063446263,
  210.42999963788608,
  229.4447586413095,
  248.45951764473295,
  267.4742766481564,
  286.48903565157985,
  305.5037946550033,
  324.5185536584267,
  932.9908417679768,
  1541.4631298775269,
  2149.935417987077,
  2758.407706096627,
  3366.8799942061773,
  3975.3522823157273,
  4583.824570425278,
  5192.296858534827,
  24663.41007804043,
  44134.52329754603,
  63605.63651705164,
  83076.74973655723,
  706152.3727607365,
  1329227.9957849158,
  340282366.92093843,
];

function formatNumber(number: number): string {
  if (number >= 1) {
    if (number < 1000) { // Numbers less than 1K
      return number.toFixed(2);
    } else if (number < 1_000_000) { // Thousands (K)
      return `${(number / 1_000).toFixed(2)}K`;
    } else if (number < 1_000_000_000) { // Millions (M)
      return `${(number / 1_000_000).toFixed(2)}M`;
    } else { // Billions (B)
      return `${(number / 1_000_000_000).toFixed(2)}B`;
    }
  } else if (number < 1) {
    // Numbers lower than 1 get scientific notation
    return number.toExponential(2);
  } else {
    return number.toString();
  }
}

function hlsToRgb(h: number, l: number, s: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
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
}

function getBucketColor(bucketId: number, totalBuckets: number = 64): string {
  if (bucketId < 0 || bucketId >= totalBuckets) {
    throw new Error("bucketId must be in the range [0..63].");
  }

  // fraction in [0..1]
  const fraction = bucketId / (totalBuckets - 1);

  // Partial hue sweep: from 240° (blue) down to 0° (red)
  const hueStart = 240.0; // Blue
  const hueEnd = 0.0; // Red
  const hue = hueStart + fraction * (hueEnd - hueStart);

  const saturation = 0.8;
  const lightness = 0.5;

  // Convert HLS to RGB
  const [r, g, b] = hlsToRgb(hue / 360, lightness, saturation);

  // Convert to hex
  const toHex = (n: number) =>
    Math.round(n * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
