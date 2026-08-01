import type { McpServer } from "@modelcontextprotocol/server";

import { registerCategoryTools } from "./categories.js";
import { registerHealthTools } from "./health.js";
import { registerSearchTools } from "./search.js";
import { registerSettingsTools } from "./settings.js";

export function registerTools(server: McpServer): void {
  registerHealthTools(server);
  registerSettingsTools(server);
  registerCategoryTools(server);
  registerSearchTools(server);
}
