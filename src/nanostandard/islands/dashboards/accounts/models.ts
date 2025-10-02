/**
 * Zod schemas for accounts_dashboard materialized views
 * Generated from dbt models in models/accounts_dashboard/
 * Includes automatic coercion for string-to-number conversion
 */

import { z } from "zod";

// BasicStats.tsx
export const AccountBasicStatsSchema = z.object({
  total_accounts: z.coerce.number(),
  accounts_with_balance: z.coerce.number(),
  accounts_with_sends: z.coerce.number(),
  accounts_with_receives_only: z.coerce.number(),
  total_nano_under_1: z.coerce.number(),
});

export type AccountBasicStats = z.infer<typeof AccountBasicStatsSchema>;

// TierBalancesDistro.tsx
export const AccountAnimalBucketsSchema = z.object({
  bucket: z.coerce.string(),
  account_count: z.coerce.number(),
  total_nano_in_bucket: z.coerce.number(),
  min_balance_nano: z.coerce.number(),
  max_balance_nano: z.coerce.number(),
  avg_balance_nano: z.coerce.number(),
  p25_balance_nano: z.coerce.number(),
  p50_balance_nano: z.coerce.number(),
  p75_balance_nano: z.coerce.number(),
});

export type AccountAnimalBuckets = z.infer<typeof AccountAnimalBucketsSchema>;

// AccountDormancy.tsx
export const AccountDormancySchema = z.object({
  day: z.string(), // date
  active_count_30d: z.coerce.number(),
  active_count_1y: z.coerce.number(),
  activity_percentage: z.coerce.number(),
  activity_percentage_ma_7d: z.coerce.number(),
  activity_percentage_median_7d: z.coerce.number(),
});

export type AccountDormancy = z.infer<typeof AccountDormancySchema>;

// AccountMoneyRecency.tsx
export const AccountMoneyRecencySchema = z.object({
  time_bucket: z.string(), // 'Never Sent' | '>36m' | '≤1m' | '≤2m' | etc.
  account_count: z.coerce.number(),
  total_balance: z.coerce.number(),
  avg_balance: z.coerce.number(),
  min_balance: z.coerce.number(),
  max_balance: z.coerce.number(),
  percentage_of_accounts: z.coerce.number(),
  percentage_of_balance: z.coerce.number(),
});

export type AccountMoneyRecency = z.infer<typeof AccountMoneyRecencySchema>;

// AccountNetworkActivityRatio.tsx
export const AccountNetworkActivityRatioSchema = z.object({
  bucket_tier: z.coerce.string(),
  ratio_bucket: z.coerce.string(),
  account_count: z.coerce.number(),
  percentage_of_tier: z.coerce.number(),
});

export type AccountNetworkActivityRatio = z.infer<
  typeof AccountNetworkActivityRatioSchema
>;

// RepChangeDistro.tsx
export const AccountRepresentativeAnalysisSchema = z.object({
  time_since_last_rep_change: z.coerce.string(),
  representatives_count_bucket: z.coerce.string(),
  accounts_count: z.coerce.number(),
  total_balance: z.coerce.number(),
  percentage_of_supply: z.coerce.number(),
});

export type AccountRepresentativeAnalysis = z.infer<
  typeof AccountRepresentativeAnalysisSchema
>;

// TopTierBalanceDistro.tsx
export const AccountTopTiersDistributionSchema = z.object({
  tier_name: z.coerce.string(),
  balance: z.coerce.number(),
});

export type AccountTopTiersDistribution = z.infer<
  typeof AccountTopTiersDistributionSchema
>;

// TransactionAndBalanceDistro.tsx
export const AccountTransactionAndBalanceDistributionSchema = z.object({
  transaction_bucket: z.coerce.string(),
  balance_bucket: z.coerce.string(),
  total_counts: z.coerce.number(),
});

export type AccountTransactionAndBalanceDistribution = z.infer<
  typeof AccountTransactionAndBalanceDistributionSchema
>;

// AnimalTierTrends.tsx
export const AnimalTierTrendsSchema = z.object({
  calculation_timestamp: z.string(), // timestamp
  // Raw amounts
  shrimp_amount: z.coerce.number(),
  fish_amount: z.coerce.number(),
  penguin_amount: z.coerce.number(),
  seal_amount: z.coerce.number(),
  dolphin_amount: z.coerce.number(),
  shark_amount: z.coerce.number(),
  whale_amount: z.coerce.number(),
  // Long-term trends
  shrimp_trend: z.coerce.number(),
  fish_trend: z.coerce.number(),
  penguin_trend: z.coerce.number(),
  seal_trend: z.coerce.number(),
  dolphin_trend: z.coerce.number(),
  shark_trend: z.coerce.number(),
  whale_trend: z.coerce.number(),
  // Daily changes
  shrimp_daily_change: z.coerce.number(),
  fish_daily_change: z.coerce.number(),
  penguin_daily_change: z.coerce.number(),
  seal_daily_change: z.coerce.number(),
  dolphin_daily_change: z.coerce.number(),
  shark_daily_change: z.coerce.number(),
  whale_daily_change: z.coerce.number(),
  // Market data
  usd_avg_price: z.coerce.number().nullable(),
  volume_24h: z.coerce.number().nullable(),
  volume_24h_sample_ts: z.string().nullable(), // timestamp
});

export type AnimalTierTrends = z.infer<typeof AnimalTierTrendsSchema>;
