import type { McpServer } from "@modelcontextprotocol/server";

import { requestAuth } from "../auth/request.js";
import { listCategories } from "../services/categories.js";
import { jsonResult } from "./result.js";

export function registerCategoryTools(server: McpServer): void {
  server.registerTool(
    "anyrem_list_categories",
    {
      title: "List AnyRem Categories",
      description: "List note categories in AnyRem.",
    },
    async (ctx) => jsonResult(await listCategories(requestAuth(ctx))),
  );
}
