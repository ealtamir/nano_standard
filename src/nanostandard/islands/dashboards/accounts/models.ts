/**
 * TypeScript interfaces for accounts_dashboard materialized views
 * Generated from dbt models in models/accounts_dashboard/
 */

// BasicStats.tsx
export interface AccountBasicStats {
  total_accounts: number;
  accounts_with_balance: number;
  accounts_with_sends: number;
  accounts_with_receives_only: number;
  total_nano_under_1: number;
}

// TierBalancesDistro.tsx
export interface AccountAnimalBuckets {
  bucket:
    | "shrimp"
    | "fish"
    | "penguin"
    | "seal"
    | "dolphin"
    | "shark"
    | "whale";
  account_count: number;
  total_nano_in_bucket: number;
  min_balance_nano: number;
  max_balance_nano: number;
  avg_balance_nano: number;
  p25_balance_nano: number;
  p50_balance_nano: number;
  p75_balance_nano: number;
}

// AccountDormancy.tsx
export interface AccountDormancy {
  day: string; // date
  active_count_30d: number;
  active_count_1y: number;
  activity_percentage: number;
  activity_percentage_ma_7d: number;
  activity_percentage_median_7d: number;
}

// AccountMoneyRecency.tsx
export interface AccountMoneyRecency {
  time_bucket: string; // 'Never Sent' | '>36m' | '≤1m' | '≤2m' | etc.
  account_count: number;
  total_balance: number;
  avg_balance: number;
  min_balance: number;
  max_balance: number;
  percentage_of_accounts: number;
  percentage_of_balance: number;
}

// AccountNetworkActivityRatio.tsx
export interface AccountNetworkActivityRatio {
  bucket_tier:
    | "shrimp"
    | "fish"
    | "penguin"
    | "seal"
    | "dolphin"
    | "shark"
    | "whale";
  ratio_bucket:
    | "0"
    | "1-10"
    | "11-20"
    | "21-30"
    | "31-40"
    | "41-50"
    | "51-60"
    | "61-70"
    | "71-80"
    | "81-90"
    | "91-100";
  account_count: number;
  percentage_of_tier: number;
}

// RepChangeDistro.tsx
export interface AccountRepresentativeAnalysis {
  time_since_last_rep_change:
    | "never_changed"
    | "< 1 month"
    | "1 month"
    | "2 months"
    | "3 months"
    | "4 months"
    | "5 months"
    | "6 months"
    | "7 months"
    | "8 months"
    | "9 months"
    | "10 months"
    | "11 months"
    | "12+ months";
  representatives_count_bucket:
    | "never_changed"
    | "1"
    | "<= 5"
    | "<= 10"
    | "<= 100"
    | "> 100";
  accounts_count: number;
  total_balance: number;
  percentage_of_supply: number;
}

// TopTierBalanceDistro.tsx
export interface AccountTopTiersDistribution {
  tier_name: "seal" | "dolphin" | "shark" | "whale";
  balance: number;
}

// TransactionAndBalanceDistro.tsx
export interface AccountTransactionAndBalanceDistribution {
  transaction_bucket:
    | "1 tx"
    | "2-10 tx"
    | "11-100 tx"
    | "101-1k tx"
    | "1k+ tx";
  balance_bucket:
    | "< 1 NANO"
    | "1-10 NANO"
    | "10-100 NANO"
    | "100-1k NANO"
    | "1k-10k NANO"
    | "10k-100k NANO"
    | "100k-1M NANO"
    | "1M+ NANO";
  total_counts: number;
}

// AnimalTierTrends.tsx
export interface AnimalTierTrends {
  calculation_timestamp: string; // timestamp
  // Raw amounts
  shrimp_amount: number;
  fish_amount: number;
  penguin_amount: number;
  seal_amount: number;
  dolphin_amount: number;
  shark_amount: number;
  whale_amount: number;
  // Long-term trends
  shrimp_trend: number;
  fish_trend: number;
  penguin_trend: number;
  seal_trend: number;
  dolphin_trend: number;
  shark_trend: number;
  whale_trend: number;
  // Daily changes
  shrimp_daily_change: number;
  fish_daily_change: number;
  penguin_daily_change: number;
  seal_daily_change: number;
  dolphin_daily_change: number;
  shark_daily_change: number;
  whale_daily_change: number;
  // Market data
  usd_avg_price: number | null;
  volume_24h: number | null;
  volume_24h_sample_ts: string | null; // timestamp
}
