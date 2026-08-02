import type { z } from "zod";

import type { RequestAuth } from "../auth/request.js";
import type { searchNotesSchema } from "../schemas/search.js";
import { anyremGet } from "./anyrem-api.js";

type SearchNotesInput = z.infer<typeof searchNotesSchema>;

export function searchNotes(input: SearchNotesInput, auth?: RequestAuth): Promise<unknown> {
  return anyremGet("/api/mcp/search/notes", input, auth);
}
