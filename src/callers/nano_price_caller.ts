import { NanoPriceData, NanoPriceDataSchema } from "../prices_models.ts";
import sql from "../db.ts";
import { logger } from "../logger.ts";
import { PeriodicalCaller } from "./periodical_caller.ts";

export class NanoPriceCaller extends PeriodicalCaller<NanoPriceData> {
    private readonly apiKey: string;
    private readonly baseUrl = "https://api.coingecko.com/api/v3";
    private readonly SUPPORTED_CURRENCIES = [
        'usd', 'eur', 'jpy', 'chf', 'gbp', 
        'cny', 'ars', 'brl', 'ils', 'xau', 'inr'
    ];

    constructor(apiKey: string, intervalMs: number) {
        super(intervalMs, async (result) => {
            if (result.success) {
                await this.storePrices(result.data);
                await logger.log("Successfully stored Nano prices");
            } else {
                await logger.log(`Failed to store Nano prices: ${result.error}`, "ERROR");
            }
        });
        this.apiKey = apiKey;
    }

    protected async makeCall(): Promise<NanoPriceData> {
        const params = new URLSearchParams({
            ids: 'nano',
            vs_currencies: this.SUPPORTED_CURRENCIES.join(','),
            include_market_cap: 'true',
            include_24hr_vol: 'true',
            include_24hr_change: 'true',
            include_last_updated_at: 'true',
            x_cg_demo_api_key: this.apiKey
        });

        const url = `${this.baseUrl}/simple/price?${params.toString()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const rawData = await response.json();
        return NanoPriceDataSchema.parse(rawData);
    }

    private async storePrices(data: NanoPriceData): Promise<void> {
        const { nano } = data;
        const timestamp = new Date();

        const currencies = [
            { code: "USD", data: { price: nano.usd, market_cap: nano.usd_market_cap, volume_24h: nano.usd_24h_vol, percent_change_24h: nano.usd_24h_change } },
            { code: "EUR", data: { price: nano.eur, market_cap: nano.eur_market_cap, volume_24h: nano.eur_24h_vol, percent_change_24h: nano.eur_24h_change } },
            { code: "JPY", data: { price: nano.jpy, market_cap: nano.jpy_market_cap, volume_24h: nano.jpy_24h_vol, percent_change_24h: nano.jpy_24h_change } },
            { code: "CHF", data: { price: nano.chf, market_cap: nano.chf_market_cap, volume_24h: nano.chf_24h_vol, percent_change_24h: nano.chf_24h_change } },
            { code: "GBP", data: { price: nano.gbp, market_cap: nano.gbp_market_cap, volume_24h: nano.gbp_24h_vol, percent_change_24h: nano.gbp_24h_change } },
            { code: "CNY", data: { price: nano.cny, market_cap: nano.cny_market_cap, volume_24h: nano.cny_24h_vol, percent_change_24h: nano.cny_24h_change } },
            { code: "ARS", data: { price: nano.ars, market_cap: nano.ars_market_cap, volume_24h: nano.ars_24h_vol, percent_change_24h: nano.ars_24h_change } },
            { code: "BRL", data: { price: nano.brl, market_cap: nano.brl_market_cap, volume_24h: nano.brl_24h_vol, percent_change_24h: nano.brl_24h_change } },
            { code: "ILS", data: { price: nano.ils, market_cap: nano.ils_market_cap, volume_24h: nano.ils_24h_vol, percent_change_24h: nano.ils_24h_change } },
            { code: "XAU", data: { price: nano.xau, market_cap: nano.xau_market_cap, volume_24h: nano.xau_24h_vol, percent_change_24h: nano.xau_24h_change } }
        ];

        // Process in chunks of 3 concurrent operations
        const chunkSize = 3;
        for (let i = 0; i < currencies.length; i += chunkSize) {
            const chunk = currencies.slice(i, i + chunkSize);
            await Promise.all(
                chunk.map(currency => 
                    // last updated at is the same for all currencies
                    this.storePriceForCurrency("NANO", currency.code, timestamp, {...currency.data, last_updated_at: nano.last_updated_at})
                )
            );
        }
    }

    private async storePriceForCurrency(
        symbol: string,
        currency: string,
        timestamp: Date,
        data: {
            price: number;
            market_cap: number;
            volume_24h: number;
            percent_change_24h: number;
            last_updated_at: number;
        }
    ): Promise<void> {
        try {
            await sql`
                INSERT INTO crypto_prices (
                    symbol,
                    currency,
                    price,
                    market_cap,
                    volume_24h,
                    percent_change_24h,
                    last_updated_at,
                    created_at
                ) VALUES (
                    ${symbol},
                    ${currency},
                    ${data.price},
                    ${data.market_cap},
                    ${data.volume_24h},
                    ${data.percent_change_24h},
                    to_timestamp(${data.last_updated_at}),
                    ${timestamp}
                )
            `;
        } catch (error) {
            await logger.log(`Error storing price for ${symbol}/${currency}: ${error}`, "ERROR");
            throw error;
        }
    }
}
