import { Config, config as configFile } from "./config_file.ts";

// Read and parse the TOML file
// async function loadConfig() {
//   const currentDir = new URL(".", import.meta.url).pathname;
//   const configPath = `${currentDir}/config.toml`;
//   const configText = await Deno.readTextFile(configPath);
//   return parse(configText);
// }

export const config = configFile as Config;
