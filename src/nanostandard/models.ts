import { TimeSeriesData } from "../node_interface/handlers/propagator.ts";

export interface ChartsData {
    topic: string;
    data: {
        timestamp: number;
        data: {
            timestamp: string;
            viewType: string;
            data: TimeSeriesData[];
        }
    }
}

export interface PriceTrackerData {
    topic: string;
    data: {
        timestamp: number;
        data: {
            [key: string]: number;
        }
    }
}
