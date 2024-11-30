import { defineConfig } from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";
import { DataListenerContext } from "./routes/_middleware.ts";

if (!Deno.args.includes("build")) {
  await DataListenerContext.init();
}

export default defineConfig({
  plugins: [tailwind()],
});
