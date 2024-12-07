import { useEffect, useState } from "preact/hooks";
import { signal } from "@preact/signals";
import { useSocketData } from "./SocketManager.tsx";
import { TimeSeriesData } from "../../node_interface/handlers/propagator.ts";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { ChartsData } from "../models.ts";

interface CachedChartData {
  data: TimeSeriesData[];
}

interface PriceChartsProps {
  selectedCurrency: string;
}

export default function PriceCharts({ selectedCurrency }: PriceChartsProps) {
  const { data, connected } = useSocketData() as unknown as {
    data: ChartsData;
    connected: boolean;
  };
  const [chartData, setChartData] = useState<{
    time: string[];
    nanoTransmitted: number[];
    valueTransmitted: number[];
    price: number[];
    confirmationCount?: number[];
    giniCoefficient?: number[];
  }>({
    time: [],
    nanoTransmitted: [],
    valueTransmitted: [],
    price: [],
    confirmationCount: [],
    giniCoefficient: [],
  });

  const [viewType, setViewType] = useState<"5m" | "1h" | "1d">("5m");
  const [plotlyReady, setPlotlyReady] = useState(IS_BROWSER && !!window.Plotly);

  const [cachedData, setCachedData] = useState<Record<string, CachedChartData>>(
    {
      "5m": { data: [] },
      "1h": { data: [] },
      "1d": { data: [] },
    },
  );

  useEffect(() => {
    console.debug("Executing with viewType: " + viewType);
    console.debug("Data is: ", data.data);
    if (data.topic?.startsWith("timeseries-") && data.data) {
      const currentViewType = data.topic.replace("timeseries-", "") as
        | "5m"
        | "1h"
        | "1d";

      setCachedData((prev) => ({
        ...prev,
        [currentViewType]: { data: data.data.data.data },
      }));
    }
  }, [data]);

  useEffect(() => {
    console.debug("Currency/ViewType Effect triggered:", {
      selectedCurrency,
      viewType,
      rawDataLength: cachedData[viewType].data.length,
    });

    const rawData = cachedData[viewType].data;
    if (rawData.length > 0) {
      const userLocale = IS_BROWSER ? navigator.language : "en-US";
      const filteredData = rawData.filter((d: TimeSeriesData) => {
        return d.currency === selectedCurrency;
      });

      setChartData({
        time: filteredData.map((d: TimeSeriesData) => {
          return new Date(d.interval_time);
        }),
        nanoTransmitted: filteredData.map((d: TimeSeriesData) =>
          d.total_nano_transmitted
        ),
        valueTransmitted: filteredData.map((d: TimeSeriesData) =>
          d.value_transmitted_in_currency || 0
        ),
        price: filteredData.map((d: TimeSeriesData) => d.price || 0),
        confirmationCount: filteredData.map((d: TimeSeriesData) =>
          d.confirmation_count || 0
        ),
        giniCoefficient: filteredData.map((d: TimeSeriesData) =>
          d.gini_coefficient || 0
        ),
      });
    }
  }, [viewType, selectedCurrency, cachedData]);

  // Load Plotly script with onload handler
  useEffect(() => {
    if (IS_BROWSER && !window.Plotly) {
      const script = document.createElement("script");
      script.onload = () => setPlotlyReady(true);
      script.src = "https://cdn.plot.ly/plotly-2.35.2.min.js";
      document.head.appendChild(script);
    }
  }, []);

  // Use Plotly only when it's ready
  useEffect(() => {
    if (chartData.time.length > 0 && plotlyReady && window.Plotly) {
      const isMobile = window.innerWidth < 768;

      const config = {
        responsive: true,
        displayModeBar: true,
        scrollZoom: true,
        displaylogo: false,
        modeBarButtonsToAdd: ["pan2d", "zoomIn2d", "zoomOut2d", "resetScale2d"],
        modeBarButtonsToRemove: ["autoScale2d"],
      };

      const layout = {
        title: {
          text: `Nano Transactions (${selectedCurrency})`,
          font: {
            size: 24,
            color: "#2d3748",
          },
        },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        autosize: true,
        height: isMobile ? 400 : 500,
        margin: isMobile
          ? { t: 50, r: 45, b: 70, l: 45 }
          : { t: 70, r: 80, b: 100, l: 80 },
        xaxis: {
          title: "Time",
          type: "date",
          tickformat: "%b %d, %H:%M",
          nticks: isMobile
            ? Math.min(chartData.time.length, 6)
            : Math.min(chartData.time.length, 50),
          tickangle: isMobile ? -90 : -45,
          tickmode: "auto",
          tickfont: { size: isMobile ? 9 : 11 },
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
          rangeslider: {
            visible: true,
            thickness: 0.1,
            bgcolor: "rgba(240, 240, 240, 0.5)",
          },
          rangeselector: {
            buttons: viewType === "5m"
              ? [
                { count: 1, label: "1H", step: "hour", stepmode: "backward" },
                { count: 6, label: "6H", step: "hour", stepmode: "backward" },
                { count: 24, label: "24H", step: "hour", stepmode: "backward" },
                { step: "all", label: "All" },
              ]
              : viewType === "1h"
              ? [
                { count: 6, label: "6H", step: "hour", stepmode: "backward" },
                { count: 24, label: "24H", step: "hour", stepmode: "backward" },
                { step: "all", label: "All" },
              ]
              : [ // 1d view
                { count: 3, label: "3D", step: "day", stepmode: "backward" },
                { count: 7, label: "7D", step: "day", stepmode: "backward" },
                { step: "all", label: "All" },
              ],
            y: isMobile ? 1.1 : 1.02,
            x: 0,
            font: { size: isMobile ? 9 : 11 },
          },
        },
        yaxis: {
          title: "Total Nano Transmitted",
          type: "linear",
          rangemode: "tozero",
          tickformat: ".2~s",
          gridcolor: "#e2e8f0",
          linecolor: "#cbd5e0",
          tickfont: { size: isMobile ? 9 : 11 },
          showticklabels: isMobile ? "first last" : true,
          showspikes: true,
          spikemode: "across",
          spikesnap: "cursor",
          spikecolor: "#a0aec0",
          spikethickness: 1,
        },
        yaxis2: {
          title: `Transmitted Value in ${selectedCurrency}`,
          type: "linear",
          rangemode: "tozero",
          tickformat: ".2~s",
          overlaying: "y",
          side: "right",
          gridcolor: "#e2e8f0",
          tickfont: { size: isMobile ? 9 : 11 },
          showticklabels: isMobile ? "first last" : true,
          showspikes: true,
          spikemode: "across",
          spikesnap: "cursor",
          spikecolor: "#a0aec0",
          spikethickness: 1,
        },
        yaxis3: {
          title: `1 XNO Price (${selectedCurrency})`,
          type: "linear",
          rangemode: "tozero",
          tickformat: ".3f",
          overlaying: "y",
          side: "right",
          position: isMobile ? 0.9 : 0.85,
          tickfont: { size: isMobile ? 9 : 11 },
          showticklabels: isMobile ? "first last" : true,
          showspikes: true,
          spikemode: "across",
          spikesnap: "cursor",
          spikecolor: "#a0aec0",
          spikethickness: 1,
        },
        yaxis4: {
          title: "Confirmation Count",
          type: "linear",
          rangemode: "tozero",
          tickformat: ".0f",
          overlaying: "y",
          side: "right",
          position: isMobile ? 0.98 : 0.95,
          tickfont: { size: isMobile ? 9 : 11 },
          showticklabels: isMobile ? "first last" : true,
          showspikes: true,
          spikemode: "across",
          spikesnap: "cursor",
          spikecolor: "#a0aec0",
          spikethickness: 1,
        },
        yaxis5: {
          title: "Gini Coefficient",
          type: "linear",
          rangemode: "tozero",
          tickformat: ".3f",
          overlaying: "y",
          side: "left",
          position: isMobile ? 0.1 : 0.15,
          tickfont: { size: isMobile ? 9 : 11 },
          showticklabels: isMobile ? "first last" : true,
          showspikes: true,
          spikemode: "across",
          spikesnap: "cursor",
          spikecolor: "#a0aec0",
          spikethickness: 1,
        },
        legend: {
          x: isMobile ? 0.5 : 0.01,
          y: isMobile ? -0.2 : 0.99,
          bgcolor: "rgba(255, 255, 255, 0.8)",
          bordercolor: "#e2e8f0",
          borderwidth: 1,
          orientation: isMobile ? "h" : "v",
          font: { size: isMobile ? 7 : 8 },
          xanchor: isMobile ? "center" : "left",
        },
        responsive: true,
      };

      const traces = [
        {
          x: chartData.time,
          y: chartData.nanoTransmitted,
          name: "Total Nano Transmitted",
          type: "scatter",
          yaxis: "y",
          line: {
            color: "#4299E1",
            width: 2,
          },
        },
        {
          x: chartData.time,
          y: chartData.valueTransmitted,
          name: `Value (${selectedCurrency})`,
          type: "scatter",
          yaxis: "y2",
          line: {
            color: "#48BB78",
            width: 2,
          },
        },
        {
          x: chartData.time,
          y: chartData.price,
          name: `Price (${selectedCurrency})`,
          type: "scatter",
          yaxis: "y3",
          line: {
            color: "#F6AD55",
            width: 2,
            dash: "dot",
          },
        },
        {
          x: chartData.time,
          y: chartData.confirmationCount,
          name: "Confirmations",
          type: "scatter",
          yaxis: "y4",
          line: {
            color: "#9F7AEA", // Purple
            width: 2,
            dash: "dashdot",
          },
        },
        {
          x: chartData.time,
          y: chartData.giniCoefficient,
          name: "Gini Coefficient",
          type: "scatter",
          yaxis: "y5",
          line: {
            color: "#ED64A6", // Pink
            width: 2,
            dash: "solid",
          },
        },
      ];

      window.Plotly.newPlot("price-chart", traces, layout, config);
    }
  }, [chartData, plotlyReady, selectedCurrency]);

  if (!connected || !plotlyReady) {
    return (
      <div class="flex items-center justify-center p-4 text-gray-600">
        <div class="animate-spin mr-2">⌛</div>
        Connecting to price feed...
      </div>
    );
  }

  return (
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-center mb-6">
        <div class="inline-flex rounded-md shadow-sm">
          <button
            class={`px-6 py-2 text-sm font-medium border transition-colors duration-200 ease-in-out
              ${
              viewType === "5m"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            } 
              rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            onClick={() => setViewType("5m")}
          >
            5m
          </button>
          <button
            class={`px-6 py-2 text-sm font-medium border-t border-b transition-colors duration-200 ease-in-out
              ${
              viewType === "1h"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }
              focus:z-10 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            onClick={() => setViewType("1h")}
          >
            1h
          </button>
          <button
            class={`px-6 py-2 text-sm font-medium border transition-colors duration-200 ease-in-out
              ${
              viewType === "1d"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }
              rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            onClick={() => setViewType("1d")}
          >
            1d
          </button>
        </div>
      </div>
      <div id="price-chart" class="w-full" />
      <div class="text-xs text-gray-500 mt-4 space-y-1">
        <p>
          * Only confirmed "send" blocks that reached active quorum are counted
          in these statistics.
        </p>
        <p class="flex items-center gap-2">
          † Gini coefficient measures wealth distribution (0 = perfect equality,
          1 = perfect inequality). It's defined as:
          <a href="/gini_coefficient.png" target="_blank">
            <img
              src="/gini_coefficient.png"
              alt="Gini Coefficient Formula"
              class="w-auto inline cursor-pointer hover:opacity-80 transition-opacity"
              style="height: 60px;"
            />
          </a>
        </p>
      </div>
    </div>
  );
}
