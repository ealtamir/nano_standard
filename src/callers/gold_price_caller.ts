import { MetalPriceData, MetalPriceDataSchema } from "../prices_models.ts";
import sql from "../db.ts";
import { logger } from "../logger.ts";
import { PeriodicalCaller } from "./periodical_caller.ts";

export class GoldPriceCaller extends PeriodicalCaller<MetalPriceData> {
    private readonly apiKey: string;
    private readonly baseUrl = "https://www.goldapi.io/api";

    constructor(apiKey: string, intervalMs: number) {
        super(intervalMs, async (result) => {
            if (result.success) {
                await this.storePrice(result.data);
                await logger.log("Successfully stored Gold price");
            } else {
                await logger.log(`Failed to store Gold price: ${result.error}`, "ERROR");
            }
        });
        this.apiKey = apiKey;
    }

    protected async makeCall(): Promise<MetalPriceData> {
        const url = `${this.baseUrl}/XAU/USD`;
        
        const response = await fetch(url, {
            headers: {
                'x-access-token': this.apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const rawData = await response.json();
        
        // Transform API response to match our schema
        const metalPriceData = {
            timestamp: Math.floor(Date.now() / 1000),
            metal: "XAU",
            currency: "USD",
            exchange: rawData.exchange || "goldapi",
            symbol: "XAU/USD",
            prev_close_price: Number(rawData.prev_close_price) || 0,
            open_price: Number(rawData.open_price) || 0,
            low_price: Number(rawData.low_price) || 0,
            high_price: Number(rawData.high_price) || 0,
            open_time: Number(rawData.open_time) || 0,
            price: Number(rawData.price) || 0,
            ch: Number(rawData.ch) || 0,
            chp: Number(rawData.chp) || 0,
            ask: Number(rawData.ask) || 0,
            bid: Number(rawData.bid) || 0,
            price_gram_24k: Number(rawData.price_gram_24k) || 0,
            price_gram_22k: Number(rawData.price_gram_22k) || 0,
            price_gram_21k: Number(rawData.price_gram_21k) || 0,
            price_gram_20k: Number(rawData.price_gram_20k) || 0,
            price_gram_18k: Number(rawData.price_gram_18k) || 0,
            price_gram_16k: Number(rawData.price_gram_16k) || 0,
            price_gram_14k: Number(rawData.price_gram_14k) || 0,
            price_gram_10k: Number(rawData.price_gram_10k) || 0,
        };

        return MetalPriceDataSchema.parse(metalPriceData);
    }

    private async storePrice(data: MetalPriceData): Promise<void> {
        try {
            await sql`
                INSERT INTO metal_prices (
                    metal,
                    currency,
                    exchange,
                    symbol,
                    timestamp,
                    prev_close_price,
                    open_price,
                    low_price,
                    high_price,
                    open_time,
                    price,
                    change_amount,
                    change_percentage,
                    ask,
                    bid,
                    price_gram_24k,
                    price_gram_22k,
                    price_gram_21k,
                    price_gram_20k,
                    price_gram_18k,
                    price_gram_16k,
                    price_gram_14k,
                    price_gram_10k
                ) VALUES (
                    ${data.metal},
                    ${data.currency},
                    ${data.exchange},
                    ${data.symbol},
                    to_timestamp(${data.timestamp}),
                    ${data.prev_close_price},
                    ${data.open_price},
                    ${data.low_price},
                    ${data.high_price},
                    to_timestamp(${data.open_time}),
                    ${data.price},
                    ${data.ch},
                    ${data.chp},
                    ${data.ask},
                    ${data.bid},
                    ${data.price_gram_24k},
                    ${data.price_gram_22k},
                    ${data.price_gram_21k},
                    ${data.price_gram_20k},
                    ${data.price_gram_18k},
                    ${data.price_gram_16k},
                    ${data.price_gram_14k},
                    ${data.price_gram_10k}
                )
                ON CONFLICT (metal, currency, exchange, timestamp)
                DO UPDATE SET
                    price = EXCLUDED.price,
                    change_amount = EXCLUDED.change_amount,
                    change_percentage = EXCLUDED.change_percentage,
                    ask = EXCLUDED.ask,
                    bid = EXCLUDED.bid
            `;
        } catch (error) {
            await logger.log(`Error storing gold price: ${error}`, "ERROR");
            throw error;
        }
    }
}
