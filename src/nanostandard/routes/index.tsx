import { Handlers, PageProps } from "$fresh/server.ts";
import Home from "../islands/Home.tsx";

interface PageData {
  wsProtocol: "ws" | "wss";
}

export const handler: Handlers<PageData> = {
  GET(req, ctx) {
    const isDevelopment = Deno.env.get("ENVIRONMENT") !== "production";
    const wsProtocol = isDevelopment ? "ws" : "wss";
    return ctx.render({ wsProtocol });
  },
};

export default function IndexApp({ data }: PageProps<PageData>) {
  return (
    <div>
      <Home wsProtocol={data.wsProtocol} />
    </div>
  );
}
