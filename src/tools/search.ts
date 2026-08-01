import type { McpServer } from "@modelcontextprotocol/server";

import { requestAuth } from "../auth/request.js";
import { searchNotesSchema } from "../schemas/search.js";
import { searchNotes } from "../services/search.js";
import { jsonResult } from "./result.js";

export function registerSearchTools(server: McpServer): void {
  server.registerTool(
    "anyrem_search_notes",
    {
      title: "Search AnyRem Notes",
      description: "Search AnyRem notes by text, category, pinned state, and sort.",
      inputSchema: searchNotesSchema,
    },
    async (input, ctx) => jsonResult(await searchNotes(input, requestAuth(ctx))),
  );
}
