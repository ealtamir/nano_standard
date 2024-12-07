import { Type } from "avsc";

export interface TimeSeriesData {
  interval_time: string | Date;
  currency: string;
  price: number;
  total_nano_transmitted: number;
  value_transmitted_in_currency: number;
  confirmation_count?: number;
  gini_coefficient?: number;
}

export interface TimeSeriesUpdate {
  timestamp: string;
  viewType: "5m" | "1h" | "1d";
  data: TimeSeriesData[];
}

export const timeSeriesDataSchema = Type.forSchema({
  type: "record",
  name: "TimeSeriesData",
  fields: [
    { name: "interval_time", type: "string" },
    { name: "currency", type: "string" },
    { name: "price", type: "double" },
    { name: "total_nano_transmitted", type: "double" },
    { name: "value_transmitted_in_currency", type: "double" },
    { name: "confirmation_count", type: ["null", "double"], default: null },
    { name: "gini_coefficient", type: ["null", "double"], default: null },
  ],
});

export const timeSeriesUpdateSchema = Type.forSchema({
  type: "record",
  name: "TimeSeriesUpdate",
  fields: [
    { name: "timestamp", type: "string" },
    {
      name: "viewType",
      type: "string",
    },
    { name: "data", type: { type: "array", items: timeSeriesDataSchema } },
  ],
});
