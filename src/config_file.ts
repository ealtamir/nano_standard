interface NanoPriceCaller {
  interval_ms: number;
  supported_currencies: string[];
}

interface Propagator {
  range_5m: string;
  median_5m: string;
  range_1h: string;
  median_1h: string;
  range_1d: string;
  median_1d: string;
  updates_channel_name: string;
  prices_channel_name: string;
  prices_latest_key: string;
  updates_key: string;
  nano_volume_key: string;
  nano_prices_key: string;
  nano_confirmations_key: string;
  nano_unique_accounts_key: string;
  nano_bucket_distribution_key: string;
  account_animal_buckets_key: string;
  account_basic_stats_key: string;
  account_dormancy_key: string;
  account_money_recency_key: string;
  account_network_activity_ratio_key: string;
  account_representative_analysis_key: string;
  account_top_tiers_distribution_key: string;
  account_transaction_and_balance_distribution_key: string;
  animal_tier_trends_key: string;
}

export interface Config {
  node_ws_url: string;
  healthcheck_port: number;
  nano_price_caller: NanoPriceCaller;
  propagator: Propagator;
}

export const config: Config = {
  node_ws_url: "ws://192.168.1.70:7078",
  healthcheck_port: 8080,
  nano_price_caller: {
    interval_ms: 30000,
    supported_currencies: [
      "AED",
      "ARS",
      "AUD",
      "BRL",
      "CHF",
      "CNY",
      "EUR",
      "GBP",
      "ILS",
      "INR",
      "JPY",
      "MXN",
      "NGN",
      "TRY",
      "USD",
      "XAG",
      "XAU",
      "ZAR",
    ],
  },
  propagator: {
    range_5m: "1 day",
    median_5m: "2 hour",
    range_1h: "2 weeks",
    median_1h: "1 day",
    range_1d: "1 year",
    median_1d: "1 week",
    updates_channel_name: "nano:timeseries:updates",
    prices_channel_name: "nano:prices:updates",
    prices_latest_key: "nano:prices:latest",
    updates_key: "nano:timeseries:latest",
    nano_volume_key: "nano:volume",
    nano_prices_key: "nano:timeseries_prices",
    nano_confirmations_key: "nano:confirmations",
    nano_unique_accounts_key: "nano:unique_accounts",
    nano_bucket_distribution_key: "nano:bucket_distribution",
    account_animal_buckets_key: "account_animal_buckets",
    account_basic_stats_key: "account_basic_stats",
    account_dormancy_key: "account_dormancy",
    account_money_recency_key: "account_money_recency",
    account_network_activity_ratio_key: "account_network_activity_ratio",
    account_representative_analysis_key: "account_representative_analysis",
    account_top_tiers_distribution_key: "account_top_tiers_distribution",
    account_transaction_and_balance_distribution_key:
      "account_transaction_and_balance_distribution",
    animal_tier_trends_key: "animal_tier_trends",
  },
};
