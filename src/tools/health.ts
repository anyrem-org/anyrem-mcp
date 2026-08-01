import type { McpServer } from "@modelcontextprotocol/server";

import { requestAuth } from "../auth/request.js";
import { getAnyRemHealth } from "../services/health.js";
import { jsonResult } from "./result.js";

export function registerHealthTools(server: McpServer): void {
  server.registerTool(
    "anyrem_health",
    {
      title: "AnyRem Health",
      description: "Check AnyRem backend health through the configured API.",
    },
    async (ctx) => jsonResult(await getAnyRemHealth(requestAuth(ctx))),
  );
}
