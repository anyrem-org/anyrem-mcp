import type { RequestAuth } from "../auth/request.js";
import { anyremGet } from "./anyrem-api.js";

export function listCategories(auth?: RequestAuth): Promise<unknown> {
  return anyremGet("/api/mcp/categories", undefined, auth);
}
