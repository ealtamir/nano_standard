import { parse } from "toml";

interface Config {
  node_ws_url: string;
  healthcheck_port: number;
  propagator: {
    range_5m: string;
    range_1h: string;
    range_1d: string;

    median_5m: string;
    median_1h: string;
    median_1d: string;

    updates_channel_name: string;
    prices_channel_name: string;
    prices_latest_key: string;
    updates_key: string;

    nano_volume_5m_key: string;
    nano_volume_1h_key: string;
    nano_volume_1d_key: string;

    nano_prices_5m_key: string;
    nano_prices_1h_key: string;
    nano_prices_1d_key: string;

    nano_confirmations_5m_key: string;
    nano_confirmations_1h_key: string;
    nano_confirmations_1d_key: string;

    nano_unique_accounts_5m_key: string;
    nano_unique_accounts_1h_key: string;
    nano_unique_accounts_1d_key: string;

    nano_bucket_distribution_5m_key: string;
    nano_bucket_distribution_1h_key: string;
    nano_bucket_distribution_1d_key: string;
  };
  nano_price_caller: {
    interval_ms: number;
    supported_currencies: string[];
  };
}

// Read and parse the TOML file
async function loadConfig() {
  const currentDir = new URL(".", import.meta.url).pathname;
  const configPath = `${currentDir}/config.toml`;
  const configText = await Deno.readTextFile(configPath);
  return parse(configText);
}

export const config = await loadConfig() as unknown as Config;
