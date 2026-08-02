import type { McpServer } from "@modelcontextprotocol/server";

import { requestAuth } from "../auth/request.js";
import { getSettings } from "../services/settings.js";
import { jsonResult } from "./result.js";

export function registerSettingsTools(server: McpServer): void {
  server.registerTool(
    "anyrem_get_settings",
    {
      title: "Get AnyRem Settings",
      description: "Get the current AnyRem user settings.",
    },
    async (ctx) => jsonResult(await getSettings(requestAuth(ctx))),
  );
}
