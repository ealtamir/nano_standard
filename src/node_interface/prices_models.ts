import { z } from 'zod';

export const MetalPriceDataSchema = z.object({
    timestamp: z.number(),
    metal: z.string(),
    currency: z.string(),
    exchange: z.string(),
    symbol: z.string(),
    prev_close_price: z.number(),
    open_price: z.number(),
    low_price: z.number(),
    high_price: z.number(),
    open_time: z.number(),
    price: z.number(),
    ch: z.number(),
    chp: z.number(),
    ask: z.number(),
    bid: z.number(),
    price_gram_24k: z.number(),
    price_gram_22k: z.number(),
    price_gram_21k: z.number(),
    price_gram_20k: z.number(),
    price_gram_18k: z.number(),
    price_gram_16k: z.number(),
    price_gram_14k: z.number(),
    price_gram_10k: z.number(),
});

export const CurrencyPriceDataSchema = z.object({
    usd: z.number(),
    usd_market_cap: z.number(),
    usd_24h_vol: z.number(),
    usd_24h_change: z.number(),
    eur: z.number(),
    eur_market_cap: z.number(),
    eur_24h_vol: z.number(),
    eur_24h_change: z.number(),
    jpy: z.number(),
    jpy_market_cap: z.number(),
    jpy_24h_vol: z.number(),
    jpy_24h_change: z.number(),
    chf: z.number(),
    chf_market_cap: z.number(),
    chf_24h_vol: z.number(),
    chf_24h_change: z.number(),
    gbp: z.number(),
    gbp_market_cap: z.number(),
    gbp_24h_vol: z.number(),
    gbp_24h_change: z.number(),
    cny: z.number(),
    cny_market_cap: z.number(),
    cny_24h_vol: z.number(),
    cny_24h_change: z.number(),
    ars: z.number(),
    ars_market_cap: z.number(),
    ars_24h_vol: z.number(),
    ars_24h_change: z.number(),
    brl: z.number(),
    brl_market_cap: z.number(),
    brl_24h_vol: z.number(),
    brl_24h_change: z.number(),
    ils: z.number(),
    ils_market_cap: z.number(),
    ils_24h_vol: z.number(),
    ils_24h_change: z.number(),
    xau: z.number(),
    xau_market_cap: z.number(),
    xau_24h_vol: z.number(),
    xau_24h_change: z.number(),
    last_updated_at: z.number()
});

export const NanoPriceDataSchema = z.object({
    nano: CurrencyPriceDataSchema
});

// Derive the TypeScript types from the Zod schemas
export type MetalPriceData = z.infer<typeof MetalPriceDataSchema>;
export type CurrencyPriceData = z.infer<typeof CurrencyPriceDataSchema>;
export type NanoPriceData = z.infer<typeof NanoPriceDataSchema>;


