import { Handlers, PageProps } from "$fresh/server.ts";
import Transactions from "../islands/Transactions.tsx";

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
      <Transactions wsProtocol={data.wsProtocol} />
    </div>
  );
}
