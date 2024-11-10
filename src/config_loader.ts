import { Config } from "https://deno.land/x/config/mod.ts"

export const PROJECT_ROOT = new URL("..", import.meta.url).pathname;


export const config = await Config.load({
    file: 'default.config',
    searchDir: PROJECT_ROOT
});

if (!config) {
    console.error(`Failed to load config file`);
    Deno.exit(1);
}