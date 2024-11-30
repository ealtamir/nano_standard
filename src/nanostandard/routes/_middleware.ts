import { FreshContext } from "$fresh/server.ts";
import { redis } from "../../db.ts";
import { DataListener } from "../data_listener.ts";

export interface State {
  dataListener: DataListener;
}

export class DataListenerContext {
  private static instance: DataListener;

  private constructor() {} // Prevent direct construction

  public static async init() {
    if (!DataListenerContext.instance) {
      DataListenerContext.instance = new DataListener(redis);
    }
    return DataListenerContext.instance;
  }

  public static getInstance(): DataListener {
    if (!DataListenerContext.instance) {
      throw new Error("DataListener is not initialized!");
    }
    return DataListenerContext.instance;
  }
}

export async function handler(
  _req: Request,
  ctx: FreshContext<State>,
) {
  // Initialize on first request if not already initialized
  if (ctx.destination === 'route') {
    ctx.state.dataListener = DataListenerContext.getInstance();
  }

  const resp = await ctx.next();
  return resp;
}
