export type ViewType = "5m" | "1h" | "1d" | "1w";
export interface ChartsData<T> {
  timestamp: number;
  data: T[];
}

export interface PriceTrackerData {
  timestamp: number;
  data: { currency: string; price: string; last_updated_at: string }[];
}

export interface ChartProps {
  viewType: ViewType;
  selectedCurrency?: string;
}

export interface NanoVolumeData {
  time_bucket: string;
  amount_nano: number;
  rolling_median: number;
}

export interface NanoConfirmations {
  time_bucket: string;
  current_confirmations: number;
  rolling_median: number;
  cumulative_sum_confirmations: number;
}

export interface NanoPricesData {
  time_bucket: string;
  currency: string;
  price: string;
  total_nano_transmitted: string;
  value_transmitted_in_currency: string;
}

export interface NanoUniqueAccounts {
  time_bucket: string;
  new_accounts: number;
  cumulative_new_accounts: number;
  rolling_median_accounts: number;
}

export interface NanoBucketDistribution {
  time_bucket: string;
  [key: string]: string | number; // Allow numeric string keys with number values, plus the time_bucket string
}

export interface NanoVolumeData {
  time_bucket: string;
  total_nano_transmitted: number;
  rolling_median: number;
  rolling_average: number;
}

export interface NanoPriceData {
  time_bucket: string;
  currency: string;
  price: number;
  total_nano_transmitted: number;
  value_transmitted_in_currency: number;
  rolling_median_value: number;
  rolling_average_value: number;
}

export interface NanoConfirmationData {
  time_bucket: string;
  current_confirmations: number;
  rolling_median: number;
  rolling_average: number;
  cumulative_sum_confirmations: number;
}

export interface NanoUniqueAccountsData {
  time_bucket: string;
  new_accounts: number;
  rolling_median_accounts: number;
  rolling_average_accounts: number;
  cumulative_new_accounts: number;
}
