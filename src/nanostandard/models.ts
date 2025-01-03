import { TimeSeriesData } from "../node_interface/handlers/propagator.ts";

export interface ChartsData<T> {
  timestamp: number;
  data: T[];
}

export interface PriceTrackerData {
  timestamp: number;
  data: {
    [key: string]: number;
  };
}

export interface ChartProps {
  viewType: "5m" | "1h" | "1d";
  selectedCurrency?: string;
}
