import { useEffect, useState } from 'preact/hooks';
import { signal } from '@preact/signals';
import { useSocketData } from './SocketManager.tsx';
import { TimeSeriesData } from '../../node_interface/handlers/propagator.ts';
import { IS_BROWSER } from "$fresh/runtime.ts";
import { ChartsData } from "../models.ts";

interface CachedChartData {
  data: TimeSeriesData[];
}

interface PriceChartsProps {
  selectedCurrency: string;
}

export default function PriceCharts({ selectedCurrency }: PriceChartsProps) {
  const { data, connected } = useSocketData() as { data: ChartsData, connected: boolean };
  const [chartData, setChartData] = useState<{
    time: string[];
    nanoTransmitted: number[];
    valueTransmitted: number[];
  }>({
    time: [],
    nanoTransmitted: [],
    valueTransmitted: [],
  });

  const [viewType, setViewType] = useState<'5m' | '1h' | '1d'>('5m');
  const [plotlyReady, setPlotlyReady] = useState(IS_BROWSER && !!window.Plotly);

  const [cachedData, setCachedData] = useState<Record<string, CachedChartData>>({
    '5m': { data: [] },
    '1h': { data: [] },
    '1d': { data: [] },
  });

  useEffect(() => {
    console.log('Executing with viewType: ' + viewType)
    console.log('Data is: ', data.data)
    if (data.topic?.startsWith('timeseries-') && data.data) {
      const currentViewType = data.topic.replace('timeseries-', '') as '5m' | '1h' | '1d';
      
      setCachedData(prev => ({
        ...prev,
        [currentViewType]: { data: data.data.data.data }
      }));
    }
  }, [data]);

  useEffect(() => {
    console.log('Currency/ViewType Effect triggered:', {
      selectedCurrency,
      viewType,
      rawDataLength: cachedData[viewType].data.length
    });

    const rawData = cachedData[viewType].data;
    if (rawData.length > 0) {
      const filteredData = rawData.filter((d: TimeSeriesData) => {
        return d.currency === selectedCurrency;
      });
      
      setChartData({
        time: filteredData.map((d: TimeSeriesData) => d.interval_time.toLocaleString()),
        nanoTransmitted: filteredData.map((d: TimeSeriesData) => d.total_nano_transmitted),
        valueTransmitted: filteredData.map((d: TimeSeriesData) => d.value_transmitted_in_currency || 0),
      });
    }
  }, [viewType, selectedCurrency, cachedData]);

  // Load Plotly script with onload handler
  useEffect(() => {
    if (IS_BROWSER && !window.Plotly) {
      const script = document.createElement('script');
      script.onload = () => setPlotlyReady(true);
      script.src = 'https://cdn.plot.ly/plotly-2.35.2.min.js';
      document.head.appendChild(script);
    }
  }, []);

  // Use Plotly only when it's ready
  useEffect(() => {
    if (chartData.time.length > 0 && plotlyReady && window.Plotly) {
      const layout = {
        title: `Nano Transactions (${selectedCurrency})`,
        xaxis: {
          title: 'Time',
          type: 'date',
          tickformat: '%b %d, %H:%M',
        },
        yaxis: {
          title: 'Total Nano Transmitted',
          type: 'linear',
          rangemode: 'tozero',
          tickformat: ',',
        },
        yaxis2: {
          title: `Value in ${selectedCurrency}`,
          type: 'linear',
          rangemode: 'tozero',
          tickformat: ',',
          overlaying: 'y',
          side: 'right',
        },
        legend: {
          x: 0.01,
          y: 0.99,
          bgcolor: 'rgba(255, 255, 255, 0.5)',
          bordercolor: 'transparent',
        },
      };

      window.Plotly.newPlot('price-chart', [
        {
          x: chartData.time,
          y: chartData.nanoTransmitted,
          name: 'Total Nano Transmitted',
          type: 'scatter',
          yaxis: 'y',
        },
        {
          x: chartData.time,
          y: chartData.valueTransmitted,
          name: `Value (${selectedCurrency})`,
          type: 'scatter',
          yaxis: 'y2',
        },
      ], layout);
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
    <div>
      <div class="flex justify-center mb-4">
        <button
          class={`px-4 py-2 rounded-l ${viewType === '5m' ? 'bg-gray-200' : 'bg-white'}`}
          onClick={() => setViewType('5m')}
        >
          5m
        </button>
        <button
          class={`px-4 py-2 ${viewType === '1h' ? 'bg-gray-200' : 'bg-white'}`}
          onClick={() => setViewType('1h')}
        >
          1h
        </button>
        <button
          class={`px-4 py-2 rounded-r ${viewType === '1d' ? 'bg-gray-200' : 'bg-white'}`}
          onClick={() => setViewType('1d')}
        >
          1d
        </button>
      </div>
      <div id="price-chart" />
    </div>
  );
}
