import { parse } from "toml";

interface Config {
  node_ws_url: string;
  healthcheck_port: number;
  propagator: {
    updates_channel_name: string;
    prices_latest_key: string;
    updates_key: string;
  }
  nano_price_caller: {
    interval_ms: number;
    supported_currencies: string[];
  }
}

// Read and parse the TOML file
async function loadConfig() {
  const currentDir = new URL('.', import.meta.url).pathname;
  const configPath = `${currentDir}/config.toml`;
  const configText = await Deno.readTextFile(configPath);
  return parse(configText);
}

export const config = await loadConfig() as unknown as Config;